/// <reference lib="webworker" />
/**
 * Worker giữ Pyodide. Code của học sinh **chỉ** chạy ở đây (CLAUDE.md §2):
 * main thread không bao giờ `eval`.
 *
 * Timeout và `terminate()` do main thread lo (S0-07): worker không tự dừng
 * được vòng lặp vô hạn.
 */
import {
  PROTOCOL_VERSION,
  type GradedPayload,
  type RunnerRequest,
  type RunnerResponse,
} from './protocol';
import { PYODIDE_BASE_URL } from './pyodide-version';
// Chính file mà `npm run content:verify` chạy bằng CPython — một bản cài đặt,
// hai nơi chạy (docs/testing.md).
import graderSource from './grader.py?raw';

interface PyodideApi {
  runPython: (code: string) => unknown;
  globals: { get: (name: string) => unknown; set: (name: string, value: unknown) => void };
  runPythonAsync: (code: string) => Promise<unknown>;
  setStdout: (options: { batched: (text: string) => void }) => void;
  setStderr: (options: { batched: (text: string) => void }) => void;
  setStdin: (options: { stdin: () => string | null }) => void;
}

const post = (message: RunnerResponse) => {
  self.postMessage(message);
};

let pyodidePromise: Promise<PyodideApi> | null = null;

async function getPyodide(): Promise<PyodideApi> {
  pyodidePromise ??= (async () => {
    // Đường dẫn động: Vite không được gói Pyodide vào bundle, nó là file tĩnh tự host.
    const module = (await import(/* @vite-ignore */ `${PYODIDE_BASE_URL}pyodide.mjs`)) as {
      loadPyodide: (options: { indexURL: string }) => Promise<PyodideApi>;
    };
    const pyodide = await module.loadPyodide({ indexURL: PYODIDE_BASE_URL });
    // Mặc định Pyodide đọc stdin bằng `prompt()` của trình duyệt — trong worker
    // không có hàm đó nên sẽ ném ReferenceError. Luôn cho stdin rỗng; lệnh
    // `run` sẽ thay bằng stdin dựng sẵn của bài.
    pyodide.setStdin({ stdin: () => '' });
    return pyodide;
  })();
  return pyodidePromise;
}

async function handleInit(id: string): Promise<void> {
  const startedAt = performance.now();
  const pyodide = await getPyodide();
  const pythonVersion = String(pyodide.runPython('import sys; sys.version.split()[0]'));
  post({
    type: 'ready',
    id,
    payload: {
      protocolVersion: PROTOCOL_VERSION,
      pythonVersion,
      loadMs: Math.round(performance.now() - startedAt),
    },
  });
}

async function handleRun(id: string, code: string, stdin: string): Promise<void> {
  const loadStartedAt = performance.now();
  const pyodide = await getPyodide();
  // Báo trước khi chạy: đồng hồ của main thread chỉ đo code của trẻ, không đo
  // thời gian nạp Pyodide (máy yếu nạp cả chục giây là bình thường).
  post({
    type: 'started',
    id,
    payload: { loadedMs: Math.round(performance.now() - loadStartedAt) },
  });

  let stdout = '';
  let stderr = '';
  pyodide.setStdout({
    batched: (text) => {
      stdout += `${text}\n`;
      post({ type: 'stdout', id, payload: { text: `${text}\n` } });
    },
  });
  pyodide.setStderr({
    batched: (text) => {
      stderr += `${text}\n`;
      post({ type: 'stderr', id, payload: { text: `${text}\n` } });
    },
  });

  // `input()` đọc từng dòng của stdin dựng sẵn trong đề bài.
  const lines = stdin.length > 0 ? stdin.split('\n') : [];
  let lineIndex = 0;
  // Hết dòng thì trả `null` (EOF) → `input()` ném EOFError, đúng như CPython
  // khi chạy `content:verify`. Trả chuỗi rỗng mãi sẽ khiến `while input()` quay vô tận.
  pyodide.setStdin({ stdin: () => lines[lineIndex++] ?? null });

  const startedAt = performance.now();
  try {
    await pyodide.runPythonAsync(code);
  } catch (error) {
    post({
      type: 'error',
      id,
      payload: { kind: 'python', message: error instanceof Error ? error.message : String(error) },
    });
    return;
  }
  post({
    type: 'result',
    id,
    payload: { stdout, stderr, durationMs: Math.round(performance.now() - startedAt) },
  });
}

/**
 * Nạp grader.py vào Pyodide một lần, trả về hàm `grade_json(job) -> json`.
 *
 * Phải exec vào một module riêng chứ **không** `runPython(source)` thẳng:
 * `runPython` đặt `__name__ = "__main__"`, nên khối `if __name__ == "__main__"`
 * của grader.py sẽ chạy `main()` và ngồi đọc JSON từ stdin — treo luôn worker.
 */
let graderLoaded = false;
async function getGrader(): Promise<(jobJson: string) => string> {
  const pyodide = await getPyodide();
  if (!graderLoaded) {
    pyodide.globals.set('_grader_source', graderSource);
    pyodide.runPython(`
import types as _types
_grader_module = _types.ModuleType('lalacode_grader')
exec(_grader_source, _grader_module.__dict__)
grade_json = _grader_module.grade_json
del _grader_source
`);
    graderLoaded = true;
  }
  return pyodide.globals.get('grade_json') as (jobJson: string) => string;
}

async function handleGrade(id: string, code: string, tests: readonly unknown[]): Promise<void> {
  const loadStartedAt = performance.now();
  const gradeJson = await getGrader();
  post({
    type: 'started',
    id,
    payload: { loadedMs: Math.round(performance.now() - loadStartedAt) },
  });

  const startedAt = performance.now();
  // grader.py tự bắt stdout và lỗi của từng test, nên ở đây không cần try theo kiểu `run`.
  const report = JSON.parse(gradeJson(JSON.stringify({ code, tests }))) as Omit<
    GradedPayload,
    'durationMs'
  >;
  post({
    type: 'graded',
    id,
    payload: { ...report, durationMs: Math.round(performance.now() - startedAt) },
  });
}

self.onmessage = (event: MessageEvent<RunnerRequest>) => {
  const message = event.data;
  const fail = (error: unknown) =>
    post({
      type: 'error',
      id: message.id,
      payload: {
        kind: 'internal',
        message: error instanceof Error ? error.message : String(error),
      },
    });

  switch (message.type) {
    case 'init':
      handleInit(message.id).catch(fail);
      return;
    case 'run':
      handleRun(message.id, message.payload.code, message.payload.stdin ?? '').catch(fail);
      return;
    case 'grade':
      handleGrade(message.id, message.payload.code, message.payload.tests).catch(fail);
      return;
  }
};

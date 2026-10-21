/// <reference lib="webworker" />
/**
 * Worker giữ Pyodide. Code của học sinh **chỉ** chạy ở đây (CLAUDE.md §2):
 * main thread không bao giờ `eval`.
 *
 * Timeout và `terminate()` do main thread lo (S0-07): worker không tự dừng
 * được vòng lặp vô hạn.
 */
import { PROTOCOL_VERSION, type RunnerRequest, type RunnerResponse } from './protocol';
import { PYODIDE_BASE_URL } from './pyodide-version';

interface PyodideApi {
  runPython: (code: string) => unknown;
  runPythonAsync: (code: string) => Promise<unknown>;
  setStdout: (options: { batched: (text: string) => void }) => void;
  setStderr: (options: { batched: (text: string) => void }) => void;
  setStdin: (options: { stdin: () => string | null }) => void;
  globals: { get: (name: string) => unknown };
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
    return module.loadPyodide({ indexURL: PYODIDE_BASE_URL });
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
  const pyodide = await getPyodide();

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
  pyodide.setStdin({ stdin: () => lines[lineIndex++] ?? '' });

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
    case 'cancel':
      // Dừng thật sự là `terminate()` ở main thread (S0-07); ở đây chỉ báo đã nhận.
      post({ type: 'error', id: message.id, payload: { kind: 'internal', message: 'đã huỷ' } });
      return;
  }
};

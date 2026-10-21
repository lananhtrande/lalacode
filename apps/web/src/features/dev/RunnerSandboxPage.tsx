import { useEffect, useRef, useState } from 'react';
import { createRunner, type Runner } from '../../runner/runner-client';
import { runnerErrorMessage } from '../../runner/messages';
import { drawTurtleCommands } from '../../runner/turtle-canvas';
import type { DrawCommand } from '../../runner/protocol';

const CANVAS_SIZE = { width: 320, height: 320 };

/**
 * Trang thử runner — **chỉ có ở chế độ dev** (xem app/routes.tsx).
 * Màn bài tập thật là S0-11; trang này để e2e chạy Pyodide thật và để tự thử tay.
 * Vì vậy chữ ở đây không nằm trong i18n.
 */
export function RunnerSandboxPage() {
  const runnerRef = useRef<Runner | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [drawCount, setDrawCount] = useState(0);
  const [code, setCode] = useState('print("Xin chào, Python!")');
  const [stdin, setStdin] = useState('');
  const [timeoutMs, setTimeoutMs] = useState(5000);
  const [running, setRunning] = useState(false);
  const [testsJson, setTestsJson] = useState(
    '[{"type":"stdout_equals","expected":"Xin chào, Python!\\n","message":"Thử lại nhé em."}]',
  );
  const [status, setStatus] = useState('chưa nạp');
  const [output, setOutput] = useState('');

  useEffect(() => {
    const runner = createRunner();
    runnerRef.current = runner;
    return () => {
      runner.dispose();
      runnerRef.current = null;
    };
  }, []);

  async function preload() {
    setStatus('đang nạp Pyodide…');
    const ready = await runnerRef.current!.preload();
    setStatus(`sẵn sàng · Python ${ready.pythonVersion} · ${ready.loadMs} ms`);
  }

  function paint(commands: DrawCommand[]) {
    const context = canvasRef.current?.getContext('2d');
    if (!context) return;
    drawTurtleCommands(context, commands, CANVAS_SIZE);
    setDrawCount(commands.filter((command) => command.op === 'line').length);
  }

  async function run() {
    setOutput('');
    setStatus('đang chạy…');
    setRunning(true);
    const outcome = await runnerRef.current!.run(code, { stdin, timeoutMs });
    setRunning(false);
    paint(outcome.drawing);
    if (outcome.ok) {
      setOutput(outcome.result.stdout + outcome.result.stderr);
      setStatus(`xong trong ${outcome.result.durationMs} ms`);
    } else {
      setOutput(runnerErrorMessage(outcome.error));
      setStatus(`lỗi (${outcome.error.kind})`);
    }
  }

  async function grade() {
    setOutput('');
    setStatus('đang chấm…');
    try {
      setRunning(true);
      const outcome = await runnerRef.current!.grade(code, JSON.parse(testsJson) as unknown[], {
        timeoutMs,
      });
      setRunning(false);
      if (outcome.ok) {
        setOutput(
          outcome.report.results
            .map(
              (result) =>
                `test ${result.index + 1} (${result.type}): ${result.passed ? 'đạt' : 'chưa đạt'}` +
                (result.passed ? '' : ` — ${result.detail ?? ''} | ${result.message ?? ''}`),
            )
            .join('\n'),
        );
        setStatus(outcome.report.passed ? 'chấm xong: đạt hết' : 'chấm xong: chưa đạt');
      } else {
        setOutput(runnerErrorMessage(outcome.error));
        setStatus(`lỗi (${outcome.error.kind})`);
      }
    } catch (error) {
      // Thường là Test (JSON) gõ sai — trang nội bộ nên hiện thẳng lỗi.
      setRunning(false);
      setStatus('test JSON không đọc được');
      setOutput(String(error));
    }
  }

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Thử runner</h1>
      <p className="text-ink-muted">Trang nội bộ để kiểm tra Pyodide. Không có ở bản phát hành.</p>

      <label className="block">
        <span className="font-medium">Code</span>
        <textarea
          aria-label="Code Python"
          className="mt-1 block w-full rounded-lg border border-line p-2 font-mono text-sm"
          rows={6}
          value={code}
          onChange={(event) => setCode(event.target.value)}
        />
      </label>

      <label className="block">
        <span className="font-medium">stdin</span>
        <textarea
          aria-label="Dữ liệu stdin"
          className="mt-1 block w-full rounded-lg border border-line p-2 font-mono text-sm"
          rows={2}
          value={stdin}
          onChange={(event) => setStdin(event.target.value)}
        />
      </label>

      <label className="block">
        <span className="font-medium">Test (JSON)</span>
        <textarea
          aria-label="Test JSON"
          className="mt-1 block w-full rounded-lg border border-line p-2 font-mono text-sm"
          rows={3}
          value={testsJson}
          onChange={(event) => setTestsJson(event.target.value)}
        />
      </label>

      <label className="block">
        <span className="font-medium">Thời gian tối đa (ms)</span>
        <input
          aria-label="Thời gian tối đa"
          type="number"
          className="mt-1 block w-40 rounded-lg border border-line p-2"
          value={timeoutMs}
          onChange={(event) => setTimeoutMs(Number(event.target.value))}
        />
      </label>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => void preload()}
          className="min-h-tap rounded-xl border border-line px-4 font-semibold"
        >
          Nạp Pyodide
        </button>
        <button
          type="button"
          onClick={() => void run()}
          className="min-h-tap rounded-xl bg-brand-500 px-5 font-semibold text-white"
        >
          Chạy
        </button>
        <button
          type="button"
          onClick={() => void grade()}
          className="min-h-tap rounded-xl bg-brand-500 px-5 font-semibold text-white"
        >
          Chấm
        </button>
        <button
          type="button"
          disabled={!running}
          onClick={() => runnerRef.current?.cancel()}
          className="min-h-tap rounded-xl border border-line px-4 font-semibold disabled:opacity-50"
        >
          Dừng
        </button>
      </div>

      <p>
        Trạng thái: <span data-testid="runner-status">{status}</span>
      </p>
      <p>
        Số nét rùa vẽ: <span data-testid="runner-draw-count">{drawCount}</span>
      </p>
      <canvas
        ref={canvasRef}
        data-testid="runner-canvas"
        width={CANVAS_SIZE.width}
        height={CANVAS_SIZE.height}
        aria-label="Hình rùa vẽ"
        className="rounded-lg border border-line bg-surface"
      />
      <pre
        data-testid="runner-output"
        className="min-h-20 overflow-x-auto rounded-lg bg-surface-muted p-3 font-mono text-sm"
      >
        {output}
      </pre>
    </section>
  );
}

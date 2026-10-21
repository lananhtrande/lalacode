import { afterEach, describe, expect, it, vi as vitest } from 'vitest';
import { createRunner, DEFAULT_TIMEOUT_MS, LOAD_TIMEOUT_MS, MAX_TIMEOUT_MS } from './runner-client';
import {
  PROTOCOL_VERSION,
  isRunnerResponse,
  type RunnerRequest,
  type RunnerResponse,
} from './protocol';

/**
 * Worker giả: trả lời theo kịch bản, hoặc im lặng để giả cảnh `while True:`.
 * Pyodide thật được kiểm tra bằng e2e (`e2e/runner.spec.ts`).
 */
class FakeWorker extends EventTarget {
  readonly sent: RunnerRequest[] = [];
  terminated = false;

  constructor(
    private readonly reply: (request: RunnerRequest, send: (r: RunnerResponse) => void) => void,
  ) {
    super();
  }

  postMessage(message: RunnerRequest) {
    this.sent.push(message);
    this.reply(message, (response) => {
      if (this.terminated) return; // worker đã chết thì không nói nữa
      this.dispatchEvent(new MessageEvent('message', { data: response }));
    });
  }

  terminate() {
    this.terminated = true;
  }
}

const asWorker = (fake: FakeWorker) => fake as unknown as Worker;

/** Tạo runner kèm danh sách worker đã được dựng, để kiểm tra việc restart. */
function makeRunner(reply: (request: RunnerRequest, send: (r: RunnerResponse) => void) => void) {
  const workers: FakeWorker[] = [];
  const runner = createRunner(() => {
    const fake = new FakeWorker(reply);
    workers.push(fake);
    return asWorker(fake);
  });
  return { runner, workers };
}

const replyWithResult =
  (stdout: string) => (request: RunnerRequest, send: (r: RunnerResponse) => void) => {
    if (request.type === 'init') {
      send({
        type: 'ready',
        id: request.id,
        payload: { protocolVersion: PROTOCOL_VERSION, pythonVersion: '3.14.0', loadMs: 10 },
      });
    }
    if (request.type === 'run') {
      send({ type: 'stdout', id: request.id, payload: { text: stdout } });
      send({ type: 'result', id: request.id, payload: { stdout, stderr: '', durationMs: 3 } });
    }
  };

/** Đã nạp xong Pyodide rồi kẹt trong vòng lặp: báo `started` xong im luôn. */
const startsThenHangs = (request: RunnerRequest, send: (r: RunnerResponse) => void) => {
  if (request.type === 'run') send({ type: 'started', id: request.id, payload: { loadedMs: 0 } });
};

/** Không nói gì cả, kể cả `started`: giả cảnh nạp Pyodide bị treo. */
const neverReplies = () => {};

afterEach(() => vitest.useRealTimers());

describe('runner client — chạy bình thường', () => {
  it('preload trả về phiên bản Python và phiên bản giao thức', async () => {
    const { runner } = makeRunner(replyWithResult(''));
    await expect(runner.preload()).resolves.toMatchObject({
      pythonVersion: '3.14.0',
      protocolVersion: PROTOCOL_VERSION,
    });
  });

  it('gửi code và stdin, trả kết quả, stdout chảy về dần', async () => {
    const { runner, workers } = makeRunner(replyWithResult('Xin chào\n'));
    const chunks: string[] = [];
    const outcome = await runner.run('print("Xin chào")', {
      stdin: 'Lan\n',
      onOutput: (chunk) => chunks.push(chunk.text),
    });
    expect(workers[0]?.sent[0]).toMatchObject({
      type: 'run',
      payload: { code: 'print("Xin chào")', stdin: 'Lan\n' },
    });
    expect(chunks).toEqual(['Xin chào\n']);
    expect(outcome).toEqual({
      ok: true,
      result: { stdout: 'Xin chào\n', stderr: '', durationMs: 3 },
    });
  });

  it('lỗi Python trả về ok:false, không ném exception', async () => {
    const { runner } = makeRunner((request, send) => {
      if (request.type === 'run') {
        send({ type: 'started', id: request.id, payload: { loadedMs: 0 } });
        send({ type: 'error', id: request.id, payload: { kind: 'python', message: 'NameError' } });
      }
    });
    const outcome = await runner.run('print(ten)');
    expect(outcome).toMatchObject({ ok: false, error: { kind: 'python' } });
  });

  it('bỏ qua message của lần chạy khác (id không khớp)', async () => {
    const { runner } = makeRunner((request, send) => {
      if (request.type === 'run') {
        send({ type: 'started', id: request.id, payload: { loadedMs: 0 } });
        send({
          type: 'result',
          id: 'lan-khac',
          payload: { stdout: 'nhầm', stderr: '', durationMs: 1 },
        });
        send({
          type: 'result',
          id: request.id,
          payload: { stdout: 'đúng', stderr: '', durationMs: 1 },
        });
      }
    });
    const outcome = await runner.run('print(1)');
    expect(outcome.ok && outcome.result.stdout).toBe('đúng');
  });
});

describe('runner client — hết giờ và dựng lại worker', () => {
  it('vòng lặp vô hạn: hết giờ thì giết worker và trả về kind timeout', async () => {
    vitest.useFakeTimers();
    const { runner, workers } = makeRunner(startsThenHangs);
    const running = runner.run('while True: pass', { timeoutMs: 5000 });

    await vitest.advanceTimersByTimeAsync(4999);
    expect(workers[0]?.terminated).toBe(false);

    await vitest.advanceTimersByTimeAsync(1);
    const outcome = await running;
    expect(outcome).toMatchObject({ ok: false, error: { kind: 'timeout' } });
    expect(workers[0]?.terminated).toBe(true);
    expect(workers).toHaveLength(2); // đã dựng worker mới
  });

  it('sau khi hết giờ vẫn chạy được bài tiếp theo trên worker mới', async () => {
    vitest.useFakeTimers();
    let answer = false;
    const { runner, workers } = makeRunner((request, send) => {
      if (answer) {
        replyWithResult('2\n')(request, send);
        return;
      }
      // Lần chạy đầu: Pyodide sẵn sàng rồi nhưng code kẹt trong vòng lặp.
      startsThenHangs(request, send);
    });

    const first = runner.run('while True: pass', { timeoutMs: 1000 });
    await vitest.advanceTimersByTimeAsync(1000);
    expect((await first).ok).toBe(false);

    answer = true;
    const second = await runner.run('print(1 + 1)');
    expect(second.ok && second.result.stdout).toBe('2\n');
    expect(workers[1]?.terminated).toBe(false);
  });

  it('chạy xong đúng giờ thì không có restart muộn', async () => {
    vitest.useFakeTimers();
    const { runner, workers } = makeRunner(replyWithResult('ok\n'));
    await runner.run('print("ok")', { timeoutMs: 5000 });
    await vitest.advanceTimersByTimeAsync(60_000);
    expect(workers).toHaveLength(1);
    expect(workers[0]?.terminated).toBe(false);
  });

  it('kẹp thời gian chờ trong khoảng cho phép', async () => {
    vitest.useFakeTimers();
    const { runner, workers } = makeRunner(startsThenHangs);
    const running = runner.run('while True: pass', { timeoutMs: 999_999 });
    await vitest.advanceTimersByTimeAsync(MAX_TIMEOUT_MS);
    expect((await running).ok).toBe(false);
    expect(workers[0]?.terminated).toBe(true);
  });

  it('không khai timeout thì dùng mặc định 5 giây', async () => {
    vitest.useFakeTimers();
    const { runner, workers } = makeRunner(startsThenHangs);
    const running = runner.run('while True: pass');
    await vitest.advanceTimersByTimeAsync(DEFAULT_TIMEOUT_MS - 1);
    expect(workers[0]?.terminated).toBe(false);
    await vitest.advanceTimersByTimeAsync(1);
    expect((await running).ok).toBe(false);
  });

  it('thời gian nạp Pyodide không bị tính vào giờ chạy code', async () => {
    vitest.useFakeTimers();
    // Worker nạp Pyodide mất 20 giây rồi mới chạy code — lâu hơn hẳn 5 giây
    // dành cho code, nhưng đó không phải lỗi của trẻ.
    const { runner, workers } = makeRunner((request, send) => {
      if (request.type === 'run') {
        setTimeout(() => {
          send({ type: 'started', id: request.id, payload: { loadedMs: 20_000 } });
          send({
            type: 'result',
            id: request.id,
            payload: { stdout: 'ok\n', stderr: '', durationMs: 5 },
          });
        }, 20_000);
      }
    });

    const running = runner.run('print("ok")', { timeoutMs: 5000 });
    await vitest.advanceTimersByTimeAsync(20_000);
    expect(await running).toMatchObject({ ok: true });
    expect(workers[0]?.terminated).toBe(false);
  });

  it('nạp Pyodide treo hẳn thì báo lỗi nội bộ, không treo mãi', async () => {
    vitest.useFakeTimers();
    const { runner, workers } = makeRunner(neverReplies);
    const running = runner.run('print(1)');
    await vitest.advanceTimersByTimeAsync(LOAD_TIMEOUT_MS);
    expect(await running).toMatchObject({ ok: false, error: { kind: 'internal' } });
    expect(workers[0]?.terminated).toBe(true);
  });

  it('cancel() dừng lần chạy đang chờ và dựng worker mới', async () => {
    const { runner, workers } = makeRunner(startsThenHangs);
    const running = runner.run('while True: pass');
    runner.cancel();
    expect(await running).toMatchObject({ ok: false, error: { kind: 'cancelled' } });
    expect(workers[0]?.terminated).toBe(true);
    expect(workers).toHaveLength(2);
  });

  it('worker chết bất ngờ thì báo lỗi internal và dựng lại', async () => {
    const { runner, workers } = makeRunner(startsThenHangs);
    const running = runner.run('print(1)');
    workers[0]?.dispatchEvent(new ErrorEvent('error', { message: 'worker toang' }));
    expect(await running).toMatchObject({ ok: false, error: { kind: 'internal' } });
    expect(workers).toHaveLength(2);
  });

  it('dispose() đóng hẳn, không dựng worker mới', () => {
    const { runner, workers } = makeRunner(startsThenHangs);
    runner.dispose();
    expect(workers[0]?.terminated).toBe(true);
    expect(workers).toHaveLength(1);
  });
});

describe('isRunnerResponse', () => {
  it('nhận message đúng dạng', () => {
    expect(isRunnerResponse({ type: 'stdout', id: 'r1', payload: { text: 'a' } })).toBe(true);
  });

  it('từ chối message lạ hoặc thiếu trường', () => {
    expect(isRunnerResponse(null)).toBe(false);
    expect(isRunnerResponse({ type: 'khong-biet', id: 'r1', payload: {} })).toBe(false);
    expect(isRunnerResponse({ type: 'result', payload: {} })).toBe(false);
    expect(isRunnerResponse({ type: 'result', id: 'r1' })).toBe(false);
  });
});

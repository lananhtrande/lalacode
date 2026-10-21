import { describe, expect, it } from 'vitest';
import { createRunner } from './runner-client';
import {
  PROTOCOL_VERSION,
  isRunnerResponse,
  type RunnerRequest,
  type RunnerResponse,
} from './protocol';

/**
 * Worker giả: ghi lại message nhận được và trả lời theo kịch bản.
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
      this.dispatchEvent(new MessageEvent('message', { data: response }));
    });
  }

  terminate() {
    this.terminated = true;
  }
}

const asWorker = (fake: FakeWorker) => fake as unknown as Worker;

describe('runner client', () => {
  it('preload trả về phiên bản Python và phiên bản giao thức', async () => {
    const fake = new FakeWorker((request, send) => {
      if (request.type === 'init') {
        send({
          type: 'ready',
          id: request.id,
          payload: { protocolVersion: PROTOCOL_VERSION, pythonVersion: '3.14.0', loadMs: 1200 },
        });
      }
    });
    const runner = createRunner(() => asWorker(fake));
    await expect(runner.preload()).resolves.toMatchObject({ pythonVersion: '3.14.0' });
  });

  it('gửi code và stdin xuống worker, trả về kết quả', async () => {
    const fake = new FakeWorker((request, send) => {
      if (request.type === 'run') {
        send({ type: 'stdout', id: request.id, payload: { text: 'Xin chào\n' } });
        send({
          type: 'result',
          id: request.id,
          payload: { stdout: 'Xin chào\n', stderr: '', durationMs: 7 },
        });
      }
    });
    const runner = createRunner(() => asWorker(fake));
    const chunks: string[] = [];
    const outcome = await runner.run('print("Xin chào")', {
      stdin: 'Lan\n',
      onOutput: (chunk) => chunks.push(chunk.text),
    });

    expect(fake.sent[0]).toMatchObject({
      type: 'run',
      payload: { code: 'print("Xin chào")', stdin: 'Lan\n' },
    });
    expect(chunks).toEqual(['Xin chào\n']);
    expect(outcome).toEqual({
      ok: true,
      result: { stdout: 'Xin chào\n', stderr: '', durationMs: 7 },
    });
  });

  it('lỗi Python trả về ok:false kèm thông điệp, không ném exception', async () => {
    const fake = new FakeWorker((request, send) => {
      if (request.type === 'run') {
        send({
          type: 'error',
          id: request.id,
          payload: { kind: 'python', message: 'NameError: name `ten` is not defined' },
        });
      }
    });
    const runner = createRunner(() => asWorker(fake));
    const outcome = await runner.run('print(ten)');
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) expect(outcome.error.kind).toBe('python');
  });

  it('bỏ qua message của lần chạy khác (id không khớp)', async () => {
    const fake = new FakeWorker((request, send) => {
      if (request.type === 'run') {
        send({
          type: 'result',
          id: 'lan-chay-khac',
          payload: { stdout: 'nhầm', stderr: '', durationMs: 1 },
        });
        send({
          type: 'result',
          id: request.id,
          payload: { stdout: 'đúng', stderr: '', durationMs: 1 },
        });
      }
    });
    const runner = createRunner(() => asWorker(fake));
    const outcome = await runner.run('print(1)');
    expect(outcome.ok && outcome.result.stdout).toBe('đúng');
  });

  it('dispose thì worker bị terminate', () => {
    const fake = new FakeWorker(() => {});
    createRunner(() => asWorker(fake)).dispose();
    expect(fake.terminated).toBe(true);
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

import { afterEach, describe, expect, it, vi } from 'vitest';
import { askAiHint } from './hint-client';

const request = {
  exerciseId: 'py-khoi-dong.01-xin-chao.01-in-loi-chao',
  code: 'print("x")',
  hintLevel: 1 as const,
  token: '6f1c2f4a-9b55-4c21-9f0f-2b6c0a1d3e44',
};

afterEach(() => vi.unstubAllGlobals());

describe('gọi /api/hint', () => {
  it('trả về gợi ý khi server trả 200', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(new Response(JSON.stringify({ hint: 'Thử lệnh print nhé' })))),
    );
    await expect(askAiHint(request)).resolves.toEqual({ ok: true, hint: 'Thử lệnh print nhé' });
  });

  it('gửi đúng những trường được phép, không gửi gì thêm', async () => {
    const spy = vi.fn((_url: string, _init?: RequestInit) =>
      Promise.resolve(new Response(JSON.stringify({ hint: 'a' }))),
    );
    vi.stubGlobal('fetch', spy);
    await askAiHint({ ...request, error: 'NameError: ten' });

    const sentBody = spy.mock.calls[0]?.[1]?.body as string;
    const body = JSON.parse(sentBody) as Record<string, unknown>;
    expect(Object.keys(body).sort()).toEqual(['code', 'error', 'exerciseId', 'hintLevel', 'token']);
  });

  it('server báo hết lượt thì trả đúng lý do để UI nói cho đúng', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve(new Response(JSON.stringify({ error: 'qua-nhieu-luot' }), { status: 429 })),
      ),
    );
    await expect(askAiHint(request)).resolves.toEqual({ ok: false, reason: 'qua-nhieu-luot' });
  });

  it('AI đang tắt thì cũng là một lý do, không phải lỗi', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve(new Response(JSON.stringify({ error: 'ai-dang-tat' }), { status: 503 })),
      ),
    );
    await expect(askAiHint(request)).resolves.toMatchObject({ reason: 'ai-dang-tat' });
  });

  it('mất mạng thì trả về giá trị, **không ném**, để màn bài tập vẫn chạy', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new Error('mất mạng'))),
    );
    await expect(askAiHint(request)).resolves.toEqual({ ok: false, reason: 'mang-loi' });
  });

  it('server trả gợi ý rỗng thì coi như hỏng, không hiện ô trống cho trẻ', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(new Response(JSON.stringify({ hint: '   ' })))),
    );
    await expect(askAiHint(request)).resolves.toMatchObject({ ok: false });
  });

  it('server trả rác (không phải JSON) cũng không làm vỡ gì', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(new Response('<html>502</html>'))),
    );
    await expect(askAiHint(request)).resolves.toMatchObject({ ok: false });
  });
});

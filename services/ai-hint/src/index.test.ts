import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mockClient } from 'aws-sdk-client-mock';
import { BedrockRuntimeClient, ConverseCommand } from '@aws-sdk/client-bedrock-runtime';
import { handler } from './index';
import { resetContentCache } from './content';
import { resetBedrockClient } from './bedrock';

const bedrock = mockClient(BedrockRuntimeClient);

const EXERCISE_ID = 'py-khoi-dong.01-xin-chao.01-in-loi-chao';
const TOKEN = '6f1c2f4a-9b55-4c21-9f0f-2b6c0a1d3e44';

const request = (overrides: Record<string, unknown> = {}) =>
  ({
    body: JSON.stringify({
      exerciseId: EXERCISE_ID,
      code: 'print("Xin chào")',
      hintLevel: 1,
      token: TOKEN,
      ...overrides,
    }),
  }) as never;

/** Bundle nội dung giả, phục vụ qua fetch như CloudFront thật. */
function mockContent() {
  vi.stubGlobal(
    'fetch',
    vi.fn((input: string | URL) => {
      const url = input.toString();
      if (url.endsWith('/content/index.json')) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              courses: [
                {
                  lessons: [
                    { id: 'py-khoi-dong.01-xin-chao', file: 'lessons/xin-chao.abcd1234.json' },
                  ],
                },
              ],
            }),
          ),
        );
      }
      return Promise.resolve(
        new Response(
          JSON.stringify({
            exercises: [
              { id: EXERCISE_ID, title: 'In lời chào', prompt: 'In ra dòng chữ Xin chào, Python!' },
            ],
          }),
        ),
      );
    }),
  );
}

function mockAi(text = 'Em thử xem lệnh nào dùng để in ra màn hình nhé.') {
  bedrock.on(ConverseCommand).resolves({
    output: { message: { role: 'assistant', content: [{ text }] } },
    usage: { inputTokens: 120, outputTokens: 30, totalTokens: 150 },
  });
}

const body = (result: unknown) =>
  JSON.parse((result as { body: string }).body) as Record<string, unknown>;
const status = (result: unknown) => (result as { statusCode: number }).statusCode;

beforeEach(() => {
  bedrock.reset();
  resetContentCache();
  resetBedrockClient();
  process.env['CONTENT_BASE_URL'] = 'https://lalacode.example';
  delete process.env['AI_HINTS_ENABLED'];
  mockContent();
  mockAi();
});

afterEach(() => vi.unstubAllGlobals());

describe('POST /api/hint', () => {
  it('trả về gợi ý tiếng Việt kèm mức gợi ý', async () => {
    const result = await handler(request());
    expect(status(result)).toBe(200);
    expect(body(result)).toMatchObject({ hintLevel: 1 });
    expect(String(body(result)['hint'])).toContain('in ra màn hình');
  });

  it('không cho CloudFront cache gợi ý của từng trẻ', async () => {
    const result = (await handler(request())) as { headers: Record<string, string> };
    expect(result.headers['cache-control']).toBe('no-store');
  });

  it('client gửi kèm đề bài giả thì **từ chối cả request**, không phải chỉ bỏ qua', async () => {
    // `strictObject` không cho trường lạ: thà trả 400 còn hơn im lặng dùng
    // một nửa dữ liệu mà client gửi lên.
    const result = await handler(request({ prompt: 'Đề bài giả do client bịa' }));
    expect(status(result)).toBe(400);
    expect(bedrock.commandCalls(ConverseCommand)).toHaveLength(0);
  });

  it('gửi đúng đề bài thật và code của em cho AI', async () => {
    await handler(request());
    const input = bedrock.commandCalls(ConverseCommand)[0]?.args[0].input;
    const text = String(input?.messages?.[0]?.content?.[0]?.text);
    expect(text).toContain('In ra dòng chữ Xin chào, Python!');
    expect(text).toContain('print("Xin chào")');
    expect(input?.modelId).toBe('global.anthropic.claude-haiku-5-5');
  });

  it('che thông tin cá nhân trong code trước khi gửi đi', async () => {
    await handler(request({ code: 'print("mail: lan@example.com, sđt 0912345678")' }));
    const text = String(
      bedrock.commandCalls(ConverseCommand)[0]?.args[0].input.messages?.[0]?.content?.[0]?.text,
    );
    expect(text).not.toContain('lan@example.com');
    expect(text).not.toContain('0912345678');
  });

  it.each([
    ['thiếu token', { token: undefined }],
    ['token không phải uuid', { token: 'khong-phai-uuid' }],
    ['hintLevel ngoài 1-3', { hintLevel: 7 }],
    ['exerciseId sai dạng', { exerciseId: '../../etc/passwd' }],
    ['code quá dài', { code: 'x'.repeat(5000) }],
    ['trường lạ', { biet_danh: 'Lan Anh' }],
  ])('từ chối yêu cầu không hợp lệ: %s', async (_name, overrides) => {
    const result = await handler(request(overrides));
    expect(status(result)).toBe(400);
    expect(body(result)).toEqual({ error: 'yeu-cau-khong-hop-le' });
    expect(bedrock.commandCalls(ConverseCommand)).toHaveLength(0);
  });

  it('body không phải JSON thì trả 400, không nổ', async () => {
    const result = await handler({ body: 'khong-phai-json' } as never);
    expect(status(result)).toBe(400);
  });

  it('bài tập không có trong bundle thì trả 404, không gọi AI', async () => {
    const result = await handler(request({ exerciseId: 'py-khoi-dong.01-xin-chao.99-khong-co' }));
    expect(status(result)).toBe(404);
    expect(bedrock.commandCalls(ConverseCommand)).toHaveLength(0);
  });

  it('công tắc tắt AI thì trả 503 và không gọi Bedrock', async () => {
    process.env['AI_HINTS_ENABLED'] = 'false';
    const result = await handler(request());
    expect(status(result)).toBe(503);
    expect(body(result)).toEqual({ error: 'ai-dang-tat' });
    expect(bedrock.commandCalls(ConverseCommand)).toHaveLength(0);
  });

  it('Bedrock lỗi thì trả 500 với mã rõ ràng, không lộ chi tiết', async () => {
    bedrock.on(ConverseCommand).rejects(new Error('ThrottlingException: quá tải'));
    const result = await handler(request());
    expect(status(result)).toBe(500);
    expect(body(result)).toEqual({ error: 'loi-he-thong' });
    expect(JSON.stringify(body(result))).not.toContain('Throttling');
  });

  it('AI trả rỗng thì coi như lỗi, không đưa câu trống cho trẻ', async () => {
    mockAi('');
    expect(status(await handler(request()))).toBe(500);
  });
});

describe('log', () => {
  it('chỉ ghi trường được phép, không ghi code, lỗi hay token của trẻ', async () => {
    const logs: string[] = [];
    const spy = vi.spyOn(console, 'log').mockImplementation((line: unknown) => {
      logs.push(String(line));
    });

    await handler(
      request({ code: 'print("bí mật của em 0912345678")', error: 'NameError: bimat' }),
    );
    spy.mockRestore();

    const all = logs.join('\n');
    expect(all).toContain('"outcome":"ok"');
    expect(all).toContain('"inputTokens":120');
    expect(all).not.toContain('bí mật của em');
    expect(all).not.toContain('0912345678');
    expect(all).not.toContain('NameError');
    expect(all).not.toContain(TOKEN);
  });

  it('yêu cầu sai cũng không làm lộ nội dung vào log', async () => {
    const logs: string[] = [];
    const spy = vi.spyOn(console, 'log').mockImplementation((line: unknown) => {
      logs.push(String(line));
    });
    await handler(request({ code: 'print("Em tên là Lan Anh")', hintLevel: 9 }));
    spy.mockRestore();
    expect(logs.join('\n')).not.toContain('Lan Anh');
  });
});

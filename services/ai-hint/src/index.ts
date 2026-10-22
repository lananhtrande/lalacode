import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { askForHint } from './bedrock';
import { findExercise } from './content';
import { logHint } from './logger';
import { buildUserMessage } from './prompt';
import { sanitizeForAi } from './sanitize';
import { hintRequestSchema, MAX_CODE_LENGTH, MAX_ERROR_LENGTH, type HintErrorCode } from './schema';

/**
 * Handler mỏng (docs/conventions.md §Lambda): mọi logic nằm ở hàm thuần bên
 * cạnh. Ở đây chỉ nối chúng lại và quyết định mã HTTP.
 */

const STATUS: Record<HintErrorCode, number> = {
  'yeu-cau-khong-hop-le': 400,
  'khong-co-bai-tap': 404,
  'ai-dang-tat': 503,
  'qua-nhieu-luot': 429,
  'loi-he-thong': 500,
};

function reply(code: HintErrorCode): APIGatewayProxyResultV2 {
  return {
    statusCode: STATUS[code],
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ error: code }),
  };
}

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  const startedAt = Date.now();
  const done = (outcome: string, extra: Record<string, unknown> = {}) =>
    logHint({ outcome, durationMs: Date.now() - startedAt, ...extra });

  // Công tắc tắt AI: frontend sẽ quay về gợi ý viết sẵn trong bài.
  if (process.env['AI_HINTS_ENABLED'] === 'false') {
    done('ai-dang-tat');
    return reply('ai-dang-tat');
  }

  let body: unknown;
  try {
    body = JSON.parse(event.body ?? '');
  } catch {
    done('body-khong-doc-duoc');
    return reply('yeu-cau-khong-hop-le');
  }

  const parsed = hintRequestSchema.safeParse(body);
  if (!parsed.success) {
    // Cố ý không log chi tiết lỗi zod: nó chứa giá trị người dùng gửi lên.
    done('yeu-cau-khong-hop-le');
    return reply('yeu-cau-khong-hop-le');
  }
  const request = parsed.data;

  const baseUrl = process.env['CONTENT_BASE_URL'];
  if (baseUrl === undefined || baseUrl === '') {
    done('thieu-cau-hinh');
    return reply('loi-he-thong');
  }

  try {
    const exercise = await findExercise(request.exerciseId, baseUrl);
    if (!exercise) {
      done('khong-co-bai-tap', { exerciseId: request.exerciseId });
      return reply('khong-co-bai-tap');
    }

    const code = sanitizeForAi(request.code, MAX_CODE_LENGTH);
    const error = sanitizeForAi(request.error ?? '', MAX_ERROR_LENGTH);

    const reply_ = await askForHint(buildUserMessage(request, exercise, code.text, error.text));

    if (reply_.text === '') {
      done('ai-tra-rong', { exerciseId: request.exerciseId, hintLevel: request.hintLevel });
      return reply('loi-he-thong');
    }

    done('ok', {
      exerciseId: request.exerciseId,
      hintLevel: request.hintLevel,
      inputTokens: reply_.usage.inputTokens,
      outputTokens: reply_.usage.outputTokens,
      redacted: code.redacted || error.redacted,
    });

    return {
      statusCode: 200,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        // Gợi ý theo từng trẻ, từng lần — không cho CloudFront giữ lại.
        'cache-control': 'no-store',
      },
      body: JSON.stringify({ hint: reply_.text, hintLevel: request.hintLevel }),
    };
  } catch {
    // Không log lỗi nguyên văn: nó có thể kèm theo nội dung request.
    done('loi-he-thong', { exerciseId: request.exerciseId });
    return reply('loi-he-thong');
  }
};

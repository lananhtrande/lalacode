import type { HintErrorCode } from './hint-types';

/**
 * Gọi `/api/hint` — cùng domain, đi qua CloudFront tới Lambda (kiến trúc §4).
 *
 * Mọi lỗi đều trả về **giá trị**, không ném: hỏng gì thì màn bài tập vẫn phải
 * dùng được, chỉ là quay về gợi ý viết sẵn trong bài.
 */

export interface HintRequest {
  exerciseId: string;
  code: string;
  error?: string;
  hintLevel: 1 | 2 | 3;
  token: string;
}

export type HintOutcome =
  { ok: true; hint: string } | { ok: false; reason: HintErrorCode | 'mang-loi' };

const TIMEOUT_MS = 20_000;

export async function askAiHint(request: HintRequest): Promise<HintOutcome> {
  try {
    const response = await fetch('/api/hint', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      return { ok: false, reason: (body.error as HintErrorCode) ?? 'loi-he-thong' };
    }

    const body = (await response.json()) as { hint?: unknown };
    if (typeof body.hint !== 'string' || body.hint.trim() === '') {
      return { ok: false, reason: 'loi-he-thong' };
    }
    return { ok: true, hint: body.hint };
  } catch {
    // Mất mạng, hết giờ chờ, hoặc chưa deploy Lambda: đều về gợi ý viết sẵn.
    return { ok: false, reason: 'mang-loi' };
  }
}

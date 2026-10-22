import { useState } from 'react';
import { Lightbulb, Sparkles, TriangleAlert } from 'lucide-react';
import { vi } from '../../shared/i18n/vi';
import { RichText } from '../../shared/ui/RichText';
import { askAiHint } from './hint-client';
import type { HintErrorCode } from './hint-types';

/**
 * Gợi ý mở dần từng mức (CLAUDE.md §4): trẻ tự thử trước, mở từng bước, mức
 * cuối vẫn chỉ là ví dụ tương tự chứ không phải lời giải.
 *
 * Mỗi mức có hai nguồn: **trợ lý AI** và **gợi ý viết sẵn trong bài**. AI tắt,
 * hết lượt, hay mạng hỏng thì rơi về gợi ý viết sẵn — màn bài tập không bao
 * giờ phụ thuộc vào việc AI có sống hay không.
 */

export interface HintPanelProps {
  hints: readonly string[];
  exerciseId: string;
  /** Lấy code hiện tại lúc bấm, không phải lúc dựng component. */
  getCode: () => string;
  getError: () => string | undefined;
  /** Token ẩn danh; chưa có thì panel chỉ dùng gợi ý viết sẵn. */
  aiToken?: string;
}

const FALLBACK_MESSAGE: Record<HintErrorCode | 'mang-loi', string> = {
  'ai-dang-tat': vi.exercise.aiOff,
  'qua-nhieu-luot': vi.exercise.aiOutOfTurns,
  'het-han-muc-ngay': vi.exercise.aiBusyToday,
  'yeu-cau-khong-hop-le': vi.exercise.aiBroken,
  'khong-co-bai-tap': vi.exercise.aiBroken,
  'loi-he-thong': vi.exercise.aiBroken,
  'mang-loi': vi.exercise.aiBroken,
};

export function HintPanel({ hints, exerciseId, getCode, getError, aiToken }: HintPanelProps) {
  const [shown, setShown] = useState(0);
  const [aiHints, setAiHints] = useState<string[]>([]);
  const [asking, setAsking] = useState(false);
  const [fallbackNote, setFallbackNote] = useState('');

  if (hints.length === 0) return null;

  const level = Math.min(shown + 1, 3) as 1 | 2 | 3;
  const canAskMore = shown < hints.length;

  async function ask() {
    setAsking(true);
    setFallbackNote('');

    const outcome = aiToken
      ? await askAiHint({
          exerciseId,
          code: getCode(),
          hintLevel: level,
          token: aiToken,
          ...(getError() === undefined ? {} : { error: getError() as string }),
        })
      : ({ ok: false, reason: 'mang-loi' } as const);

    setAsking(false);
    if (outcome.ok) {
      setAiHints((current) => [...current, outcome.hint]);
    } else {
      setFallbackNote(FALLBACK_MESSAGE[outcome.reason]);
    }
    // Dù AI trả lời hay không, mức gợi ý viết sẵn cũng mở thêm một bước:
    // trẻ bấm xin giúp thì phải nhận được một cái gì đó.
    setShown((current) => Math.min(current + 1, hints.length));
  }

  return (
    <section aria-labelledby="goi-y" className="rounded-2xl border border-line p-4">
      <h2 id="goi-y" className="flex items-center gap-2 text-lg font-bold">
        <Lightbulb aria-hidden="true" className="size-5 text-accent-700" />
        {vi.exercise.hintsTitle}
      </h2>

      {shown === 0 && (
        <p
          className="mt-2 flex items-start gap-2 text-sm text-ink-muted"
          data-testid="hint-privacy"
        >
          <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-accent-700" />
          <span>{vi.exercise.privacyWarning}</span>
        </p>
      )}

      {aiHints.length > 0 && (
        <ol data-testid="ai-hints" className="mt-3 space-y-2">
          {aiHints.map((hint, index) => (
            <li key={`${index}-${hint.slice(0, 12)}`} className="rounded-xl bg-brand-50 p-3">
              <span className="flex items-center gap-1 text-sm font-semibold text-brand-700">
                <Sparkles aria-hidden="true" className="size-4" />
                {vi.exercise.aiLabel}
              </span>
              <p className="mt-1">{hint}</p>
            </li>
          ))}
        </ol>
      )}

      {fallbackNote !== '' && (
        <p role="status" data-testid="hint-fallback" className="mt-3 text-ink-muted">
          {fallbackNote}
        </p>
      )}

      {shown > 0 && (
        <ol data-testid="hint-list" className="mt-3 space-y-2">
          {hints.slice(0, shown).map((hint, index) => (
            <li key={hint}>
              <span className="font-medium">
                {vi.exercise.savedLabel} {index + 1}:
              </span>{' '}
              <RichText text={hint} />
            </li>
          ))}
        </ol>
      )}

      {canAskMore && (
        <button
          type="button"
          onClick={() => void ask()}
          disabled={asking}
          data-testid="hint-ask"
          className="mt-3 inline-flex min-h-tap items-center gap-2 rounded-xl border border-line px-4 font-semibold hover:bg-surface-muted disabled:opacity-60"
        >
          <Sparkles aria-hidden="true" className="size-4" />
          {asking ? vi.exercise.asking : shown === 0 ? vi.exercise.askAi : vi.exercise.askAiAgain}
        </button>
      )}
    </section>
  );
}

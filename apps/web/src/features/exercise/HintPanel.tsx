import { useState } from 'react';
import { Lightbulb } from 'lucide-react';
import { vi } from '../../shared/i18n/vi';
import { RichText } from '../../shared/ui/RichText';

/**
 * Gợi ý mở dần từng mức (CLAUDE.md §4): trẻ phải tự thử trước, mở từng bước
 * một, mức cuối cùng vẫn chỉ là ví dụ tương tự chứ không phải lời giải.
 * Gợi ý AI là S0-19; ở đây dùng gợi ý viết sẵn trong bài.
 */
export function HintPanel({ hints }: { hints: readonly string[] }) {
  const [shown, setShown] = useState(0);
  if (hints.length === 0) return null;

  return (
    <section aria-labelledby="goi-y" className="rounded-2xl border border-line p-4">
      <h2 id="goi-y" className="flex items-center gap-2 text-lg font-bold">
        <Lightbulb aria-hidden="true" className="size-5 text-accent-700" />
        {vi.exercise.hintsTitle}
      </h2>
      <ol data-testid="hint-list" className="mt-2 space-y-2">
        {hints.slice(0, shown).map((hint, index) => (
          <li key={hint}>
            <span className="font-medium">
              {vi.exercise.hintNumber} {index + 1}:
            </span>{' '}
            <RichText text={hint} />
          </li>
        ))}
      </ol>
      {shown < hints.length && (
        <button
          type="button"
          onClick={() => setShown((current) => current + 1)}
          className="mt-3 inline-flex min-h-tap items-center rounded-xl border border-line px-4 font-semibold hover:bg-surface-muted"
        >
          {shown === 0 ? vi.exercise.showHint : vi.exercise.nextHint}
        </button>
      )}
    </section>
  );
}

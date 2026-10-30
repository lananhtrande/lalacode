import { TriangleAlert } from 'lucide-react';
import type { RunErrorInfo } from '../../runner/messages';
import { vi } from '../../shared/i18n/vi';

/** Lỗi khi chạy code, nói bằng tiếng Việt và không mắng trẻ. */
export function ErrorPanel({ info }: { info: RunErrorInfo }) {
  return (
    <section
      role="alert"
      data-testid="exercise-error"
      className="rounded-card border border-attention/40 bg-attention-surface p-4"
    >
      <h2 className="flex items-center gap-2 text-card-title text-attention">
        <TriangleAlert aria-hidden="true" className="size-5 shrink-0" />
        {vi.exercise.errorTitle}
      </h2>
      <p className="mt-1">
        {info.title}
        {info.line !== undefined && (
          <span className="text-ink-soft">
            {' '}
            ({vi.exercise.errorLine} {info.line})
          </span>
        )}
      </p>
      {info.hint !== undefined && <p className="mt-1 text-ink-soft">{info.hint}</p>}
      {info.raw !== undefined && (
        <details className="mt-2">
          <summary className="cursor-pointer text-small text-ink-soft">{vi.exercise.showRaw}</summary>
          <pre className="mt-1 overflow-x-auto font-mono text-small">{info.raw}</pre>
        </details>
      )}
    </section>
  );
}

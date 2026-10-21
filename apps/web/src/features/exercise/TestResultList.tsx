import { Check, X } from 'lucide-react';
import type { TestResult } from '../../runner/protocol';
import { vi } from '../../shared/i18n/vi';
import { RichText } from '../../shared/ui/RichText';

/**
 * Kết quả từng test. Đúng/sai luôn kèm **icon và chữ**, không chỉ dựa vào màu
 * (docs/conventions.md §UI).
 */
export function TestResultList({ results }: { results: readonly TestResult[] }) {
  const passedAll = results.every((result) => result.passed);
  return (
    <section aria-labelledby="ket-qua-cham">
      <h2 id="ket-qua-cham" className="text-lg font-bold">
        {vi.exercise.testsTitle}
      </h2>
      <p className="mt-1 font-medium">
        {passedAll ? vi.exercise.allPassed : vi.exercise.somePassed}
      </p>
      <ol className="mt-3 space-y-2">
        {results.map((result) => (
          <li
            key={result.index}
            className={[
              'flex gap-3 rounded-xl border p-3',
              result.passed ? 'border-ok-500/40 bg-ok-500/5' : 'border-warn-500/40 bg-warn-500/5',
            ].join(' ')}
          >
            {result.passed ? (
              <Check aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-ok-500" />
            ) : (
              <X aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-warn-500" />
            )}
            <div>
              <p className="font-medium">
                {vi.exercise.testNumber} {result.index + 1}:{' '}
                {result.passed ? vi.exercise.testPassed : vi.exercise.testFailed}
              </p>
              {!result.passed && result.message !== null && (
                <p className="mt-1 text-ink-muted">
                  <RichText text={result.message} />
                </p>
              )}
              {!result.passed && result.detail !== null && (
                <p className="mt-1 font-mono text-sm break-words text-ink-muted">{result.detail}</p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

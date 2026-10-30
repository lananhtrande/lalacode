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
              result.passed ? 'border-success/40 bg-success-surface' : 'border-attention/40 bg-attention-surface',
            ].join(' ')}
          >
            {result.passed ? (
              <Check aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-success" />
            ) : (
              <X aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-attention" />
            )}
            <div>
              <p className="font-medium">
                {vi.exercise.testNumber} {result.index + 1}:{' '}
                {result.passed ? vi.exercise.testPassed : vi.exercise.testFailed}
              </p>
              {!result.passed && result.message !== null && (
                <p className="mt-1 text-ink-soft">
                  <RichText text={result.message} />
                </p>
              )}
              {!result.passed && result.detail !== null && (
                <p className="mt-1 font-mono text-sm break-words text-ink-soft">{result.detail}</p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

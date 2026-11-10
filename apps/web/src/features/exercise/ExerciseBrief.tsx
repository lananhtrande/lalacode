import type { ReactNode } from 'react';
import type { Difficulty } from '@lalakode/content-schema';
import type { PublicExercise } from '../../content/types';
import { vi } from '../../shared/i18n/vi';
import { BarsIcon } from '../../shared/ui/BarsIcon';
import { RichText } from '../../shared/ui/RichText';

const difficultyBars: Record<Difficulty, number> = { de: 1, vua: 2, kho: 3, 'thu-thach': 4 };

/** Độ khó: chữ + số cột tô, không phân biệt bằng màu (Dễ · Vừa · Khó · Thử thách). */
export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return (
    <span
      data-testid="difficulty"
      className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-0.5 text-small font-semibold text-ink-soft"
    >
      <BarsIcon filled={difficultyBars[difficulty]} total={4} />
      <span className="sr-only">{vi.exercise.difficultyLabel}: </span>
      {vi.exercise.difficulty[difficulty]}
    </span>
  );
}

/**
 * Cột đề bài của màn bài thực hành (S0-39): độ khó → tiêu đề → đề → "Yêu cầu" →
 * "Ví dụ" → gợi ý (truyền vào qua `children`). Code inline dùng nền nhạt như
 * thân bài học, **không tô đỏ**.
 */
export function ExerciseBrief({
  exercise,
  children,
}: {
  exercise: PublicExercise;
  children?: ReactNode;
}) {
  const { difficulty, requirements = [], examples = [] } = exercise;
  return (
    <div className="space-y-5">
      <div>
        {difficulty && <DifficultyBadge difficulty={difficulty} />}
        <h1 className="mt-2 text-section-title sm:text-page-title">{exercise.title}</h1>
        <p id="de-bai" className="mt-2 whitespace-pre-line">
          <RichText text={exercise.prompt} />
        </p>
      </div>

      {requirements.length > 0 && (
        <section aria-labelledby="yeu-cau">
          <h2 id="yeu-cau" className="text-card-title">
            {vi.exercise.requirementsTitle}
          </h2>
          <ul className="mt-2 list-disc space-y-1 pl-6" data-testid="requirements">
            {requirements.map((item) => (
              <li key={item}>
                <RichText text={item} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {examples.length > 0 && (
        <section aria-labelledby="vi-du">
          <h2 id="vi-du" className="text-card-title">
            {vi.exercise.examplesTitle}
          </h2>
          <ol className="mt-2 space-y-3" data-testid="examples">
            {examples.map((example, index) => (
              <li key={index} className="overflow-hidden rounded-card bg-code-bg text-code-text">
                <p className="bg-code-gutter px-4 py-1.5 text-small font-semibold">
                  {vi.exercise.exampleNumber} {index + 1}
                </p>
                <dl className="space-y-2 px-4 py-3">
                  {example.input !== undefined && (
                    <div>
                      <dt className="text-small text-code-muted">{vi.exercise.exampleInput}</dt>
                      <dd className="font-mono whitespace-pre-wrap">{example.input.trimEnd()}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-small text-code-muted">{vi.exercise.exampleOutput}</dt>
                    <dd className="font-mono whitespace-pre-wrap">{example.output}</dd>
                  </div>
                </dl>
                {example.note && (
                  <p className="border-t border-code-gutter px-4 py-2 text-small text-code-muted">
                    {example.note}
                  </p>
                )}
              </li>
            ))}
          </ol>
        </section>
      )}

      {children}
    </div>
  );
}

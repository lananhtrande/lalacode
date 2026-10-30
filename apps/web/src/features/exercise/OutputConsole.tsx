import { vi } from '../../shared/i18n/vi';

/** "Kết quả chạy": console nền tối, cùng bảng màu với editor (docs/design-system.md). */
export function OutputConsole({ output }: { output: string }) {
  return (
    <section
      aria-labelledby="ket-qua-chay"
      className="overflow-hidden rounded-card bg-code-bg text-code-text shadow-card"
    >
      <h2 id="ket-qua-chay" className="bg-code-gutter px-4 py-2 text-label">
        {vi.exercise.outputTitle}
      </h2>
      <pre
        data-testid="exercise-output"
        className={[
          'min-h-20 overflow-x-auto px-4 py-3 font-mono text-[15px] leading-relaxed whitespace-pre-wrap',
          output ? '' : 'text-code-muted',
        ].join(' ')}
      >
        {output || vi.exercise.outputEmpty}
      </pre>
    </section>
  );
}

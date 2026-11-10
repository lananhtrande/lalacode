import type { CourseLevel } from '@lalakode/content-schema';
import { vi } from '../i18n/vi';

const filledBars = { 'moi-bat-dau': 1, 'co-ban': 2, 'nang-cao': 3 } as const;

/**
 * Cấp độ khoá học: ba cột cao dần, tô đặc số cột bằng cấp độ, kèm chữ. Không
 * dùng màu để phân biệt cấp độ (docs/design-system.md, nguyên tắc 2).
 */
export function LevelBadge({ level }: { level: CourseLevel }) {
  const filled = filledBars[level];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-0.5 text-small font-semibold text-ink-soft">
      <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4">
        {[0, 1, 2].map((bar) => (
          <rect
            key={bar}
            x={1 + bar * 5}
            y={10 - bar * 4}
            width={4}
            height={5 + bar * 4}
            rx={1}
            fill={bar < filled ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth={1.25}
          />
        ))}
      </svg>
      {vi.catalog.level[level]}
    </span>
  );
}

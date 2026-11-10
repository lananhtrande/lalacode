import type { CourseLevel } from '@lalakode/content-schema';
import { vi } from '../i18n/vi';
import { BarsIcon } from './BarsIcon';

const filledBars = { 'moi-bat-dau': 1, 'co-ban': 2, 'nang-cao': 3 } as const;

/**
 * Cấp độ khoá học: ba cột cao dần, tô đặc số cột bằng cấp độ, kèm chữ. Không
 * dùng màu để phân biệt cấp độ (docs/design-system.md, nguyên tắc 2).
 */
export function LevelBadge({ level }: { level: CourseLevel }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-0.5 text-small font-semibold text-ink-soft">
      <BarsIcon filled={filledBars[level]} total={3} />
      {vi.catalog.level[level]}
    </span>
  );
}

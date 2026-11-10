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
    <span className="inline-flex h-5.5 items-center gap-1.5 rounded-md bg-accent-soft px-2 text-meta text-accent-strong">
      <BarsIcon filled={filledBars[level]} total={3} />
      {vi.catalog.level[level]}
    </span>
  );
}

import { Flame } from 'lucide-react';
import { vi } from '../../shared/i18n/vi';

/** Chuỗi ngày học. Chưa có chuỗi thì mời chứ không chê. */
export function StreakBanner({ days }: { days: number }) {
  if (days <= 0) {
    return (
      <p data-testid="streak" className="rounded-2xl bg-surface-muted p-4 text-ink-soft">
        {vi.streak.none}
      </p>
    );
  }
  return (
    <p
      data-testid="streak"
      className="flex items-center gap-2 rounded-2xl bg-accent-soft p-4 font-medium text-accent-strong"
    >
      <Flame aria-hidden="true" className="size-5" />
      <span>
        {days} {vi.streak.days} · {vi.streak.keepGoing}
      </span>
    </p>
  );
}

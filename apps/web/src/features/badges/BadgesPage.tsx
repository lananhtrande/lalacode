import { Award, Lock } from 'lucide-react';
import { Link } from 'react-router';
import { useProgress } from '../../progress/useProgress';
import { vi } from '../../shared/i18n/vi';

export function BadgesPage() {
  const { badges, loading } = useProgress();
  const earnedCount = badges.filter((badge) => badge.earned).length;

  return (
    <section>
      <h1 className="text-2xl font-bold sm:text-3xl">{vi.badges.title}</h1>
      <p className="mt-2 text-ink-muted">{vi.badges.lead}</p>
      {!loading && (
        <p className="mt-1 font-medium" data-testid="badge-count">
          {earnedCount}/{badges.length} {vi.badges.countEarned}
        </p>
      )}

      <Link
        to="/tien-do"
        className="mt-3 inline-flex min-h-tap items-center font-semibold text-brand-600 underline"
      >
        {vi.progressCode.title}
      </Link>

      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {badges.map((badge) => {
          const text = vi.badges.items[badge.id];
          return (
            <li
              key={badge.id}
              data-testid={`badge-${badge.id}`}
              className={[
                'flex gap-3 rounded-2xl border p-4',
                badge.earned ? 'border-accent-500 bg-accent-100/40' : 'border-line',
              ].join(' ')}
            >
              {badge.earned ? (
                <Award aria-hidden="true" className="mt-0.5 size-6 shrink-0 text-accent-700" />
              ) : (
                <Lock aria-hidden="true" className="mt-0.5 size-6 shrink-0 text-ink-muted" />
              )}
              <div>
                <h2 className="font-semibold">{text.name}</h2>
                <p className="text-ink-muted">{text.how}</p>
                <p className="mt-1 text-sm font-medium">
                  {badge.earned ? (
                    vi.badges.earned
                  ) : (
                    <span className="text-ink-muted">
                      {vi.badges.locked} · {vi.badges.progress} {badge.progress}/{badge.goal}
                    </span>
                  )}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

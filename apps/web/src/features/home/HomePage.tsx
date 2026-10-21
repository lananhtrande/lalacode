import { Link } from 'react-router';
import { CircleCheckBig, Laptop, Palette, ShieldCheck } from 'lucide-react';
import { vi } from '../../shared/i18n/vi';

// Icon đi kèm từng điểm mạnh; thứ tự khớp với vi.home.points.
const icons = [Laptop, CircleCheckBig, Palette, ShieldCheck];

export function HomePage() {
  return (
    <>
      <section className="mx-auto max-w-prose text-center">
        <h1 className="text-3xl font-bold text-balance sm:text-4xl">{vi.home.heroTitle}</h1>
        <p className="mt-4 text-lg text-ink-muted">{vi.home.heroLead}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            to="/ban-do"
            className="inline-flex min-h-tap items-center rounded-xl bg-brand-500 px-6 font-semibold text-white hover:bg-brand-600"
          >
            {vi.home.startLearning}
          </Link>
          <Link
            to="/ban-do"
            className="inline-flex min-h-tap items-center rounded-xl border border-line px-6 font-semibold hover:bg-surface-muted"
          >
            {vi.home.seeMap}
          </Link>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-center text-2xl font-bold">{vi.home.pointsTitle}</h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {vi.home.points.map((point, index) => {
            const Icon = icons[index] ?? Laptop;
            return (
              <li key={point.title} className="rounded-2xl border border-line bg-surface-muted p-5">
                <Icon aria-hidden="true" className="size-7 text-brand-600" />
                <h3 className="mt-3 text-lg font-semibold">{point.title}</h3>
                <p className="mt-1 text-ink-muted">{point.body}</p>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-12 rounded-2xl border border-line p-6 text-center">
        <h2 className="text-xl font-bold">{vi.home.forParentsTitle}</h2>
        <p className="mx-auto mt-2 max-w-prose text-ink-muted">{vi.home.forParentsBody}</p>
        <Link
          to="/gioi-thieu"
          className="mt-4 inline-flex min-h-tap items-center font-semibold text-brand-600 underline"
        >
          {vi.home.forParentsLink}
        </Link>
      </section>
    </>
  );
}

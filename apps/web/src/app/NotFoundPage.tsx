import { Link } from 'react-router';
import { vi } from '../shared/i18n/vi';

export function NotFoundPage() {
  return (
    <section className="mx-auto max-w-prose text-center">
      <h1 className="text-2xl font-bold sm:text-3xl">{vi.notFound.title}</h1>
      <p className="mt-3 text-ink-muted">{vi.notFound.body}</p>
      <Link
        to="/"
        className="mt-6 inline-flex min-h-tap items-center rounded-xl bg-brand-500 px-5 font-semibold text-white hover:bg-brand-600"
      >
        {vi.comingSoon.backHome}
      </Link>
    </section>
  );
}

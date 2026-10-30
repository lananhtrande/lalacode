import { Link } from 'react-router';
import { vi } from '../shared/i18n/vi';
import { buttonClasses } from '../shared/ui/button-classes';

export function NotFoundPage() {
  return (
    <section className="mx-auto max-w-prose text-center">
      <h1 className="text-2xl font-bold sm:text-3xl">{vi.notFound.title}</h1>
      <p className="mt-3 text-ink-soft">{vi.notFound.body}</p>
      <Link
        to="/"
        className={buttonClasses('primary', 'md', 'mt-6')}
      >
        {vi.comingSoon.backHome}
      </Link>
    </section>
  );
}

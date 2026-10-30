import { Link } from 'react-router';
import { vi } from '../i18n/vi';
import { buttonClasses } from './button-classes';

/** Khung tạm cho các trang chưa làm xong, để router và điều hướng chạy được sớm. */
export function ComingSoon({ title }: { title: string }) {
  return (
    <section className="mx-auto max-w-prose text-center">
      <p className="inline-block rounded-full bg-accent-soft px-3 py-1 text-sm font-medium text-accent-strong">
        {vi.comingSoon.badge}
      </p>
      <h1 className="mt-4 text-2xl font-bold sm:text-3xl">{title}</h1>
      <p className="mt-3 text-ink-soft">{vi.comingSoon.body}</p>
      <Link
        to="/"
        className={buttonClasses('primary', 'md', 'mt-6')}
      >
        {vi.comingSoon.backHome}
      </Link>
    </section>
  );
}

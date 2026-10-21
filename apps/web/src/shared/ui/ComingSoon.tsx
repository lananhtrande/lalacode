import { Link } from 'react-router';
import { vi } from '../i18n/vi';

/** Khung tạm cho các trang chưa làm xong, để router và điều hướng chạy được sớm. */
export function ComingSoon({ title }: { title: string }) {
  return (
    <section className="mx-auto max-w-prose text-center">
      <p className="inline-block rounded-full bg-accent-100 px-3 py-1 text-sm font-medium text-accent-700">
        {vi.comingSoon.badge}
      </p>
      <h1 className="mt-4 text-2xl font-bold sm:text-3xl">{title}</h1>
      <p className="mt-3 text-ink-muted">{vi.comingSoon.body}</p>
      <Link
        to="/"
        className="mt-6 inline-flex min-h-tap items-center rounded-xl bg-brand-500 px-5 font-semibold text-white hover:bg-brand-600"
      >
        {vi.comingSoon.backHome}
      </Link>
    </section>
  );
}

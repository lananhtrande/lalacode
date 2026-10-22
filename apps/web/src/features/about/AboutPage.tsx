import { Link } from 'react-router';
import { BookOpenCheck, CircleCheckBig, Palette, RefreshCcw } from 'lucide-react';
import { vi } from '../../shared/i18n/vi';

// Thứ tự khớp với vi.about.how.
const icons = [BookOpenCheck, CircleCheckBig, RefreshCcw, Palette];

/**
 * Trang cho phụ huynh đọc trước khi cho con dùng. Cố ý nói cả những chỗ còn
 * thiếu (nội dung bản nháp, mất tiến độ khi đổi máy) — bố mẹ tin một trang
 * thừa nhận giới hạn hơn là một trang chỉ khoe.
 */
export function AboutPage() {
  return (
    <div className="mx-auto max-w-prose">
      <section>
        <h1 className="text-2xl font-bold sm:text-3xl">{vi.about.title}</h1>
        <p className="mt-3 text-lg text-ink-muted">{vi.about.lead}</p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold">{vi.about.howTitle}</h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          {vi.about.how.map((item, index) => {
            const Icon = icons[index] ?? BookOpenCheck;
            return (
              <li key={item.title} className="rounded-2xl border border-line bg-surface-muted p-5">
                <Icon aria-hidden="true" className="size-7 text-brand-600" />
                <h3 className="mt-3 text-lg font-semibold">{item.title}</h3>
                <p className="mt-1 text-ink-muted">{item.body}</p>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold">{vi.about.pythonTitle}</h2>
        <p className="mt-2 text-ink-muted">{vi.about.pythonBody}</p>
      </section>

      <section className="mt-10 rounded-2xl border border-line p-6">
        <h2 className="text-xl font-bold">{vi.about.stageTitle}</h2>
        <p className="mt-2 text-ink-muted">{vi.about.stageBody}</p>
        <p className="mt-2 text-ink-muted">{vi.about.stageHonest}</p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold">{vi.about.parentsTitle}</h2>
        <p className="mt-2 text-ink-muted">{vi.about.parentsBody}</p>
        <Link
          to="/bao-cao"
          className="mt-2 inline-flex min-h-tap items-center font-semibold text-brand-600 underline"
        >
          {vi.about.parentsLink}
        </Link>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold">{vi.about.contactTitle}</h2>
        <p className="mt-2 text-ink-muted">{vi.about.contactBody}</p>
      </section>

      <section className="mt-10">
        <Link
          to="/quyen-rieng-tu"
          className="inline-flex min-h-tap items-center rounded-xl bg-brand-500 px-5 font-semibold text-white hover:bg-brand-600"
        >
          {vi.about.privacyLink}
        </Link>
      </section>
    </div>
  );
}

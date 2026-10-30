import { Link } from 'react-router';
import { BookOpenCheck, CircleCheckBig, Palette, RefreshCcw } from 'lucide-react';
import { vi } from '../../shared/i18n/vi';
import { buttonClasses } from '../../shared/ui/button-classes';

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
        <h1 className="text-page-title">{vi.about.title}</h1>
        <p className="mt-3 text-card-title font-normal text-ink-soft">{vi.about.lead}</p>
      </section>

      <section className="mt-10">
        <h2 className="text-section-title">{vi.about.howTitle}</h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          {vi.about.how.map((item, index) => {
            const Icon = icons[index] ?? BookOpenCheck;
            return (
              <li key={item.title} className="rounded-card border border-line bg-surface-muted p-5">
                <Icon aria-hidden="true" className="size-7 text-accent-strong" />
                <h3 className="mt-3 text-card-title">{item.title}</h3>
                <p className="mt-1 text-ink-soft">{item.body}</p>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-section-title">{vi.about.pythonTitle}</h2>
        <p className="mt-2 text-ink-soft">{vi.about.pythonBody}</p>
      </section>

      <section className="mt-10 rounded-card border border-line p-6">
        <h2 className="text-section-title">{vi.about.stageTitle}</h2>
        <p className="mt-2 text-ink-soft">{vi.about.stageBody}</p>
        <p className="mt-2 text-ink-soft">{vi.about.stageHonest}</p>
      </section>

      <section className="mt-10">
        <h2 className="text-section-title">{vi.about.parentsTitle}</h2>
        <p className="mt-2 text-ink-soft">{vi.about.parentsBody}</p>
        <Link
          to="/bao-cao"
          className="mt-2 inline-flex min-h-tap items-center font-semibold text-accent-strong underline"
        >
          {vi.about.parentsLink}
        </Link>
      </section>

      <section className="mt-10">
        <h2 className="text-section-title">{vi.about.contactTitle}</h2>
        <p className="mt-2 text-ink-soft">{vi.about.contactBody}</p>
        <a
          href={`mailto:${vi.app.contactEmail}`}
          className="mt-1 inline-flex min-h-tap items-center font-semibold text-accent-strong underline"
        >
          {vi.app.contactEmail}
        </a>
      </section>

      <section className="mt-10">
        <Link
          to="/quyen-rieng-tu"
          className={buttonClasses('primary', 'md')}
        >
          {vi.about.privacyLink}
        </Link>
      </section>
    </div>
  );
}

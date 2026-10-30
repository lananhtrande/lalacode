import { Link } from 'react-router';
import { vi } from '../../shared/i18n/vi';
import { buttonClasses } from '../../shared/ui/button-classes';

/**
 * Bản dịch của docs/privacy.md cho phụ huynh đọc. Hai chỗ **bắt buộc** giữ
 * nguyên tinh thần, đừng rút gọn cho đẹp: bộ lọc PII không bắt được tên viết
 * trơ trọi, và link báo cáo không có chữ ký. Sửa code liên quan thì sửa cả
 * trang này (xem checklist cuối docs/privacy.md).
 */
export function PrivacyPage() {
  return (
    <div className="mx-auto max-w-prose">
      <h1 className="text-2xl font-bold sm:text-3xl">{vi.privacy.title}</h1>
      <p className="mt-1 text-sm text-ink-soft">{vi.privacy.updated}</p>
      <p className="mt-4 text-lg">{vi.privacy.lead}</p>

      <section className="mt-10">
        <h2 className="text-xl font-bold">{vi.privacy.whereTitle}</h2>
        <p className="mt-2 text-ink-soft">{vi.privacy.whereIntro}</p>
        {/* Dạng thẻ chứ không phải bảng: trên điện thoại, cột "có rời khỏi máy
            không" là cột quan trọng nhất mà lại là cột bị đẩy ra ngoài màn hình. */}
        <ul data-testid="privacy-rows" className="mt-4 space-y-3">
          {vi.privacy.rows.map((row) => (
            <li key={row.what} className="rounded-2xl border border-line bg-surface-muted p-4">
              <p className="font-semibold">{row.what}</p>
              <dl className="mt-2 space-y-1 text-ink-soft">
                <div className="flex flex-wrap gap-x-2">
                  <dt className="font-medium">{vi.privacy.rowLabels.where}:</dt>
                  <dd>{row.where}</dd>
                </div>
                <div className="flex flex-wrap gap-x-2">
                  <dt className="font-medium">{vi.privacy.rowLabels.sent}</dt>
                  <dd>{row.sent}</dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold">{vi.privacy.noAccountTitle}</h2>
        <p className="mt-2 text-ink-soft">{vi.privacy.noAccountBody}</p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold">{vi.privacy.aiTitle}</h2>
        <p className="mt-2 text-ink-soft">{vi.privacy.aiBody}</p>
        <p className="mt-2 text-ink-soft">{vi.privacy.aiProvider}</p>
        <p className="mt-2 text-ink-soft">{vi.privacy.aiNoLog}</p>
        <p className="mt-2 text-ink-soft">{vi.privacy.aiNoSolution}</p>

        <h3 className="mt-6 text-lg font-semibold">{vi.privacy.aiFilterTitle}</h3>
        <p className="mt-2 text-ink-soft">{vi.privacy.aiFilterBody}</p>
        <p
          data-testid="privacy-filter-limit"
          className="mt-2 rounded-xl border border-accent bg-accent-soft p-4"
        >
          {vi.privacy.aiFilterLimit}
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold">{vi.privacy.notDoingTitle}</h2>
        <ul className="mt-2 list-disc space-y-2 pl-5 text-ink-soft">
          {vi.privacy.notDoing.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold">{vi.privacy.reportTitle}</h2>
        <p className="mt-2 text-ink-soft">{vi.privacy.reportBody}</p>
        <ul
          data-testid="privacy-report-limits"
          className="mt-2 list-disc space-y-2 pl-5 text-ink-soft"
        >
          {vi.privacy.reportLimits.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold">{vi.privacy.deleteTitle}</h2>
        <p className="mt-2 text-ink-soft">{vi.privacy.deleteBody}</p>
        <Link
          to="/tien-do"
          className={buttonClasses('primary', 'md', 'mt-3')}
        >
          {vi.privacy.deleteLink}
        </Link>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold">{vi.privacy.contactTitle}</h2>
        <p className="mt-2 text-ink-soft">{vi.privacy.contactBody}</p>
        <a
          href={`mailto:${vi.app.contactEmail}`}
          className="mt-1 inline-flex min-h-tap items-center font-semibold text-accent-strong underline"
        >
          {vi.app.contactEmail}
        </a>
        <p className="mt-2 text-ink-soft">{vi.privacy.contactNote}</p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold">{vi.privacy.lawTitle}</h2>
        <p className="mt-2 text-ink-soft">{vi.privacy.lawBody}</p>
      </section>

      <Link
        to="/gioi-thieu"
        className="mt-10 inline-flex min-h-tap items-center font-semibold text-accent-strong underline"
      >
        {vi.privacy.backToAbout}
      </Link>
    </div>
  );
}

import { Link } from 'react-router';
import { ArrowRight, CircleCheckBig, Laptop, Palette, ShieldCheck } from 'lucide-react';
import { fill } from '../../shared/i18n/fill';
import { vi } from '../../shared/i18n/vi';
import { buttonClasses } from '../../shared/ui/button-classes';
import { useCourses } from '../courses/useCourses';

// Icon đi kèm từng điểm mạnh; thứ tự khớp với vi.home.points.
const icons = [Laptop, CircleCheckBig, Palette, ShieldCheck];

export function HomePage() {
  const state = useCourses();
  // Đã học trên máy này thì nút chính đưa thẳng tới bài đang dở.
  const current =
    state.status === 'ready'
      ? state.courses.find((item) => item.progress.status === 'dang-hoc')?.progress.nextLesson
      : undefined;

  return (
    <>
      <section className="mx-auto max-w-prose text-center">
        <h1 className="text-page-title text-balance sm:text-[2.5rem] sm:leading-[3rem]">{vi.home.heroTitle}</h1>
        <p className="mt-4 text-card-title font-normal text-ink-soft">{vi.home.heroLead}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {current ? (
            <>
              <Link to={`/bai-hoc/${current.lesson.id}`} className={buttonClasses('primary', 'lg')}>
                {fill(vi.home.continueLesson, { n: current.number })}
                <ArrowRight aria-hidden="true" className="size-5" />
              </Link>
              <Link to="/khoa-hoc" className={buttonClasses('outline', 'lg')}>
                {vi.home.seeCourses}
              </Link>
            </>
          ) : (
            <Link to="/khoa-hoc" className={buttonClasses('primary', 'lg')}>
              {vi.home.startLearning}
            </Link>
          )}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-center text-section-title">{vi.home.pointsTitle}</h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {vi.home.points.map((point, index) => {
            const Icon = icons[index] ?? Laptop;
            return (
              <li key={point.title} className="rounded-card border border-line bg-surface-muted p-5">
                <Icon aria-hidden="true" className="size-7 text-accent-strong" />
                <h3 className="mt-3 text-card-title">{point.title}</h3>
                <p className="mt-1 text-ink-soft">{point.body}</p>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-12 rounded-card border border-line p-6 text-center">
        <h2 className="text-section-title">{vi.home.forParentsTitle}</h2>
        <p className="mx-auto mt-2 max-w-prose text-ink-soft">{vi.home.forParentsBody}</p>
        <Link
          to="/gioi-thieu"
          className="mt-4 inline-flex min-h-tap items-center font-semibold text-accent-strong underline"
        >
          {vi.home.forParentsLink}
        </Link>
      </section>
    </>
  );
}

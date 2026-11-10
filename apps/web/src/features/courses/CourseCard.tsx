import { ArrowRight, Clock } from 'lucide-react';
import { approximateDuration } from '../../content/catalog';
import { fill } from '../../shared/i18n/fill';
import { vi } from '../../shared/i18n/vi';
import { ButtonLink } from '../../shared/ui/ButtonLink';
import { LevelBadge } from '../../shared/ui/LevelBadge';
import { ProgressBar } from '../../shared/ui/ProgressBar';
import type { CourseWithProgress } from './useCourses';

/** Thời lượng ước tính của khoá: "20 bài · khoảng 5 giờ". */
export function courseMeta({ course, progress }: CourseWithProgress): string {
  const duration = approximateDuration(progress.totalMinutes);
  const about = fill(duration.unit === 'gio' ? vi.catalog.aboutHours : vi.catalog.aboutMinutes, {
    n: duration.value,
  });
  return `${course.lessons.length} ${vi.catalog.lessons} · ${about}`;
}

/** Nút của khoá theo trạng thái học; "Tiếp tục" dẫn thẳng tới bài đầu tiên chưa xong. */
export function courseAction({ course, progress }: CourseWithProgress): {
  label: string;
  to: string;
  variant: 'primary' | 'outline';
} {
  if (progress.status === 'dang-hoc' && progress.nextLesson) {
    return {
      label: fill(vi.catalog.continueLesson, { n: progress.nextLesson.number }),
      to: `/bai-hoc/${progress.nextLesson.lesson.id}`,
      variant: 'primary',
    };
  }
  return {
    label: progress.status === 'da-xong' ? vi.catalog.review : vi.catalog.explore,
    to: `/khoa-hoc/${course.id}`,
    variant: 'outline',
  };
}

/** Thẻ một khoá trên catalog (S0-37). */
export function CourseCard(item: CourseWithProgress) {
  const { course, progress } = item;
  const action = courseAction(item);
  const titleId = `khoa-${course.id}`;

  return (
    <article
      aria-labelledby={titleId}
      data-testid={`course-${course.id}`}
      // Bo 20px, viền mảnh, không bóng (S0-41).
      className="flex h-full flex-col overflow-hidden rounded-card border border-line bg-surface"
    >
      {/* Hình tự vẽ cho từng khoá, lồng trong thẻ; khai báo kích thước để không nhảy layout. */}
      <div className="px-3 pt-3">
        <img
          src={`/illustrations/${course.illustration}`}
          alt=""
          width={320}
          height={180}
          className="h-34 w-full rounded-[0.8125rem] border border-fresh-line object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col px-4 pt-3.5 pb-4">
        <div className="flex flex-wrap gap-1.5">
          <LevelBadge level={course.level} />
          <AgeBadge ageRange={course.ageRange} />
        </div>
        <h2 id={titleId} className="mt-2 text-card-title">
          {course.title}
        </h2>
        {/* Dòng cao 21px: dấu chồng (Ổ, ầ) của dòng thứ hai không bị cắt mất nửa. */}
        <p className="mt-2 line-clamp-2 text-small text-ink-soft">{course.summary}</p>
        <p className="mt-3 text-meta text-ink-soft">{courseMeta(item)}</p>
        {progress.status !== 'chua-hoc' && (
          <div className="mt-3">
            <ProgressBar percent={progress.percent} label={vi.catalog.progressLabel} />
          </div>
        )}
        <div className="mt-auto pt-3">
          <ButtonLink
            to={action.to}
            variant={action.variant}
            size="sm"
            aria-label={`${action.label}: ${course.title}`}
          >
            {action.label}
            <ArrowRight aria-hidden="true" className="size-4" />
          </ButtonLink>
        </div>
      </div>
    </article>
  );
}

/** Độ tuổi của khoá: nhãn xanh lá nhạt có chấm, luôn kèm chữ (S0-41). */
export function AgeBadge({ ageRange }: { ageRange: readonly [number, number] }) {
  return (
    <span className="inline-flex h-5.5 items-center gap-1.5 rounded-md border border-fresh-line bg-fresh-surface px-2 text-meta text-fresh-text">
      <span aria-hidden="true" className="size-1.5 rounded-full bg-fresh-dot" />
      {fill(vi.catalog.ageRange, { from: ageRange[0], to: ageRange[1] })}
    </span>
  );
}

/** Ô giữ chỗ cho khoá sắp có: không bấm được, không ghi tên khoá cụ thể. */
export function ComingSoonCard() {
  return (
    <div
      data-testid="course-coming-soon"
      className="flex h-full min-h-48 flex-col items-center justify-center gap-2 rounded-card border border-dashed border-line p-6 text-center"
    >
      <Clock aria-hidden="true" className="size-8 text-ink-soft" />
      <p className="text-card-title">{vi.catalog.comingSoonTitle}</p>
      <p className="max-w-60 text-small text-ink-soft">{vi.catalog.comingSoonBody}</p>
    </div>
  );
}

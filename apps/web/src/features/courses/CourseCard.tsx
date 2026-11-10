import { ArrowRight } from 'lucide-react';
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
      className="flex h-full flex-col overflow-hidden rounded-card bg-surface shadow-card"
    >
      {/* Hình tự vẽ cho từng khoá; khai báo kích thước để không nhảy layout khi tải. */}
      <img
        src={`/illustrations/${course.illustration}`}
        alt=""
        width={320}
        height={180}
        className="aspect-video w-full object-cover"
      />
      <div className="flex flex-1 flex-col p-5">
        <div>
          <LevelBadge level={course.level} />
        </div>
        <h2 id={titleId} className="mt-3 text-card-title">
          {course.title}
        </h2>
        {/* Dòng cao 24px: dấu chồng (Ổ, ầ) của dòng thứ hai không bị cắt mất nửa. */}
        <p className="mt-1 line-clamp-2 text-ink-soft">{course.summary}</p>
        <p className="mt-3 text-small text-ink-soft">{courseMeta(item)}</p>
        {progress.status !== 'chua-hoc' && (
          <div className="mt-3">
            <ProgressBar percent={progress.percent} label={vi.catalog.progressLabel} />
          </div>
        )}
        <div className="mt-auto pt-4">
          <ButtonLink
            to={action.to}
            variant={action.variant}
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

/** Ô giữ chỗ cho khoá sắp có: không bấm được, không ghi tên khoá cụ thể. */
export function ComingSoonCard() {
  return (
    <div
      data-testid="course-coming-soon"
      className="flex h-full min-h-64 flex-col items-center justify-center rounded-card border-2 border-dashed border-line p-6 text-center"
    >
      <p className="text-card-title text-ink-soft">{vi.catalog.comingSoonTitle}</p>
      <p className="mt-1 text-small text-ink-soft">{vi.catalog.comingSoonBody}</p>
    </div>
  );
}

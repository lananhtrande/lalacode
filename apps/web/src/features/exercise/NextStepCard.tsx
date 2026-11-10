import { useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { ArrowRight, PartyPopper } from 'lucide-react';
import { hrefOf, type Completion, type NavTarget } from '../../content/navigation';
import { vi } from '../../shared/i18n/vi';
import { buttonClasses } from '../../shared/ui/button-classes';

export interface NextStepCardProps {
  next: NavTarget;
  /** `null` khi chưa đọc xong tiến độ (hoặc trình duyệt không cho lưu). */
  completion: Completion | null;
}

/**
 * Thẻ hiện ra khi trẻ nộp bài đúng hết (S0-36): một câu khen và **nút chính**
 * đi tiếp. Nút nhận focus ngay để trẻ bấm Enter là sang bài sau.
 */
export function NextStepCard({ next, completion }: NextStepCardProps) {
  const ctaRef = useRef<HTMLAnchorElement | null>(null);
  const { message, cta } = wording(next, completion);

  useEffect(() => {
    // Không cuộn theo focus: khu kết quả đã tự cuộn vào tầm mắt (ExercisePage).
    ctaRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <section
      data-testid="next-step"
      className="rounded-card border border-success/40 bg-success-surface p-4"
    >
      <p className="flex items-start gap-2 font-semibold">
        <PartyPopper aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-success" />
        {message}
      </p>
      <Link ref={ctaRef} to={hrefOf(next)} className={buttonClasses('primary', 'md', 'mt-3')}>
        {cta}
        {next.kind !== 'course' && <ArrowRight aria-hidden="true" className="size-4" />}
      </Link>
    </section>
  );
}

function wording(next: NavTarget, completion: Completion | null): { message: string; cta: string } {
  const { pager } = vi;
  switch (next.kind) {
    case 'exercise':
      return { message: pager.exerciseDone, cta: pager.nextExerciseCta };
    case 'lesson':
      if (completion?.lessonDone) return { message: pager.lessonDone, cta: pager.finishLessonCta };
      return {
        message: completion ? pager.lastExerciseDone : pager.exerciseDone,
        cta: pager.nextLessonCta,
      };
    case 'course':
      return {
        message: completion?.courseDone ? pager.courseDone : pager.courseEnd,
        cta: pager.toCourse,
      };
  }
}

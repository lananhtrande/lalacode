import { hrefOf, type NavTarget } from '../../content/navigation';
import { vi } from '../i18n/vi';
import type { NeighbourLink } from './NeighbourLinks';

type Side = 'previous' | 'next';

/**
 * Chữ trên nút và nhãn đọc to cho một bài trước/tiếp (S0-36). `from` là màn
 * đang mở: từ bài tập đầu, "trước" là trang bài học của chính nó ("Về bài học");
 * từ trang bài học, "trước" là bài học trước.
 */
export function toNeighbourLink(
  target: NavTarget,
  side: Side,
  from: 'exercise' | 'lesson',
): NeighbourLink {
  const label = labelOf(target, side, from);
  return {
    href: hrefOf(target),
    label,
    ariaLabel: target.kind === 'map' ? label : `${label}: ${target.title}`,
  };
}

function labelOf(target: NavTarget, side: Side, from: 'exercise' | 'lesson'): string {
  const { pager } = vi;
  switch (target.kind) {
    case 'exercise':
      return side === 'next' ? pager.nextExercise : pager.previousExercise;
    case 'lesson':
      if (side === 'next') return pager.nextLesson;
      return from === 'exercise' ? pager.backToLesson : pager.previousLesson;
    case 'map':
      return pager.toMap;
  }
}

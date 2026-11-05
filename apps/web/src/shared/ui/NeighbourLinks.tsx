import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import { buttonClasses } from './button-classes';

export interface NeighbourLink {
  href: string;
  /** Chữ trên nút, ví dụ "Bài tập tiếp". */
  label: string;
  /** Nhãn đầy đủ cho trình đọc màn hình, ví dụ "Bài tập tiếp: Góc vuông". */
  ariaLabel: string;
}

export interface NeighbourLinksProps {
  /** Nhãn của vùng điều hướng (`<nav aria-label>`). */
  label: string;
  previous: NeighbourLink | null;
  next: NeighbourLink;
  /** Nút "tiếp" là nút chính (chỉ khi trẻ đã làm xong bài hiện tại). */
  nextIsPrimary?: boolean;
  className?: string;
}

/**
 * Thanh "← bài trước · bài tiếp →" (S0-36). Là `<Link>` thật để bấm giữa / mở
 * tab mới được. Giai đoạn 0 không khoá bài: "tiếp" luôn bấm được, chỉ đổi
 * thành nút chính khi trẻ đã làm xong.
 */
export function NeighbourLinks({
  label,
  previous,
  next,
  nextIsPrimary = false,
  className = '',
}: NeighbourLinksProps) {
  return (
    <nav aria-label={label} className={['flex flex-wrap items-center gap-2', className].join(' ')}>
      {previous && (
        <Link
          to={previous.href}
          aria-label={previous.ariaLabel}
          className={buttonClasses('ghost', 'md', 'px-3')}
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          {previous.label}
        </Link>
      )}
      <Link
        to={next.href}
        aria-label={next.ariaLabel}
        className={buttonClasses(nextIsPrimary ? 'primary' : 'outline', 'md', 'ml-auto')}
      >
        {next.label}
        <ArrowRight aria-hidden="true" className="size-4" />
      </Link>
    </nav>
  );
}

import type { HTMLAttributes } from 'react';

export interface CardProps extends HTMLAttributes<HTMLElement> {
  /** Thẻ HTML bọc ngoài; mặc định `div`. Dùng `section` khi thẻ có tiêu đề riêng. */
  as?: 'div' | 'section' | 'article' | 'li';
}

/** Thẻ trắng bo góc 16px, bóng rất nhẹ — đặt trên nền `surface-muted`. */
export function Card({ as: Tag = 'div', className = '', ...rest }: CardProps) {
  return (
    <Tag
      className={['rounded-card bg-surface p-5 shadow-card sm:p-6', className].join(' ')}
      {...rest}
    />
  );
}

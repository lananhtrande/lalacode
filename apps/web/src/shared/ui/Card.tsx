import type { HTMLAttributes } from 'react';

export interface CardProps extends HTMLAttributes<HTMLElement> {
  /** Thẻ HTML bọc ngoài; mặc định `div`. Dùng `section` khi thẻ có tiêu đề riêng. */
  as?: 'div' | 'section' | 'article' | 'li';
}

/** Thẻ trắng bo góc 20px, viền mảnh, không bóng — đặt trên nền `surface-muted` (S0-41). */
export function Card({ as: Tag = 'div', className = '', ...rest }: CardProps) {
  return (
    <Tag
      className={['rounded-card border border-line bg-surface p-5 sm:p-6', className].join(' ')}
      {...rest}
    />
  );
}

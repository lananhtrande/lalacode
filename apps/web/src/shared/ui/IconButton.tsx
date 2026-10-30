import type { ButtonHTMLAttributes, ReactNode } from 'react';

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Bắt buộc: nút chỉ có icon thì trình đọc màn hình phải biết nó làm gì. */
  label: string;
  icon: ReactNode;
}

/** Nút tròn chỉ có icon, 44×44px. */
export function IconButton({ label, icon, className = '', type = 'button', ...rest }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={[
        'inline-flex size-tap shrink-0 items-center justify-center rounded-full text-ink transition-colors hover:bg-ink/5 disabled:opacity-60',
        className,
      ].join(' ')}
      {...rest}
    >
      {icon}
    </button>
  );
}

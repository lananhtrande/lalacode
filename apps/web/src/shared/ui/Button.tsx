import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { buttonClasses, type ButtonSize, type ButtonVariant } from './button-classes';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Icon đứng trước chữ; luôn kèm chữ, nút chỉ có icon thì dùng `IconButton`. */
  icon?: ReactNode;
}

/** Nút dạng viên thuốc, cao tối thiểu 44px. Mặc định `type="button"` để không vô tình gửi form. */
export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
  type = 'button',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button type={type} className={buttonClasses(variant, size, className)} {...rest}>
      {icon}
      {children}
    </button>
  );
}

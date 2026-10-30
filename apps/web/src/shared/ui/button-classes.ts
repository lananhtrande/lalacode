/**
 * Class của nút, dùng chung cho `<Button>` và `<ButtonLink>` để một link trông
 * như nút mà không phải chép class tay (docs/design-system.md).
 *
 * - primary: hành động chính của màn (mỗi màn nên chỉ có một).
 * - dark: hành động phụ quan trọng (ví dụ "Chạy thử").
 * - outline: hành động phụ.
 * - ghost: hành động ít dùng, không muốn kéo mắt.
 */
export type ButtonVariant = 'primary' | 'dark' | 'outline' | 'ghost';
export type ButtonSize = 'md' | 'lg';

const base =
  'inline-flex min-h-tap items-center justify-center gap-2 rounded-full text-label transition-colors disabled:cursor-not-allowed disabled:opacity-60';

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-on-accent hover:bg-accent/85',
  dark: 'bg-ink text-surface hover:bg-ink/85',
  outline: 'border-2 border-ink bg-surface text-ink hover:bg-surface-muted',
  ghost: 'text-ink hover:bg-ink/5',
};

const sizes: Record<ButtonSize, string> = {
  md: 'px-5',
  lg: 'min-h-12 px-6',
};

export function buttonClasses(
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  extra = '',
): string {
  return [base, variants[variant], sizes[size], extra].filter(Boolean).join(' ');
}

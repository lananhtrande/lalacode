/**
 * Class của nút, dùng chung cho `<Button>` và `<ButtonLink>` để một link trông
 * như nút mà không phải chép class tay (docs/design-system.md).
 *
 * - primary: hành động chính của màn (mỗi màn nên chỉ có một).
 * - dark: hành động phụ quan trọng (ví dụ "Chạy thử").
 * - outline: hành động phụ (nền màu nhấn nhạt, chữ màu nhấn).
 * - ghost: hành động ít dùng, không muốn kéo mắt.
 */
export type ButtonVariant = 'primary' | 'dark' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

// Bo 8px, không còn viên thuốc (S0-41, ADR 0012).
const base =
  'inline-flex items-center justify-center gap-2 rounded-lg text-label transition-colors disabled:cursor-not-allowed disabled:opacity-60';

const variants: Record<ButtonVariant, string> = {
  // Hover đậm hơn chứ không nhạt đi: chữ trắng trên nền nhạt hơn sẽ tụt dưới AA.
  primary: 'bg-accent text-on-accent hover:bg-accent-strong',
  dark: 'bg-ink-surface text-surface hover:bg-ink',
  // Nút phụ: nền màu nhấn 5%, chữ màu nhấn — vẫn rõ là bấm được, không tranh với nút chính.
  outline: 'bg-accent/5 text-accent-strong ring-1 ring-accent/15 ring-inset hover:bg-accent/10',
  ghost: 'text-ink hover:bg-ink/5',
};

const sizes: Record<ButtonSize, string> = {
  // Trong thẻ: 36px (thẻ là cả một vùng, nút không phải đích bấm duy nhất).
  sm: 'min-h-9 px-3.5 text-[0.8125rem]',
  md: 'min-h-tap px-4',
  lg: 'min-h-11 px-5',
};

export function buttonClasses(
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  extra = '',
): string {
  return [base, variants[variant], sizes[size], extra].filter(Boolean).join(' ');
}

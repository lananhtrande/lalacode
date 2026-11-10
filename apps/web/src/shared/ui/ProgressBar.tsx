export interface ProgressBarProps {
  /** 0–100. */
  percent: number;
  /** Tên đọc to cho trình đọc màn hình, ví dụ "Tiến độ khoá học". */
  label: string;
  /** Chữ đi kèm bên phải, ví dụ "7/20 bài · 35%". Mặc định là số %. */
  caption?: string;
}

/**
 * Thanh tiến độ có số % bằng chữ bên cạnh: màu thanh không phải là cách duy
 * nhất để biết đã làm được bao nhiêu (docs/design-system.md, nguyên tắc 2).
 */
export function ProgressBar({ percent, label, caption }: ProgressBarProps) {
  const value = Math.min(100, Math.max(0, Math.round(percent)));
  return (
    <div className="flex items-center gap-3">
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
        aria-valuetext={caption ?? `${value}%`}
        className="h-2 flex-1 overflow-hidden rounded-full bg-line"
      >
        <div className="h-full rounded-full bg-accent" style={{ width: `${value}%` }} />
      </div>
      <span
        aria-hidden="true"
        className="shrink-0 text-small font-semibold text-ink-soft tabular-nums"
      >
        {caption ?? `${value}%`}
      </span>
    </div>
  );
}

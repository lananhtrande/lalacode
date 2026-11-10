/**
 * Các cột cao dần, tô đặc `filled` cột đầu: icon cho cấp độ khoá học và độ khó
 * bài tập. Luôn đi kèm chữ; số cột tô là để nhìn nhanh, không thay cho chữ.
 */
export function BarsIcon({ filled, total }: { filled: number; total: number }) {
  const width = 16 / total;
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4 shrink-0">
      {Array.from({ length: total }, (_, bar) => {
        const height = 5 + (bar * 10) / Math.max(1, total - 1);
        return (
          <rect
            key={bar}
            x={bar * width + 0.75}
            y={15 - height}
            width={width - 1.5}
            height={height}
            rx={1}
            fill={bar < filled ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth={1.25}
          />
        );
      })}
    </svg>
  );
}

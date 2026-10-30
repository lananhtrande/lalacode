/**
 * Tỉ lệ tương phản theo WCAG 2.x, cho màu dạng `#rrggbb`.
 * Dùng để chốt bằng test rằng mọi cặp chữ/nền trong design system đạt AA.
 */

/** Ngưỡng AA cho chữ thường. */
export const WCAG_AA = 4.5;

function channel(value: number): number {
  const v = value / 255;
  return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(hex: string): number {
  const match = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  if (!match) throw new Error(`Màu phải có dạng #rrggbb: ${hex}`);
  const [r, g, b] = match.slice(1).map((part) => channel(parseInt(part, 16))) as [
    number,
    number,
    number,
  ];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(foreground: string, background: string): number {
  const [light, dark] = [relativeLuminance(foreground), relativeLuminance(background)].sort(
    (a, b) => b - a,
  ) as [number, number];
  return (light + 0.05) / (dark + 0.05);
}

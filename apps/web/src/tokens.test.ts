// @vitest-environment node
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { contrastRatio, WCAG_AA } from './shared/lib/contrast';

/**
 * Token màu sống ở đúng một chỗ: `index.css`. Test đọc thẳng file đó, nên đổi
 * một màu mà làm hỏng tương phản là CI đỏ ngay (docs/design-system.md).
 */
const css = readFileSync(new URL('./index.css', import.meta.url), 'utf8');
const tokens = new Map(
  [...css.matchAll(/--color-([a-z-]+):\s*(#[0-9a-f]{6});/gi)].map((match) => [
    match[1] ?? '',
    match[2] ?? '',
  ]),
);

function color(name: string): string {
  const value = tokens.get(name);
  if (!value) throw new Error(`Không có token --color-${name} trong index.css`);
  return value;
}

/** Mọi cặp chữ/nền có thật trên giao diện. Thêm cách phối mới thì thêm vào đây. */
const TEXT_PAIRS = [
  ['ink', 'surface'],
  ['ink', 'surface-muted'],
  ['ink', 'accent-soft'],
  ['ink', 'ai-surface'],
  ['ink-soft', 'surface'],
  ['ink-soft', 'surface-muted'],
  ['ink-soft', 'accent-soft'],
  ['ink-soft', 'ai-surface'],
  ['on-accent', 'accent'],
  ['surface', 'ink'],
  ['accent-strong', 'surface'],
  ['accent-strong', 'surface-muted'],
  ['accent-strong', 'accent-soft'],
  ['accent-strong', 'ai-surface'],
  ['success', 'surface'],
  ['success', 'success-surface'],
  ['attention', 'surface'],
  ['attention', 'attention-surface'],
  ['attention', 'ai-surface'],
  ['ink', 'attention-surface'],
  ['ink-soft', 'attention-surface'],
] as const;

/** Sắc độ (hue, 0–360°) của màu `#rrggbb`. */
function hue(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255) as [
    number,
    number,
    number,
  ];
  const max = Math.max(r, g, b);
  const delta = max - Math.min(r, g, b);
  if (delta === 0) return 0;
  const h =
    max === r ? ((g - b) / delta) % 6 : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4;
  return (h * 60 + 360) % 360;
}

describe('token màu trong index.css', () => {
  it('đọc được token (regex không trượt khi định dạng file đổi)', () => {
    expect(tokens.size).toBeGreaterThanOrEqual(14);
  });

  it.each(TEXT_PAIRS)('chữ %s trên nền %s đạt WCAG AA', (text, background) => {
    expect(contrastRatio(color(text), color(background))).toBeGreaterThanOrEqual(WCAG_AA);
  });

  it.each([
    'code-text',
    'code-muted',
    'code-keyword',
    'code-string',
    'code-number',
    'code-comment',
    'code-function',
    'code-builtin',
  ])('chữ %s trong editor tối đạt AA trên nền, dòng đang đứng và gutter', (text) => {
    for (const background of ['code-bg', 'code-active', 'code-gutter']) {
      expect(contrastRatio(color(text), color(background))).toBeGreaterThanOrEqual(WCAG_AA);
    }
  });

  it('con trỏ và viền focus màu nhấn nhìn rõ trên nền editor', () => {
    expect(contrastRatio(color('accent'), color('code-bg'))).toBeGreaterThanOrEqual(3);
    expect(contrastRatio(color('accent'), color('code-active'))).toBeGreaterThanOrEqual(3);
  });

  it('màu "cần chú ý" khác hẳn màu nhấn, để trẻ không nhầm nút chính với lỗi (ADR 0009)', () => {
    const distance = Math.abs(hue(color('attention')) - hue(color('accent')));
    expect(Math.min(distance, 360 - distance)).toBeGreaterThanOrEqual(30);
    const surfaceDistance = Math.abs(hue(color('attention-surface')) - hue(color('accent-soft')));
    expect(Math.min(surfaceDistance, 360 - surfaceDistance)).toBeGreaterThanOrEqual(30);
  });

  it('viền focus (màu ink) nhìn rõ trên cả nền trắng lẫn nút màu nhấn', () => {
    expect(contrastRatio(color('ink'), color('surface'))).toBeGreaterThanOrEqual(3);
    expect(contrastRatio(color('ink'), color('accent'))).toBeGreaterThanOrEqual(3);
  });
});

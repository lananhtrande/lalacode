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
  // Nút chính khi di chuột (hover: bg-accent-strong)
  ['on-accent', 'accent-strong'],
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
  // S0-41: nền lõm, nền trang xám ấm, nền tối ngoài editor, nhãn "Mới"
  ['ink', 'surface-sunken'],
  ['ink-soft', 'surface-sunken'],
  ['accent-strong', 'surface-sunken'],
  ['accent', 'surface'],
  ['surface', 'ink-surface'],
  ['fresh-text', 'fresh-surface'],
  // Sidebar mục lục nền tối của trình học bài (S0-38, ADR 0011)
  ['learn-text', 'learn-bg'],
  ['learn-text', 'learn-current'],
  ['learn-text', 'learn-hover'],
  ['learn-muted', 'learn-bg'],
  ['learn-muted', 'learn-current'],
  ['learn-muted', 'learn-hover'],
  ['learn-success', 'learn-bg'],
  ['learn-success', 'learn-current'],
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

/** Khoảng cách giữa hai sắc độ trên vòng màu (0–180°). */
function hueDistance(a: string, b: string): number {
  const distance = Math.abs(hue(a) - hue(b));
  return Math.min(distance, 360 - distance);
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

  it('con trỏ và viền focus trong editor nhìn rõ trên nền code', () => {
    for (const background of ['code-bg', 'code-active', 'code-gutter']) {
      expect(contrastRatio(color('code-accent'), color(background))).toBeGreaterThanOrEqual(3);
    }
  });

  it.each([
    ['attention', 'accent'],
    ['attention-surface', 'accent-soft'],
    ['success', 'accent'],
    ['success-surface', 'accent-soft'],
  ])('%s khác sắc độ hẳn %s, để trẻ không nhầm nút chính với trạng thái (ADR 0010)', (a, b) => {
    expect(hueDistance(color(a), color(b))).toBeGreaterThanOrEqual(30);
  });

  it('"đạt" và "cần chú ý" cũng khác màu nhấn về độ sáng (ADR 0010, 0012)', () => {
    // 1.5 ở ADR 0010; S0-41 đổi màu nhấn đậm hơn mà giữ nguyên `success` nên còn
    // 1.39 — vẫn cách nhau 75° sắc độ (test ở trên). Ngưỡng hạ có ghi trong ADR 0012.
    expect(contrastRatio(color('success'), color('accent'))).toBeGreaterThanOrEqual(1.35);
  });

  it.each(['code-keyword', 'code-string', 'code-number', 'code-function', 'code-builtin'])(
    'màu cú pháp %s không giống màu nút (khác sắc độ ≥ 30°)',
    (token) => {
      expect(hueDistance(color(token), color('accent'))).toBeGreaterThanOrEqual(30);
    },
  );

  it('viền focus (màu ink) nhìn rõ trên cả nền trắng lẫn nút màu nhấn', () => {
    expect(contrastRatio(color('ink'), color('surface'))).toBeGreaterThanOrEqual(3);
    expect(contrastRatio(color('ink'), color('accent'))).toBeGreaterThanOrEqual(3);
  });

  it('sidebar tối: viền focus, vạch mục đang mở và thanh tiến độ nhìn rõ (≥ 3:1)', () => {
    for (const background of ['learn-bg', 'learn-current', 'learn-hover']) {
      expect(contrastRatio(color('learn-accent'), color(background))).toBeGreaterThanOrEqual(3);
    }
    expect(contrastRatio(color('learn-accent'), color('learn-track'))).toBeGreaterThanOrEqual(3);
  });

  it('sidebar tối: màu "đã xong" khác hẳn màu đánh dấu mục đang mở', () => {
    expect(hueDistance(color('learn-success'), color('learn-accent'))).toBeGreaterThanOrEqual(30);
  });
});

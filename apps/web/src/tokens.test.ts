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
] as const;

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
  });

  it('viền focus (màu ink) nhìn rõ trên cả nền trắng lẫn nút màu nhấn', () => {
    expect(contrastRatio(color('ink'), color('surface'))).toBeGreaterThanOrEqual(3);
    expect(contrastRatio(color('ink'), color('accent'))).toBeGreaterThanOrEqual(3);
  });
});

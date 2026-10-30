import { describe, expect, it } from 'vitest';
import { contrastRatio, WCAG_AA } from '../../shared/lib/contrast';
import { EDITOR_TEXT, PALETTES, TEXT_PAIRS } from './design-palettes';

describe.each(PALETTES)('bảng màu $name', (palette) => {
  it.each(TEXT_PAIRS)('chữ %s trên nền %s đạt AA', (text, background) => {
    expect(contrastRatio(palette.colors[text], palette.colors[background])).toBeGreaterThanOrEqual(
      WCAG_AA,
    );
  });

  it.each(EDITOR_TEXT)('màu %s trong editor tối đạt AA trên nền và dòng đang đứng', (key) => {
    expect(contrastRatio(palette.editor[key], palette.editor.background)).toBeGreaterThanOrEqual(
      WCAG_AA,
    );
    expect(contrastRatio(palette.editor[key], palette.editor.activeLine)).toBeGreaterThanOrEqual(
      WCAG_AA,
    );
  });

  it('số dòng đạt AA trên nền gutter', () => {
    expect(contrastRatio(palette.editor.lineNumber, palette.editor.gutter)).toBeGreaterThanOrEqual(
      WCAG_AA,
    );
  });
});

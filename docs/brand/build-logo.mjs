// Builds lalakode brand SVGs (text outlined from Inter, OFL) + PNG icons.
import fs from 'node:fs';
import path from 'node:path';
import opentype from 'opentype.js';
import { Resvg } from '@resvg/resvg-js';

const out = process.argv[2];
fs.mkdirSync(out, { recursive: true });
const F = (n) => opentype.parse(fs.readFileSync(`node_modules/@fontsource/inter/files/${n}`).buffer.slice(0));
const fonts = {
  800: [F('inter-latin-800-normal.woff'), F('inter-vietnamese-800-normal.woff')],
  500: [F('inter-latin-500-normal.woff'), F('inter-vietnamese-500-normal.woff')],
};

// Wordmark has no trailing cursor (removed 2026-11-05). coral: concept B as drawn; teal: concept B in the site's "Ngọc biển" tokens (index.css).
const PALETTES = {
  coral: { bg: '#E8553A', glyph: '#FFFFFF', markCursor: '#18181B', ink: '#18181B', muted: '#4A4A52', cursor: '#E8553A' },
  teal: { bg: '#2DD4BF', glyph: '#06302B', markCursor: '#FFFFFF', ink: '#0F1A1C', muted: '#4A5A5E', cursor: '#0F766E' },
};
const P = PALETTES[process.env.PALETTE ?? 'coral'];
const CORAL = P.bg;
const INK = P.ink;
const MUTED = P.muted;

/** Outline a string; returns {d, width}. letterSpacing in em. */
function outline(text, weight, size, x, y, letterSpacingEm = 0) {
  const list = fonts[weight];
  let cx = x;
  const parts = [];
  let prev = null;
  for (const ch of text) {
    const font = list.find((f) => f.charToGlyphIndex(ch) > 0) ?? list[0];
    const glyph = font.charToGlyph(ch);
    const scale = size / font.unitsPerEm;
    if (prev && prev.font === font) cx += font.getKerningValue(prev.glyph, glyph) * scale;
    parts.push(glyph.getPath(cx, y, size).toPathData(2));
    cx += glyph.advanceWidth * scale + letterSpacingEm * size;
    prev = { font, glyph };
  }
  return { d: parts.join(''), width: cx - x - letterSpacingEm * size };
}

const markInner = (big = true) =>
  big
    ? `<circle cx="52" cy="68" r="23" fill="none" stroke="${P.glyph}" stroke-width="12"/><path d="M67 51 C 74 50, 80 46, 81 39" fill="none" stroke="${P.glyph}" stroke-width="10" stroke-linecap="round"/><rect x="88" y="50" width="10" height="36" rx="3" fill="${P.markCursor}"/>`
    : `<circle cx="56" cy="68" r="26" fill="none" stroke="${P.glyph}" stroke-width="20"/><path d="M74 48 C 83 47, 91 42, 92 33" fill="none" stroke="${P.glyph}" stroke-width="18" stroke-linecap="round"/>`;
const mark = (x, y, s, big = true, rx = 30) =>
  `<g transform="translate(${x} ${y}) scale(${s / 120})"><rect width="120" height="120" rx="${rx}" fill="${CORAL}"/>${markInner(big)}</g>`;

const svg = (w, h, body, label) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w.toFixed(1)} ${h}" width="${Math.ceil(w)}" height="${h}" role="img" aria-label="${label}"><title>${label}</title>${body}</svg>\n`;

const ASC = 0.727; // Inter cap/ascender height for l, k, d
const files = {};

// 1. Mark only
files['lalakode-mark.svg'] = svg(120, 120, mark(0, 0, 120), 'LaLaKode');
files['lalakode-mark-small.svg'] = svg(120, 120, mark(0, 0, 120, false, 26), 'LaLaKode');

// 2. Horizontal logo (light + dark)
for (const [name, color] of [['lalakode-logo.svg', INK], ['lalakode-logo-dark.svg', '#FFFFFF']]) {
  const size = 64, markS = 96, gap = 22;
  const top = 48 - (ASC * size) / 2, base = top + ASC * size;
  const wm = outline('LaLaKode', 800, size, markS + gap, base, -0.035);
  const w = markS + gap + wm.width + 2;
  files[name] = svg(
    w, markS,
    `${mark(0, 0, markS)}<path fill="${color}" d="${wm.d}"/>`,
    'LaLaKode',
  );
}

// 3. Logo with tagline (light + dark)
for (const [name, color, sub] of [['lalakode-logo-tagline.svg', INK, MUTED], ['lalakode-logo-tagline-dark.svg', '#FFFFFF', '#D4D4D8']]) {
  const size = 64, markS = 112, gap = 24, x = markS + gap;
  const top = 10, base = top + ASC * size;
  const wm = outline('LaLaKode', 800, size, x, base, -0.035);
  const tag = outline('Nền tảng học lập trình cho người Việt', 500, 20, x + 2, base + 36);
  const w = Math.max(x + wm.width, x + 2 + tag.width) + 2;
  files[name] = svg(
    w, markS,
    `${mark(0, 0, markS)}<path fill="${color}" d="${wm.d}"/><path fill="${sub}" d="${tag.d}"/>`,
    'LaLaKode — Nền tảng học lập trình cho người Việt',
  );
}

for (const [n, s] of Object.entries(files)) fs.writeFileSync(path.join(out, n), s);

// 4. PNG icons
const png = (svgText, size, file) =>
  fs.writeFileSync(path.join(out, file), new Resvg(svgText, { fitTo: { mode: 'width', value: size } }).render().asPng());
png(files['lalakode-mark-small.svg'], 32, 'favicon-32.png');
png(files['lalakode-mark.svg'], 180, 'apple-touch-icon.png');
png(files['lalakode-mark.svg'], 192, 'icon-192.png');
png(files['lalakode-mark.svg'], 512, 'icon-512.png');
png(files['lalakode-logo-tagline.svg'], 1200, 'lalakode-logo-tagline@2x.png');
console.log(Object.keys(files).join('\n'));

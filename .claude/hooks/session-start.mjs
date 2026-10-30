// SessionStart: give Claude the current stage and the next open roadmap items.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { projectDir, hasNodeModules } from './lib.mjs';

let roadmap = '';
try {
  roadmap = readFileSync(path.join(projectDir, 'docs/roadmap-stage0.md'), 'utf8');
} catch {
  /* no roadmap yet */
}

const lines = roadmap.split('\n');
const inProgress = lines.filter((l) => /^- \[~\]/.test(l)).map((l) => l.slice(6));
const next = lines.filter((l) => /^- \[ \]/.test(l)).slice(0, 3).map((l) => l.slice(6));
const done = lines.filter((l) => /^- \[x\]/i.test(l)).length;
const total = done + lines.filter((l) => /^- \[( |~)\]/.test(l)).length;

const out = [
  'Dự án lalakode — GIAI ĐOẠN 0 (web tĩnh, không lưu dữ liệu người dùng trên server). Luật: CLAUDE.md.',
  `Roadmap: ${done}/${total} mục xong.`,
  inProgress.length ? `Đang làm: ${inProgress.join(' · ')}` : null,
  next.length ? `Tiếp theo: ${next.join(' · ')}` : null,
  hasNodeModules() ? null : 'Chưa có node_modules — hooks format/lint đang tạm bỏ qua; chạy `npm install` khi đã có package.json.',
]
  .filter(Boolean)
  .join('\n');

process.stdout.write(out + '\n');
process.exit(0);

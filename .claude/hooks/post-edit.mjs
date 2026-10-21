// PostToolUse(Edit|Write|MultiEdit): format, lint and validate the file just changed.
// Exit 2 feeds problems back to Claude so it fixes them before moving on.
// Before `npm install` (bootstrap), tools are skipped silently.
import { spawnSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { readInput, rel, projectDir, hasNodeModules, packageScripts, block } from './lib.mjs';

const input = readInput();
const file = rel(input.tool_input?.file_path);
if (!file || file.startsWith('..')) process.exit(0);
const abs = path.join(projectDir, file);
if (!existsSync(abs)) process.exit(0);

const problems = [];
const run = (cmd, args) => spawnSync(cmd, args, { cwd: projectDir, encoding: 'utf8', timeout: 100_000 });
const bin = (name) => path.join(projectDir, 'node_modules', '.bin', name);

// 1. JSON must parse (works without node_modules).
if (file.endsWith('.json')) {
  try {
    JSON.parse(readFileSync(abs, 'utf8'));
  } catch (e) {
    problems.push(`${file}: JSON không hợp lệ — ${e.message}`);
  }
}

if (hasNodeModules()) {
  // 2. Prettier (silently fixes formatting).
  if (/\.(ts|tsx|js|jsx|mjs|cjs|json|css|md|ya?ml|html)$/.test(file) && existsSync(bin('prettier'))) {
    run(bin('prettier'), ['--write', '--log-level', 'warn', file]);
  }
  // 3. ESLint --fix; report what remains.
  if (/\.(ts|tsx|js|jsx|mjs)$/.test(file) && !file.startsWith('.claude/') && existsSync(bin('eslint'))) {
    const r = run(bin('eslint'), ['--fix', '--max-warnings=0', file]);
    if (r.status !== 0) problems.push(`ESLint ${file}:\n${(r.stdout || '') + (r.stderr || '')}`.trim());
  }
}

// 4. Content changes → schema check (fast). Behaviour check (content:verify) is left to `npm run check`/CI.
if (file.startsWith('content/') && packageScripts()['content:check'] && hasNodeModules()) {
  const r = run('npm', ['run', '--silent', 'content:check']);
  if (r.status !== 0) problems.push(`content:check thất bại:\n${(r.stdout || '') + (r.stderr || '')}`.trim());
}

// 5. Reminders that don't block.
const notes = [];
if (/^(services\/ai-hint|apps\/web\/src\/(progress|runner))\//.test(file)) {
  notes.push('Bạn vừa sửa phần liên quan dữ liệu/AI/runner — nhớ gọi agent privacy-reviewer trước khi báo xong.');
}
if (file.startsWith('content/')) {
  notes.push('Nội dung thay đổi — chạy `npm run content:verify` và gọi agent content-reviewer trước khi báo xong.');
}

if (problems.length) block(problems.join('\n\n') + (notes.length ? '\n\n' + notes.join('\n') : ''));
if (notes.length) {
  // JSON output on exit 0: shown to Claude as additional context.
  process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'PostToolUse', additionalContext: notes.join('\n') } }));
}
process.exit(0);

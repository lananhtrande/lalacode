// Shared helpers for Claude Code hooks. No dependencies: runs before `npm install`.
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

export function readInput() {
  try {
    const raw = readFileSync(0, 'utf8');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();

export function rel(p) {
  if (!p) return '';
  const abs = path.isAbsolute(p) ? p : path.join(projectDir, p);
  return path.relative(projectDir, abs).split(path.sep).join('/');
}

/** Exit 2 = block (PreToolUse) or feed the message back to Claude (PostToolUse). */
export function block(message) {
  process.stderr.write(message.trim() + '\n');
  process.exit(2);
}

export function hasNodeModules() {
  return existsSync(path.join(projectDir, 'node_modules'));
}

export function packageScripts() {
  try {
    const pkg = JSON.parse(readFileSync(path.join(projectDir, 'package.json'), 'utf8'));
    return pkg.scripts || {};
  } catch {
    return {};
  }
}

/** Text the tool is about to write (Write/Edit/MultiEdit). */
export function incomingText(toolName, input) {
  if (!input) return '';
  if (toolName === 'Write') return input.content || '';
  if (toolName === 'Edit') return input.new_string || '';
  if (toolName === 'MultiEdit') return (input.edits || []).map((e) => e.new_string || '').join('\n');
  if (toolName === 'NotebookEdit') return input.new_source || '';
  return '';
}

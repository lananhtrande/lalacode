// Tìm CPython >= 3.12 để chạy grader.py (Pyodide cũng là CPython 3.12+).
import { spawnSync } from 'node:child_process';
import process from 'node:process';

export const MIN_PYTHON = [3, 12];

const CANDIDATES = ['python3.14', 'python3.13', 'python3.12', 'python3'];

function versionOf(command) {
  const result = spawnSync(
    command,
    ['-c', 'import sys; print(sys.version_info[0], sys.version_info[1])'],
    {
      encoding: 'utf8',
    },
  );
  if (result.status !== 0 || !result.stdout) return null;
  const [major, minor] = result.stdout.trim().split(' ').map(Number);
  if (!Number.isInteger(major) || !Number.isInteger(minor)) return null;
  return [major, minor];
}

function isNewEnough([major, minor]) {
  return major > MIN_PYTHON[0] || (major === MIN_PYTHON[0] && minor >= MIN_PYTHON[1]);
}

/**
 * @returns {{command: string, version: string} | {error: string}}
 */
export function findPython() {
  const candidates = process.env['PYTHON'] ? [process.env['PYTHON']] : CANDIDATES;
  const found = [];
  for (const command of candidates) {
    const version = versionOf(command);
    if (!version) continue;
    found.push(`${command} (${version.join('.')})`);
    if (isNewEnough(version)) return { command, version: version.join('.') };
  }
  const seen = found.length ? `Đã thử: ${found.join(', ')}.` : 'Không tìm thấy python nào.';
  return {
    error:
      `Cần CPython ${MIN_PYTHON.join('.')}+ để chạy content:verify (Pyodide cũng là CPython ${MIN_PYTHON.join('.')}+). ` +
      `${seen}\n` +
      'Cài bằng `brew install python@3.13`, hoặc chỉ định đường dẫn: `PYTHON=/duong/dan/python3.13 npm run content:verify`.',
  };
}

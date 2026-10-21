// Gọi grader.py trong một tiến trình con, có giới hạn thời gian.
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { projectDir } from './read-content.mjs';

/**
 * Một bản cài đặt duy nhất: file này vừa được CPython chạy ở đây, vừa được
 * Pyodide chạy trong trình duyệt (apps/web/src/runner/worker.ts).
 */
export const GRADER = path.join(projectDir, 'apps', 'web', 'src', 'runner', 'grader.py');

/** Rộng hơn timeout của bài để trừ hao lúc python khởi động. */
export const PROCESS_MARGIN_MS = 5000;

/**
 * @returns {Promise<{report?: object, timedOut?: true, crashed?: string}>}
 */
export const TURTLE = path.join(projectDir, 'apps', 'web', 'src', 'runner', 'turtle.py');

export function runGrader(python, job, timeoutMs, marginMs = PROCESS_MARGIN_MS) {
  return new Promise((resolve) => {
    const child = spawn(python, [GRADER], { cwd: projectDir });
    let stdout = '';
    let stderr = '';
    const timer = setTimeout(() => {
      child.kill('SIGKILL');
      resolve({ timedOut: true });
    }, timeoutMs + marginMs);

    child.stdout.on('data', (chunk) => (stdout += chunk));
    child.stderr.on('data', (chunk) => (stderr += chunk));
    child.on('error', (error) => {
      clearTimeout(timer);
      resolve({ crashed: `không chạy được python: ${error.message}` });
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      if (code !== 0) {
        resolve({ crashed: stderr.trim() || `grader.py thoát với mã ${code}` });
        return;
      }
      try {
        resolve({ report: JSON.parse(stdout) });
      } catch {
        resolve({ crashed: `grader.py trả về dữ liệu không đọc được: ${stdout.slice(0, 200)}` });
      }
    });

    // Gửi kèm rùa tự viết: bài dùng `import turtle` phải chạy được không cần màn hình.
    child.stdin.end(JSON.stringify({ ...job, turtle_source: readFileSync(TURTLE, 'utf8') }));
  });
}

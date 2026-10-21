#!/usr/bin/env node
// Chép Pyodide từ node_modules vào apps/web/public/pyodide/<version>/.
// Tự host (không dùng CDN): nhanh hơn ở Việt Nam và kiểm soát được phiên bản
// (ADR 0002). Thư mục có số phiên bản nên cache `immutable` được.
import { createRequire } from 'node:module';
import { copyFile, mkdir, readFile, rm } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { projectDir } from './lib/read-content.mjs';

// Chỉ những file cần để chạy; bỏ console.html, .d.ts, source map (~13 MB → ~12 MB).
const FILES = [
  'pyodide.mjs',
  'pyodide.asm.mjs',
  'pyodide.asm.wasm',
  'python_stdlib.zip',
  'pyodide-lock.json',
];

const require = createRequire(import.meta.url);
const pyodideDir = path.dirname(require.resolve('pyodide/package.json'));
const { version } = JSON.parse(await readFile(path.join(pyodideDir, 'package.json'), 'utf8'));

const outDir = path.join(projectDir, 'apps', 'web', 'public', 'pyodide', version);

await rm(path.join(projectDir, 'apps', 'web', 'public', 'pyodide'), {
  recursive: true,
  force: true,
});
await mkdir(outDir, { recursive: true });
for (const file of FILES) {
  await copyFile(path.join(pyodideDir, file), path.join(outDir, file));
}

// Phiên bản phải khớp với PYODIDE_VERSION trong code; lệch là lỗi nặng.
const constant = path.join(projectDir, 'apps', 'web', 'src', 'runner', 'pyodide-version.ts');
const expected = (await readFile(constant, 'utf8')).match(/'([^']+)'/)?.[1];
if (expected !== version) {
  console.error(
    `Lệch phiên bản Pyodide: node_modules có ${version}, ${path.relative(projectDir, constant)} ghi ${expected}.`,
  );
  process.exit(1);
}

console.log(`Đã chép Pyodide ${version} → apps/web/public/pyodide/${version}/`);

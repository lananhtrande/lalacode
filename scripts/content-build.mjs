#!/usr/bin/env node
// Build content/ thành bundle JSON tĩnh cho apps/web.
// Chạy tự động trước `vite` và `vite build` (xem apps/web/package.json).
import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { validateCourseTree } from '@lalakode/content-schema';
import { readContentTree, projectDir } from './lib/read-content.mjs';
import { buildBundle } from './lib/build-bundle.mjs';
import { printIssues } from './lib/report.mjs';

const outDir = path.join(projectDir, 'apps', 'web', 'public', 'content');

const { courses, issues: readIssues } = await readContentTree();
// Không bao giờ build bundle từ nội dung sai: bundle là thứ trẻ tải về.
const errors = [...readIssues, ...validateCourseTree(courses)].filter(
  (issue) => issue.level === 'error',
);
if (errors.length) {
  printIssues(errors);
  console.error(
    '\nKhông build được bundle vì nội dung lỗi — sửa rồi chạy `npm run content:check`.',
  );
  process.exit(1);
}

const { index, files } = buildBundle(courses);

// Xoá hẳn thư mục cũ để không còn sót file hash cũ.
await rm(outDir, { recursive: true, force: true });
await mkdir(path.join(outDir, 'lessons'), { recursive: true });

for (const file of files) {
  await writeFile(path.join(outDir, file.path), JSON.stringify(file.json), 'utf8');
}
await writeFile(path.join(outDir, 'index.json'), JSON.stringify(index), 'utf8');

const lessonCount = index.courses.reduce((total, course) => total + course.lessons.length, 0);
console.log(
  `Đã build bundle nội dung: ${index.courses.length} khoá, ${lessonCount} bài → apps/web/public/content/`,
);

#!/usr/bin/env node
// Chạy thật lời giải mẫu và starter code của từng bài tập bằng CPython:
// solution phải pass TẤT CẢ test, starterCode phải fail ÍT NHẤT MỘT test.
import process from 'node:process';
import { exerciseSchema } from '@lalacode/content-schema';
import { readContentTree } from './lib/read-content.mjs';
import { printIssues } from './lib/report.mjs';
import { findPython } from './lib/python.mjs';
import { runGrader } from './lib/run-grader.mjs';

const failedTestLines = (report) =>
  report.results
    .filter((result) => !result.passed)
    .map(
      (result) =>
        `          - test #${result.index + 1} (${result.type}): ${result.detail ?? 'fail'}`,
    );

const python = findPython();
if (python.error) {
  console.error(python.error);
  process.exit(1);
}
console.log(`Dùng ${python.command} (CPython ${python.version}).\n`);

const { courses, issues: readIssues } = await readContentTree();
const issues = [...readIssues];
let checked = 0;

for (const course of courses) {
  for (const lesson of course.lessons) {
    for (const exerciseFile of lesson.exercises) {
      const where = exerciseFile.where;
      const parsed = exerciseSchema.safeParse(exerciseFile.data);
      if (!parsed.success) {
        issues.push({
          level: 'error',
          where,
          message: 'Bài tập chưa hợp lệ theo schema — chạy `npm run content:check` trước.',
        });
        continue;
      }
      const exercise = parsed.data;
      checked += 1;

      const solutionRun = await runGrader(
        python.command,
        { code: exercise.solution, tests: exercise.tests },
        exercise.timeoutMs,
      );
      if (solutionRun.timedOut) {
        issues.push({ level: 'error', where, message: 'Lời giải mẫu chạy quá giờ.' });
      } else if (solutionRun.crashed) {
        issues.push({
          level: 'error',
          where,
          message: `Lời giải mẫu lỗi — ${solutionRun.crashed}`,
        });
      } else if (!solutionRun.report.passed) {
        issues.push({
          level: 'error',
          where,
          message: [
            'Lời giải mẫu không pass hết test:',
            ...failedTestLines(solutionRun.report),
          ].join('\n'),
        });
      }

      const starterRun = await runGrader(
        python.command,
        { code: exercise.starterCode, tests: exercise.tests },
        exercise.timeoutMs,
      );
      if (starterRun.timedOut) {
        issues.push({
          level: 'error',
          where,
          message: 'Starter code chạy quá giờ — trẻ sẽ phải chờ vô ích.',
        });
      } else if (starterRun.crashed) {
        issues.push({ level: 'error', where, message: `Starter code lỗi — ${starterRun.crashed}` });
      } else if (starterRun.report.passed) {
        issues.push({
          level: 'error',
          where,
          message: 'Starter code đã pass hết test — bài tập không có gì để làm.',
        });
      }
    }
  }
}

const { errors, warnings } = printIssues(issues);
const summary = `Đã chạy thử ${checked} bài tập (lời giải + starter).`;
if (errors) {
  console.log(`\n${summary} ${errors} lỗi, ${warnings} cảnh báo.`);
  process.exit(1);
}
console.log(`\n${summary} Tất cả lời giải pass, tất cả starter fail đúng như mong đợi.`);

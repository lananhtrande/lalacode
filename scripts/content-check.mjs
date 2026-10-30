#!/usr/bin/env node
// Kiểm tra nội dung trong content/ theo schema (packages/content-schema).
// Phần logic nằm trong `validateCourseTree`; ở đây chỉ đọc file và in kết quả.
import process from 'node:process';
import { validateCourseTree } from '@lalakode/content-schema';
import { readContentTree } from './lib/read-content.mjs';
import { countContent, printIssues } from './lib/report.mjs';

const { courses, issues: readIssues } = await readContentTree();
const issues = [...readIssues, ...validateCourseTree(courses)];

const { errors, warnings } = printIssues(issues);
const { lessonCount, exerciseCount } = countContent(courses);
const summary = `Đã kiểm tra ${courses.length} khoá, ${lessonCount} bài học, ${exerciseCount} bài tập.`;

if (errors) {
  console.log(`\n${summary} ${errors} lỗi, ${warnings} cảnh báo.`);
  process.exit(1);
}
console.log(`\n${summary} Không có lỗi${warnings ? `, ${warnings} cảnh báo` : ''}.`);

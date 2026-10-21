#!/usr/bin/env node
// Đọc content/courses và kiểm tra theo schema (packages/content-schema).
// Phần logic nằm trong `validateCourseTree` — ở đây chỉ đọc file và in kết quả.
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { validateCourseTree } from '@lalacode/content-schema';

const projectDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const coursesDir = path.join(projectDir, 'content', 'courses');

async function listDirs(dir) {
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}

async function readJson(file) {
  let text;
  try {
    text = await readFile(file, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') return { missing: true };
    throw error;
  }
  try {
    return { data: JSON.parse(text) };
  } catch (error) {
    return { parseError: error.message };
  }
}

async function readTextOrNull(file) {
  try {
    return await readFile(file, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

const issues = [];
const courses = [];

for (const courseDir of await listDirs(coursesDir)) {
  const courseRoot = path.join(coursesDir, courseDir);
  const courseJson = await readJson(path.join(courseRoot, 'course.json'));
  if (courseJson.missing) {
    issues.push({
      level: 'error',
      where: `content/courses/${courseDir}/course.json`,
      message: 'Thiếu file `course.json`.',
    });
    continue;
  }
  if (courseJson.parseError) {
    issues.push({
      level: 'error',
      where: `content/courses/${courseDir}/course.json`,
      message: `JSON không hợp lệ — ${courseJson.parseError}`,
    });
    continue;
  }

  const lessons = [];
  const lessonsRoot = path.join(courseRoot, 'lessons');
  for (const lessonDir of await listDirs(lessonsRoot)) {
    const lessonRoot = path.join(lessonsRoot, lessonDir);
    const base = `content/courses/${courseDir}/lessons/${lessonDir}`;
    const lessonJson = await readJson(path.join(lessonRoot, 'lesson.json'));
    if (lessonJson.missing) {
      issues.push({
        level: 'error',
        where: `${base}/lesson.json`,
        message: 'Thiếu file `lesson.json`.',
      });
      continue;
    }
    if (lessonJson.parseError) {
      issues.push({
        level: 'error',
        where: `${base}/lesson.json`,
        message: `JSON không hợp lệ — ${lessonJson.parseError}`,
      });
      continue;
    }

    const exercises = [];
    const exercisesRoot = path.join(lessonRoot, 'exercises');
    let exerciseFiles = [];
    try {
      exerciseFiles = (await readdir(exercisesRoot))
        .filter((name) => name.endsWith('.json'))
        .sort();
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    for (const fileName of exerciseFiles) {
      const file = fileName.replace(/\.json$/, '');
      const exerciseJson = await readJson(path.join(exercisesRoot, fileName));
      if (exerciseJson.parseError) {
        issues.push({
          level: 'error',
          where: `${base}/exercises/${fileName}`,
          message: `JSON không hợp lệ — ${exerciseJson.parseError}`,
        });
        continue;
      }
      exercises.push({ file, data: exerciseJson.data });
    }

    lessons.push({
      dir: lessonDir,
      lesson: lessonJson.data,
      markdown: await readTextOrNull(path.join(lessonRoot, 'lesson.md')),
      exercises,
    });
  }

  courses.push({ dir: courseDir, course: courseJson.data, lessons });
}

issues.push(...validateCourseTree(courses));

const errors = issues.filter((issue) => issue.level === 'error');
const warnings = issues.filter((issue) => issue.level === 'warning');

for (const issue of [...errors, ...warnings]) {
  const tag = issue.level === 'error' ? 'LỖI  ' : 'CẢNH BÁO';
  console.log(`${tag} ${issue.where}\n        ${issue.message}`);
}

const lessonCount = courses.reduce((total, course) => total + course.lessons.length, 0);
const exerciseCount = courses.reduce(
  (total, course) =>
    total + course.lessons.reduce((sum, lesson) => sum + lesson.exercises.length, 0),
  0,
);

const summary = `Đã kiểm tra ${courses.length} khoá, ${lessonCount} bài học, ${exerciseCount} bài tập.`;
if (errors.length) {
  console.log(`\n${summary} ${errors.length} lỗi, ${warnings.length} cảnh báo.`);
  process.exit(1);
}
console.log(`\n${summary} Không có lỗi${warnings.length ? `, ${warnings.length} cảnh báo` : ''}.`);

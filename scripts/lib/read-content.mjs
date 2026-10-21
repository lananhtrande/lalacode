// Đọc cây nội dung trong content/courses thành dữ liệu thuần.
// Dùng chung cho content:check và content:verify.
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const projectDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

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

/**
 * @returns {Promise<{ courses: object[], issues: {level: string, where: string, message: string}[] }>}
 * `courses` có dạng mà `validateCourseTree` nhận; `issues` là lỗi đọc/parse file.
 */
export async function readContentTree() {
  const coursesDir = path.join(projectDir, 'content', 'courses');
  const issues = [];
  const courses = [];

  for (const courseDir of await listDirs(coursesDir)) {
    const courseRoot = path.join(coursesDir, courseDir);
    const courseWhere = `content/courses/${courseDir}/course.json`;
    const courseJson = await readJson(path.join(courseRoot, 'course.json'));
    if (courseJson.missing) {
      issues.push({ level: 'error', where: courseWhere, message: 'Thiếu file `course.json`.' });
      continue;
    }
    if (courseJson.parseError) {
      issues.push({
        level: 'error',
        where: courseWhere,
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
        const exerciseJson = await readJson(path.join(exercisesRoot, fileName));
        if (exerciseJson.parseError) {
          issues.push({
            level: 'error',
            where: `${base}/exercises/${fileName}`,
            message: `JSON không hợp lệ — ${exerciseJson.parseError}`,
          });
          continue;
        }
        exercises.push({
          file: fileName.replace(/\.json$/, ''),
          data: exerciseJson.data,
          where: `${base}/exercises/${fileName}`,
        });
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

  return { courses, issues };
}

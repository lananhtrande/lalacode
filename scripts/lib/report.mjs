// In lỗi/cảnh báo theo một kiểu thống nhất cho các script nội dung.

/** @returns {{errors: number, warnings: number}} */
export function printIssues(issues) {
  const errors = issues.filter((issue) => issue.level === 'error');
  const warnings = issues.filter((issue) => issue.level === 'warning');
  for (const issue of [...errors, ...warnings]) {
    const tag = issue.level === 'error' ? 'LỖI  ' : 'CẢNH BÁO';
    console.log(`${tag} ${issue.where}\n        ${issue.message}`);
  }
  return { errors: errors.length, warnings: warnings.length };
}

export function countContent(courses) {
  const lessonCount = courses.reduce((total, course) => total + course.lessons.length, 0);
  const exerciseCount = courses.reduce(
    (total, course) =>
      total + course.lessons.reduce((sum, lesson) => sum + lesson.exercises.length, 0),
    0,
  );
  return { lessonCount, exerciseCount };
}

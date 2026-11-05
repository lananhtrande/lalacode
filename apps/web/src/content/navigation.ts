import type { ContentIndex, LessonBundle } from './types';

/**
 * Bài trước/bài tiếp (S0-36). Hàm thuần, chỉ đọc dữ liệu đã có trong tay:
 * `index.json` cho thứ tự bài học (đúng `order` của khoá), bundle của bài học
 * đang mở cho thứ tự bài tập (đúng `exercises` của bài học). Không tải trước
 * bài học kế tiếp: đi sang bài học khác thì chỉ cần mã của nó.
 */

export type NavTarget =
  | { kind: 'exercise'; id: string; title: string }
  | { kind: 'lesson'; id: string; title: string }
  /** Hết khoá học: quay về bản đồ. */
  | { kind: 'map' };

export interface Neighbours {
  /** `null` khi đang ở bài học đầu khoá. */
  previous: NavTarget | null;
  next: NavTarget;
}

export function hrefOf(target: NavTarget): string {
  switch (target.kind) {
    case 'exercise':
      return `/bai-tap/${target.id}`;
    case 'lesson':
      return `/bai-hoc/${target.id}`;
    case 'map':
      return '/ban-do';
  }
}

/** Bài học trước/tiếp trong cùng khoá. `null` nếu không có bài học này. */
export function lessonNeighbours(index: ContentIndex, lessonId: string): Neighbours | null {
  for (const course of index.courses) {
    const position = course.lessons.findIndex((lesson) => lesson.id === lessonId);
    if (position === -1) continue;
    const previous = course.lessons[position - 1];
    const next = course.lessons[position + 1];
    return {
      previous: previous ? { kind: 'lesson', id: previous.id, title: previous.title } : null,
      next: next ? { kind: 'lesson', id: next.id, title: next.title } : { kind: 'map' },
    };
  }
  return null;
}

/**
 * Bài tập trước/tiếp. Bài tập đầu thì "trước" là trang bài học của nó; bài tập
 * cuối thì "tiếp" là bài học kế tiếp, hoặc bản đồ nếu đã hết khoá.
 * `null` nếu bài tập không thuộc bài học này.
 */
export function exerciseNeighbours(
  index: ContentIndex,
  lesson: Pick<LessonBundle, 'lesson' | 'exercises'>,
  exerciseId: string,
): Neighbours | null {
  const titles = new Map(lesson.exercises.map((exercise) => [exercise.id, exercise.title]));
  const ordered = lesson.lesson.exercises
    .map((slug) => `${lesson.lesson.id}.${slug}`)
    .filter((id) => titles.has(id))
    .map((id) => ({ kind: 'exercise' as const, id, title: titles.get(id) ?? '' }));

  const position = ordered.findIndex((exercise) => exercise.id === exerciseId);
  if (position === -1) return null;

  const previous: NavTarget = ordered[position - 1] ?? {
    kind: 'lesson',
    id: lesson.lesson.id,
    title: lesson.lesson.title,
  };
  const next = ordered[position + 1] ??
    lessonNeighbours(index, lesson.lesson.id)?.next ?? { kind: 'map' };
  return { previous, next };
}

export interface Completion {
  /** Mọi bài tập của bài học này đã xong. */
  lessonDone: boolean;
  /** Mọi bài tập của cả khoá chứa bài học này đã xong. */
  courseDone: boolean;
}

/**
 * Trẻ đã xong bài học / cả khoá chưa, từ danh sách bài tập đã xong (đọc từ
 * tiến độ trên máy). Dùng để chọn đúng câu chúc mừng: không khen "xong khoá"
 * khi còn bài chưa làm.
 */
export function completionOf(
  index: ContentIndex,
  lesson: Pick<LessonBundle, 'lesson'>,
  doneExerciseIds: ReadonlySet<string>,
): Completion {
  const lessonId = lesson.lesson.id;
  const lessonDone = lesson.lesson.exercises.every((slug) =>
    doneExerciseIds.has(`${lessonId}.${slug}`),
  );
  const doneByLesson = new Map<string, number>();
  for (const id of doneExerciseIds) {
    const owner = id.split('.').slice(0, 2).join('.');
    doneByLesson.set(owner, (doneByLesson.get(owner) ?? 0) + 1);
  }
  const course = index.courses.find((item) => item.lessons.some((l) => l.id === lessonId));
  const courseDone =
    lessonDone &&
    course !== undefined &&
    course.lessons.every(
      (item) => item.id === lessonId || (doneByLesson.get(item.id) ?? 0) >= item.exerciseCount,
    );
  return { lessonDone, courseDone };
}

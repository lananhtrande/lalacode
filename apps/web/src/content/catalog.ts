import type { CourseLevel } from '@lalakode/content-schema';
import type { ChapterSummary, CourseSummary, LessonSummary } from './types';

/**
 * Catalog khoá học và trang khoá (S0-37). Hàm thuần: nhận index nội dung và số
 * bài tập đã xong theo bài học (đọc từ IndexedDB trên máy), không gọi mạng.
 */

export type CourseStatus = 'chua-hoc' | 'dang-hoc' | 'da-xong';
export type LessonStatus = CourseStatus;

/** Bài học kèm số thứ tự trong khoá (bắt đầu từ 1) và tiến độ. */
export interface LessonProgressView {
  lesson: LessonSummary;
  number: number;
  doneExercises: number;
  status: LessonStatus;
}

export interface ChapterProgressView {
  chapter: ChapterSummary;
  /** Số thứ tự chương, bắt đầu từ 1. */
  number: number;
  lessons: LessonProgressView[];
  doneLessons: number;
}

export interface CourseProgress {
  status: CourseStatus;
  doneLessons: number;
  totalLessons: number;
  /** 0–100, theo số **bài học** đã xong ("7/20 bài · 35%"). */
  percent: number;
  /** Bài đầu tiên chưa xong theo thứ tự khoá; `null` khi đã xong hết. */
  nextLesson: LessonProgressView | null;
  totalMinutes: number;
  lessons: LessonProgressView[];
  chapters: ChapterProgressView[];
}

export function lessonStatus(lesson: LessonSummary, doneExercises: number): LessonStatus {
  if (lesson.exerciseCount > 0 && doneExercises >= lesson.exerciseCount) return 'da-xong';
  return doneExercises > 0 ? 'dang-hoc' : 'chua-hoc';
}

export function courseProgress(
  course: CourseSummary,
  doneByLesson: ReadonlyMap<string, number>,
): CourseProgress {
  const lessons = course.lessons.map((lesson, index) => {
    const doneExercises = doneByLesson.get(lesson.id) ?? 0;
    return {
      lesson,
      number: index + 1,
      doneExercises,
      status: lessonStatus(lesson, doneExercises),
    };
  });
  const byId = new Map(lessons.map((view) => [view.lesson.id, view]));
  const doneLessons = lessons.filter((view) => view.status === 'da-xong').length;
  const started = lessons.some((view) => view.status !== 'chua-hoc');

  const chapters = course.chapters.map((chapter, index) => {
    const views = chapter.lessonIds.map((id) => byId.get(id)).filter((view) => view !== undefined);
    return {
      chapter,
      number: index + 1,
      lessons: views,
      doneLessons: views.filter((view) => view.status === 'da-xong').length,
    };
  });

  return {
    status:
      lessons.length > 0 && doneLessons === lessons.length
        ? 'da-xong'
        : started
          ? 'dang-hoc'
          : 'chua-hoc',
    doneLessons,
    totalLessons: lessons.length,
    percent: lessons.length === 0 ? 0 : Math.round((doneLessons / lessons.length) * 100),
    nextLesson: lessons.find((view) => view.status !== 'da-xong') ?? null,
    totalMinutes: lessons.reduce((total, view) => total + view.lesson.estimatedMinutes, 0),
    lessons,
    chapters,
  };
}

/** Chương chứa bài đang học (mở sẵn trên trang khoá); xong hết thì chương đầu. */
export function currentChapterId(progress: CourseProgress): string | undefined {
  const next = progress.nextLesson;
  const chapter = next
    ? progress.chapters.find((item) => item.lessons.some((view) => view === next))
    : undefined;
  return (chapter ?? progress.chapters[0])?.chapter.id;
}

/** "khoảng 5 giờ", "khoảng 45 phút": số liệu ước lượng, không cần chính xác. */
export function approximateDuration(minutes: number): { value: number; unit: 'gio' | 'phut' } {
  if (minutes < 60) return { value: Math.max(5, Math.round(minutes / 5) * 5), unit: 'phut' };
  return { value: Math.round(minutes / 60), unit: 'gio' };
}

// ---------------------------------------------------------------------------
// Bộ lọc catalog, giữ trên URL: `?trang-thai=dang-hoc&cap-do=moi-bat-dau&tim=rua`
// ---------------------------------------------------------------------------

export type StatusFilter = 'tat-ca' | CourseStatus;
export const statusFilters: readonly StatusFilter[] = ['tat-ca', 'dang-hoc', 'da-xong', 'chua-hoc'];
export const levelFilters: readonly CourseLevel[] = ['moi-bat-dau', 'co-ban', 'nang-cao'];

export interface CatalogFilter {
  status: StatusFilter;
  level: CourseLevel | null;
  query: string;
}

export const PARAM_STATUS = 'trang-thai';
export const PARAM_LEVEL = 'cap-do';
export const PARAM_QUERY = 'tim';

/** Giá trị lạ trên URL (gõ tay, link cũ) thì coi như không lọc. */
export function parseCatalogFilter(params: URLSearchParams): CatalogFilter {
  const status = params.get(PARAM_STATUS);
  const level = params.get(PARAM_LEVEL);
  return {
    status: statusFilters.find((item) => item === status) ?? 'tat-ca',
    level: levelFilters.find((item) => item === level) ?? null,
    query: params.get(PARAM_QUERY) ?? '',
  };
}

/** Chỉ ghi lên URL những bộ lọc đang bật, để link gọn. */
export function catalogFilterParams(filter: CatalogFilter): URLSearchParams {
  const params = new URLSearchParams();
  if (filter.status !== 'tat-ca') params.set(PARAM_STATUS, filter.status);
  if (filter.level) params.set(PARAM_LEVEL, filter.level);
  if (filter.query.trim()) params.set(PARAM_QUERY, filter.query);
  return params;
}

export function isFiltering(filter: CatalogFilter): boolean {
  return filter.status !== 'tat-ca' || filter.level !== null || filter.query.trim() !== '';
}

/** Bỏ dấu và viết thường: gõ "rua" vẫn tìm ra "Rùa", gõ "đ" hay "d" đều được. */
export function foldVietnamese(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Mn}/gu, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

export function filterCourses<T extends { course: CourseSummary; progress: CourseProgress }>(
  items: readonly T[],
  filter: CatalogFilter,
): T[] {
  const query = foldVietnamese(filter.query);
  return items.filter(({ course, progress }) => {
    if (filter.status !== 'tat-ca' && progress.status !== filter.status) return false;
    if (filter.level && course.level !== filter.level) return false;
    if (query && !foldVietnamese(course.title).includes(query)) return false;
    return true;
  });
}

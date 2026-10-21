import type { ContentIndex, LessonBundle, LessonSummary } from './types';

/**
 * Tải nội dung đã build (`public/content/`). Bundle là file tĩnh trên cùng
 * domain — không gọi ra dịch vụ ngoài nào.
 *
 * `index.json` tên cố định (cache ngắn); file bài học có hash trong tên nên
 * cache được vĩnh viễn.
 */

const BASE_URL = '/content';

export class ContentError extends Error {
  constructor(
    message: string,
    readonly code: 'index-not-found' | 'lesson-not-found' | 'network',
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = 'ContentError';
  }
}

let indexPromise: Promise<ContentIndex> | null = null;
const lessonPromises = new Map<string, Promise<LessonBundle>>();

async function fetchJson<T>(url: string, code: ContentError['code']): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url);
  } catch (cause) {
    throw new ContentError(`Không tải được ${url}`, 'network', { cause });
  }
  if (!response.ok) {
    throw new ContentError(`Không tải được ${url} (HTTP ${response.status})`, code);
  }
  return (await response.json()) as T;
}

export function loadContentIndex(): Promise<ContentIndex> {
  indexPromise ??= fetchJson<ContentIndex>(`${BASE_URL}/index.json`, 'index-not-found');
  return indexPromise;
}

export async function findLessonSummary(lessonId: string): Promise<LessonSummary | undefined> {
  const index = await loadContentIndex();
  for (const course of index.courses) {
    const lesson = course.lessons.find((item) => item.id === lessonId);
    if (lesson) return lesson;
  }
  return undefined;
}

export async function loadLesson(lessonId: string): Promise<LessonBundle> {
  const cached = lessonPromises.get(lessonId);
  if (cached) return cached;

  const summary = await findLessonSummary(lessonId);
  if (!summary) {
    throw new ContentError(`Không có bài học \`${lessonId}\` trong bundle`, 'lesson-not-found');
  }
  const promise = fetchJson<LessonBundle>(`${BASE_URL}/${summary.file}`, 'lesson-not-found');
  lessonPromises.set(lessonId, promise);
  return promise;
}

/** Chỉ dùng trong test: xoá cache trong bộ nhớ. */
export function resetContentCache(): void {
  indexPromise = null;
  lessonPromises.clear();
}

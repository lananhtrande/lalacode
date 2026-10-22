import type { ExerciseContext } from './prompt';

/**
 * Lấy đề bài theo `exerciseId` từ **bundle nội dung đã phát hành**, không tin
 * đề bài do client gửi (docs/architecture.md §4). Bundle là file tĩnh trên
 * chính domain của mình, không có lời giải trong đó.
 */

interface LessonBundle {
  exercises: { id: string; title: string; prompt: string }[];
}

interface ContentIndex {
  courses: { lessons: { id: string; file: string }[] }[];
}

const CACHE_TTL_MS = 5 * 60 * 1000;

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

let indexCache: CacheEntry<ContentIndex> | null = null;
const lessonCache = new Map<string, CacheEntry<LessonBundle>>();

/** Chỉ dùng trong test. */
export function resetContentCache(): void {
  indexCache = null;
  lessonCache.clear();
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Không tải được ${url} (HTTP ${response.status})`);
  return (await response.json()) as T;
}

export async function findExercise(
  exerciseId: string,
  baseUrl: string,
  now: number = Date.now(),
): Promise<ExerciseContext | undefined> {
  const lessonId = exerciseId.split('.').slice(0, 2).join('.');

  if (!indexCache || indexCache.expiresAt < now) {
    const value = await fetchJson<ContentIndex>(`${baseUrl}/content/index.json`);
    indexCache = { value, expiresAt: now + CACHE_TTL_MS };
  }

  const lesson = indexCache.value.courses
    .flatMap((course) => course.lessons)
    .find((item) => item.id === lessonId);
  if (!lesson) return undefined;

  const cached = lessonCache.get(lessonId);
  let bundle: LessonBundle;
  if (cached && cached.expiresAt >= now) {
    bundle = cached.value;
  } else {
    bundle = await fetchJson<LessonBundle>(`${baseUrl}/content/${lesson.file}`);
    lessonCache.set(lessonId, { value: bundle, expiresAt: now + CACHE_TTL_MS });
  }

  const exercise = bundle.exercises.find((item) => item.id === exerciseId);
  return exercise ? { title: exercise.title, prompt: exercise.prompt } : undefined;
}

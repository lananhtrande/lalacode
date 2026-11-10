import type { Difficulty } from '@lalakode/content-schema';
import type { ContentIndex } from './types';

/**
 * Thứ tự độ khó, dễ → khó. Viết lại ở đây thay vì import từ content-schema để
 * zod không lọt vào bundle trình duyệt; `satisfies` chốt rằng danh sách khớp kiểu.
 */
export const difficulties = [
  'de',
  'vua',
  'kho',
  'thu-thach',
] as const satisfies readonly Difficulty[];

/**
 * Kho luyện tập `/luyen-tap` (S0-40). Hàm thuần trên `index.json` (đã có tên và
 * độ khó của mọi bài tập) và danh sách bài đã xong / để dành đọc từ máy. Không
 * tải từng bài học, không gọi mạng.
 */

export interface PracticeItem {
  id: string;
  title: string;
  difficulty: Difficulty | undefined;
  lessonId: string;
  lessonTitle: string;
  /** Số thứ tự bài học trong khoá, bắt đầu từ 1. */
  lessonNumber: number;
  courseId: string;
  chapterId: string | undefined;
  /** Chủ đề của bài học chứa bài tập. */
  tags: readonly string[];
}

/** Mọi bài tập của mọi khoá, đúng thứ tự học (khoá → bài học → bài tập). */
export function practiceItems(index: ContentIndex): PracticeItem[] {
  return index.courses.flatMap((course) =>
    course.lessons.flatMap((lesson, position) => {
      const chapter = course.chapters.find((item) => item.lessonIds.includes(lesson.id));
      return lesson.exercises.map((exercise) => ({
        id: exercise.id,
        title: exercise.title,
        difficulty: exercise.difficulty,
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        lessonNumber: position + 1,
        courseId: course.id,
        chapterId: chapter?.id,
        tags: lesson.tags,
      }));
    }),
  );
}

/** Bộ bài theo chương: "Làm quen với Python · 3/18". */
export interface PracticeSet {
  id: string;
  title: string;
  total: number;
  done: number;
}

export function practiceSets(
  index: ContentIndex,
  items: readonly PracticeItem[],
  done: ReadonlySet<string>,
): PracticeSet[] {
  return index.courses.flatMap((course) =>
    course.chapters.map((chapter) => {
      const inSet = items.filter((item) => item.chapterId === chapter.id);
      return {
        id: chapter.id,
        title: chapter.title,
        total: inSet.length,
        done: inSet.filter((item) => done.has(item.id)).length,
      };
    }),
  );
}

/** Mọi chủ đề có bài tập, theo thứ tự xuất hiện lần đầu trong khoá. */
export function practiceTopics(items: readonly PracticeItem[]): string[] {
  return [...new Set(items.flatMap((item) => item.tags))];
}

// ---------------------------------------------------------------------------
// Bộ lọc, giữ trên URL: `?do=de&do=vua&chu-de=rùa&trang-thai=chua-lam&bo=…&de-danh=1`
// ---------------------------------------------------------------------------

export type PracticeStatus = 'tat-ca' | 'chua-lam' | 'da-xong';
export const practiceStatuses: readonly PracticeStatus[] = ['tat-ca', 'chua-lam', 'da-xong'];

export interface PracticeFilter {
  difficulties: readonly Difficulty[];
  topics: readonly string[];
  status: PracticeStatus;
  /** Bộ bài (chương) đang chọn ở băng trên cùng. */
  set: string | null;
  savedOnly: boolean;
}

export const emptyPracticeFilter: PracticeFilter = {
  difficulties: [],
  topics: [],
  status: 'tat-ca',
  set: null,
  savedOnly: false,
};

export function parsePracticeFilter(params: URLSearchParams): PracticeFilter {
  const status = params.get('trang-thai');
  return {
    difficulties: difficulties.filter((value) => params.getAll('do').includes(value)),
    topics: params.getAll('chu-de').filter((value) => value !== ''),
    status: practiceStatuses.find((value) => value === status) ?? 'tat-ca',
    set: params.get('bo') || null,
    savedOnly: params.get('de-danh') === '1',
  };
}

export function practiceFilterParams(filter: PracticeFilter): URLSearchParams {
  const params = new URLSearchParams();
  for (const value of filter.difficulties) params.append('do', value);
  for (const value of filter.topics) params.append('chu-de', value);
  if (filter.status !== 'tat-ca') params.set('trang-thai', filter.status);
  if (filter.set) params.set('bo', filter.set);
  if (filter.savedOnly) params.set('de-danh', '1');
  return params;
}

export function isPracticeFiltering(filter: PracticeFilter): boolean {
  return practiceFilterParams(filter).size > 0;
}

export interface Progress {
  done: ReadonlySet<string>;
  saved: ReadonlySet<string>;
}

/** Trong một nhóm thì "hoặc" (Dễ hoặc Vừa), giữa các nhóm thì "và". */
export function filterPractice(
  items: readonly PracticeItem[],
  filter: PracticeFilter,
  progress: Progress,
): PracticeItem[] {
  return items.filter(
    (item) =>
      (filter.difficulties.length === 0 ||
        (item.difficulty !== undefined && filter.difficulties.includes(item.difficulty))) &&
      (filter.topics.length === 0 || item.tags.some((tag) => filter.topics.includes(tag))) &&
      (filter.status === 'tat-ca' ||
        (filter.status === 'da-xong') === progress.done.has(item.id)) &&
      (filter.set === null || item.chapterId === filter.set) &&
      (!filter.savedOnly || progress.saved.has(item.id)),
  );
}

/**
 * Số bài cho từng độ khó nếu chọn thêm độ khó đó, với các bộ lọc khác giữ
 * nguyên — để trẻ biết bấm vào sẽ ra bao nhiêu bài.
 */
export function difficultyCounts(
  items: readonly PracticeItem[],
  filter: PracticeFilter,
  progress: Progress,
): Record<Difficulty, number> {
  const others = filterPractice(items, { ...filter, difficulties: [] }, progress);
  return Object.fromEntries(
    difficulties.map((value) => [value, others.filter((item) => item.difficulty === value).length]),
  ) as Record<Difficulty, number>;
}

export function topicCounts(
  items: readonly PracticeItem[],
  filter: PracticeFilter,
  progress: Progress,
): Map<string, number> {
  const others = filterPractice(items, { ...filter, topics: [] }, progress);
  return new Map(
    practiceTopics(items).map((topic) => [
      topic,
      others.filter((item) => item.tags.includes(topic)).length,
    ]),
  );
}

/** "Bài ngẫu nhiên": một bài **chưa xong** trong danh sách đang lọc; hết bài thì `null`. */
export function randomPick(
  shown: readonly PracticeItem[],
  done: ReadonlySet<string>,
  random: () => number = Math.random,
): PracticeItem | null {
  const open = shown.filter((item) => !done.has(item.id));
  return open[Math.floor(random() * open.length)] ?? null;
}

/** "Tiếp tục": bài tập chưa xong đầu tiên theo thứ tự khoá. */
export function continueItem(
  items: readonly PracticeItem[],
  done: ReadonlySet<string>,
): PracticeItem | null {
  return items.find((item) => !done.has(item.id)) ?? null;
}

/** Băm FNV-1a 32-bit: cùng chuỗi thì cùng số, trên mọi máy. */
function hash(text: string): number {
  let value = 0x811c9dc5;
  for (const char of text) {
    value ^= char.codePointAt(0) ?? 0;
    value = Math.imul(value, 0x01000193) >>> 0;
  }
  return value;
}

/**
 * "Thử thách hôm nay": chọn theo ngày địa phương (`YYYY-MM-DD`), tất định —
 * mọi máy cùng ngày thấy cùng một bài, không cần gọi mạng. Ưu tiên bài khó
 * nhất đang có; chưa bài nào ghi độ khó thì chọn trong tất cả.
 */
export function dailyChallenge(items: readonly PracticeItem[], day: string): PracticeItem | null {
  const hardest = [...difficulties]
    .reverse()
    .map((value) => items.filter((item) => item.difficulty === value))
    .find((group) => group.length > 0);
  const pool = hardest ?? items;
  return pool[hash(day) % pool.length] ?? null;
}

// ---------------------------------------------------------------------------
// Lịch chuỗi ngày học của tháng
// ---------------------------------------------------------------------------

export interface CalendarDay {
  /** `YYYY-MM-DD`. */
  key: string;
  day: number;
  active: boolean;
  today: boolean;
}

/**
 * Các tuần của tháng chứa `today` (`YYYY-MM-DD`), bắt đầu từ thứ Hai; ô trống
 * đầu/cuối tháng là `null`. `activeDays` là những ngày có làm bài trên máy này.
 */
export function monthCalendar(
  today: string,
  activeDays: ReadonlySet<string>,
): (CalendarDay | null)[][] {
  const [year = 1970, month = 1] = today.split('-').map(Number);
  const first = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  const leading = (first.getDay() + 6) % 7;
  const cells: (CalendarDay | null)[] = Array.from({ length: leading }, () => null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    const key = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    cells.push({ key, day, active: activeDays.has(key), today: key === today });
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return Array.from({ length: cells.length / 7 }, (_, week) => cells.slice(week * 7, week * 7 + 7));
}

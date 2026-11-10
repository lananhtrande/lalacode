import { describe, expect, it } from 'vitest';
import { difficulties as schemaDifficulties } from '@lalakode/content-schema';
import {
  continueItem,
  dailyChallenge,
  difficulties,
  difficultyCounts,
  emptyPracticeFilter,
  filterPractice,
  monthCalendar,
  parsePracticeFilter,
  practiceFilterParams,
  practiceItems,
  practiceSets,
  randomPick,
  topicCounts,
  type PracticeFilter,
} from './practice';
import type { ContentIndex, LessonSummary } from './types';

function lesson(
  n: number,
  tags: string[],
  exercises: [string, string | undefined][],
): LessonSummary {
  const id = `py.0${n}-bai`;
  return {
    id,
    slug: `0${n}-bai`,
    title: `Bài ${n}`,
    concepts: ['x'],
    estimatedMinutes: 10,
    tags,
    status: 'draft',
    exerciseCount: exercises.length,
    exercises: exercises.map(([slug, difficulty]) => ({
      id: `${id}.${slug}`,
      title: slug,
      ...(difficulty ? { difficulty: difficulty as 'de' } : {}),
    })),
    hasVideo: false,
    file: '',
  };
}

const lessons = [
  lesson(
    1,
    ['print'],
    [
      ['01-a', 'de'],
      ['02-b', 'vua'],
    ],
  ),
  lesson(2, ['rùa'], [['01-c', 'de']]),
  lesson(3, ['rùa', 'vòng lặp'], [['01-d', undefined]]),
];
const index: ContentIndex = {
  version: 1,
  courses: [
    {
      id: 'py',
      title: 'Python',
      summary: '',
      ageRange: [10, 15],
      level: 'moi-bat-dau',
      tags: [],
      illustration: 'py.svg',
      status: 'draft',
      chapters: [
        { id: 'c1', title: 'Làm quen', lessonIds: [lessons[0]!.id, lessons[1]!.id] },
        { id: 'c2', title: 'Lặp', lessonIds: [lessons[2]!.id] },
      ],
      lessons,
    },
  ],
};

const items = practiceItems(index);
const none = { done: new Set<string>(), saved: new Set<string>() };
const ids = (list: readonly { id: string }[]) => list.map((item) => item.id.split('.').pop());
const filter = (patch: Partial<PracticeFilter>) => ({ ...emptyPracticeFilter, ...patch });

describe('kho luyện tập', () => {
  it('độ khó viết lại ở đây khớp đúng schema (để zod không vào bundle trình duyệt)', () => {
    expect(difficulties).toEqual(schemaDifficulties);
  });

  it('gom mọi bài tập theo thứ tự khoá, kèm bài học, chương và chủ đề', () => {
    expect(ids(items)).toEqual(['01-a', '02-b', '01-c', '01-d']);
    expect(items[2]).toMatchObject({ lessonNumber: 2, chapterId: 'c1', tags: ['rùa'] });
  });

  it('bộ bài theo chương đếm số bài đã xong', () => {
    expect(practiceSets(index, items, new Set(['py.01-bai.01-a']))).toEqual([
      { id: 'c1', title: 'Làm quen', total: 3, done: 1 },
      { id: 'c2', title: 'Lặp', total: 1, done: 0 },
    ]);
  });

  it('lọc: trong một nhóm là "hoặc", giữa các nhóm là "và"', () => {
    expect(ids(filterPractice(items, filter({ difficulties: ['de', 'vua'] }), none))).toEqual([
      '01-a',
      '02-b',
      '01-c',
    ]);
    expect(
      ids(filterPractice(items, filter({ difficulties: ['de'], topics: ['rùa'] }), none)),
    ).toEqual(['01-c']);
    expect(ids(filterPractice(items, filter({ set: 'c2' }), none))).toEqual(['01-d']);
  });

  it('lọc theo trạng thái và "Để dành"', () => {
    const progress = { done: new Set(['py.01-bai.01-a']), saved: new Set(['py.02-bai.01-c']) };
    expect(ids(filterPractice(items, filter({ status: 'da-xong' }), progress))).toEqual(['01-a']);
    expect(ids(filterPractice(items, filter({ status: 'chua-lam' }), progress))).toEqual([
      '02-b',
      '01-c',
      '01-d',
    ]);
    expect(ids(filterPractice(items, filter({ savedOnly: true }), progress))).toEqual(['01-c']);
  });

  it('đếm cho từng độ khó và chủ đề, giữ nguyên các bộ lọc khác', () => {
    expect(difficultyCounts(items, filter({ topics: ['rùa'] }), none)).toEqual({
      de: 1,
      vua: 0,
      kho: 0,
      'thu-thach': 0,
    });
    expect(topicCounts(items, filter({ difficulties: ['de'] }), none)).toEqual(
      new Map([
        ['print', 1],
        ['rùa', 1],
        ['vòng lặp', 0],
      ]),
    );
  });

  it('bộ lọc đọc/ghi URL được, giá trị lạ thì bỏ qua', () => {
    const params = practiceFilterParams(
      filter({ difficulties: ['de', 'kho'], topics: ['rùa'], status: 'chua-lam', savedOnly: true }),
    );
    expect(params.toString()).toBe('do=de&do=kho&chu-de=r%C3%B9a&trang-thai=chua-lam&de-danh=1');
    expect(parsePracticeFilter(params)).toEqual({
      difficulties: ['de', 'kho'],
      topics: ['rùa'],
      status: 'chua-lam',
      set: null,
      savedOnly: true,
    });
    expect(parsePracticeFilter(new URLSearchParams('do=sieu-kho&trang-thai=bay'))).toEqual(
      emptyPracticeFilter,
    );
  });

  it('"Bài ngẫu nhiên" chỉ chọn bài chưa xong; xong hết thì không có', () => {
    const done = new Set(['py.01-bai.01-a', 'py.01-bai.02-b']);
    expect(ids([randomPick(items, done, () => 0)!])).toEqual(['01-c']);
    expect(ids([randomPick(items, done, () => 0.99)!])).toEqual(['01-d']);
    expect(randomPick(items, new Set(items.map((item) => item.id)))).toBeNull();
  });

  it('"Tiếp tục" là bài chưa xong đầu tiên theo thứ tự khoá', () => {
    expect(continueItem(items, new Set(['py.01-bai.01-a']))?.id).toBe('py.01-bai.02-b');
  });

  it('"Thử thách hôm nay" tất định theo ngày, chọn trong nhóm khó nhất đang có', () => {
    const today = dailyChallenge(items, '2026-11-10');
    expect(dailyChallenge(items, '2026-11-10')).toEqual(today);
    // Khó nhất ở đây là "Vừa", chỉ có một bài.
    expect(today?.id).toBe('py.01-bai.02-b');
    const plain = items.map((item) => ({ ...item, difficulty: undefined }));
    const days = new Set(
      ['2026-11-10', '2026-11-11', '2026-11-12', '2026-11-13'].map(
        (day) => dailyChallenge(plain, day)?.id,
      ),
    );
    expect(days.size).toBeGreaterThan(1);
  });

  it('lịch tháng bắt đầu từ thứ Hai, đánh dấu ngày có học và hôm nay', () => {
    // 1/11/2026 là Chủ nhật → 6 ô trống đầu tuần.
    const weeks = monthCalendar('2026-11-10', new Set(['2026-11-09']));
    expect(weeks[0]?.slice(0, 6)).toEqual([null, null, null, null, null, null]);
    expect(weeks[0]?.[6]).toMatchObject({ key: '2026-11-01', day: 1 });
    const days = weeks.flat().filter((day) => day !== null);
    expect(days).toHaveLength(30);
    expect(days.find((day) => day.key === '2026-11-09')?.active).toBe(true);
    expect(days.find((day) => day.today)?.key).toBe('2026-11-10');
    expect(weeks.every((week) => week.length === 7)).toBe(true);
  });
});

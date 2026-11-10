import { describe, expect, it } from 'vitest';
import {
  approximateDuration,
  catalogFilterParams,
  courseProgress,
  currentChapterId,
  filterCourses,
  foldVietnamese,
  parseCatalogFilter,
} from './catalog';
import type { CourseSummary, LessonSummary } from './types';

function lesson(id: string, exerciseCount = 2, minutes = 15): LessonSummary {
  return {
    id,
    slug: id.split('.')[1] ?? '',
    title: id,
    concepts: ['print'],
    estimatedMinutes: minutes,
    status: 'draft',
    exerciseCount,
    exercises: [],
    hasVideo: false,
    file: `lessons/${id}.json`,
  };
}

const course: CourseSummary = {
  id: 'py',
  title: 'Python khởi động',
  summary: '',
  ageRange: [10, 15],
  level: 'moi-bat-dau',
  tags: [],
  illustration: 'py.svg',
  status: 'draft',
  chapters: [
    { id: 'c1', title: 'Làm quen', lessonIds: ['py.01-a', 'py.02-b'] },
    { id: 'c2', title: 'Lặp lại', lessonIds: ['py.03-c', 'py.04-d'] },
  ],
  lessons: [lesson('py.01-a'), lesson('py.02-b'), lesson('py.03-c'), lesson('py.04-d', 4)],
};

describe('courseProgress', () => {
  it('chưa làm bài tập nào: chưa học, bài tiếp là bài 1, 0%', () => {
    const progress = courseProgress(course, new Map());
    expect(progress).toMatchObject({ status: 'chua-hoc', doneLessons: 0, percent: 0 });
    expect(progress.nextLesson?.number).toBe(1);
    expect(progress.totalMinutes).toBe(60);
  });

  it('xong bài 1, làm dở bài 2: đang học, tiếp tục bài 2, 25%', () => {
    const progress = courseProgress(
      course,
      new Map([
        ['py.01-a', 2],
        ['py.02-b', 1],
      ]),
    );
    expect(progress).toMatchObject({ status: 'dang-hoc', doneLessons: 1, percent: 25 });
    expect(progress.nextLesson).toMatchObject({ number: 2, status: 'dang-hoc' });
    expect(progress.chapters.map((chapter) => chapter.doneLessons)).toEqual([1, 0]);
  });

  it('"tiếp tục" là bài **đầu tiên** chưa xong, kể cả khi đã làm bài sau', () => {
    const progress = courseProgress(
      course,
      new Map([
        ['py.01-a', 2],
        ['py.03-c', 2],
      ]),
    );
    expect(progress.nextLesson?.lesson.id).toBe('py.02-b');
  });

  it('xong mọi bài: đã xong, 100%, không còn bài tiếp', () => {
    const done = new Map(course.lessons.map((item) => [item.id, item.exerciseCount]));
    const progress = courseProgress(course, done);
    expect(progress).toMatchObject({ status: 'da-xong', percent: 100, nextLesson: null });
  });

  it('chương mở sẵn là chương chứa bài đang học; xong hết thì chương đầu', () => {
    expect(
      currentChapterId(
        courseProgress(
          course,
          new Map([
            ['py.01-a', 2],
            ['py.02-b', 2],
          ]),
        ),
      ),
    ).toBe('c2');
    const done = new Map(course.lessons.map((item) => [item.id, item.exerciseCount]));
    expect(currentChapterId(courseProgress(course, done))).toBe('c1');
  });
});

describe('approximateDuration', () => {
  it('từ 60 phút trở lên tính theo giờ, làm tròn', () => {
    expect(approximateDuration(282)).toEqual({ value: 5, unit: 'gio' });
    expect(approximateDuration(60)).toEqual({ value: 1, unit: 'gio' });
  });

  it('dưới một giờ tính theo phút, làm tròn tới 5 phút', () => {
    expect(approximateDuration(43)).toEqual({ value: 45, unit: 'phut' });
    expect(approximateDuration(1)).toEqual({ value: 5, unit: 'phut' });
  });
});

describe('bộ lọc catalog', () => {
  it('đọc bộ lọc từ URL; giá trị lạ thì coi như không lọc', () => {
    expect(
      parseCatalogFilter(new URLSearchParams('trang-thai=dang-hoc&cap-do=co-ban&tim=rùa')),
    ).toEqual({ status: 'dang-hoc', level: 'co-ban', query: 'rùa' });
    expect(parseCatalogFilter(new URLSearchParams('trang-thai=bay&cap-do=sieu-kho'))).toEqual({
      status: 'tat-ca',
      level: null,
      query: '',
    });
  });

  it('chỉ ghi lên URL bộ lọc đang bật', () => {
    expect(catalogFilterParams({ status: 'tat-ca', level: null, query: '  ' }).toString()).toBe('');
    expect(
      catalogFilterParams({ status: 'da-xong', level: 'moi-bat-dau', query: '' }).toString(),
    ).toBe('trang-thai=da-xong&cap-do=moi-bat-dau');
  });

  it('bỏ dấu khi tìm: "rua", "RÙA", "khoi dong" đều khớp', () => {
    expect(foldVietnamese('Python Khởi Động')).toBe('python khoi dong');
    expect(foldVietnamese('Rùa vẽ hình')).toContain('rua');
  });

  const items = [
    { course, progress: courseProgress(course, new Map([['py.01-a', 1]])) },
    {
      course: { ...course, id: 'web', title: 'Làm trang web', level: 'co-ban' as const },
      progress: courseProgress(course, new Map()),
    },
  ];

  it('lọc theo trạng thái, cấp độ và tên cùng lúc', () => {
    const ids = (filter: Parameters<typeof filterCourses>[1]) =>
      filterCourses(items, filter).map((item) => item.course.id);
    expect(ids({ status: 'tat-ca', level: null, query: '' })).toEqual(['py', 'web']);
    expect(ids({ status: 'dang-hoc', level: null, query: '' })).toEqual(['py']);
    expect(ids({ status: 'chua-hoc', level: null, query: '' })).toEqual(['web']);
    expect(ids({ status: 'tat-ca', level: 'co-ban', query: '' })).toEqual(['web']);
    expect(ids({ status: 'tat-ca', level: null, query: 'khoi dong' })).toEqual(['py']);
    expect(ids({ status: 'da-xong', level: null, query: '' })).toEqual([]);
  });
});

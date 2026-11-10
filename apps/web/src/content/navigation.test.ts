import { describe, expect, it } from 'vitest';
import { completionOf, exerciseNeighbours, hrefOf, lessonNeighbours } from './navigation';
import type { ContentIndex, CourseSummary, LessonBundle, LessonSummary } from './types';

function summary(id: string, title: string): LessonSummary {
  return {
    id,
    slug: id.split('.')[1] ?? '',
    title,
    concepts: ['print'],
    estimatedMinutes: 10,
    tags: [],
    status: 'draft',
    exerciseCount: 2,
    exercises: [],
    hasVideo: false,
    file: `lessons/${id}.abcd1234.json`,
  };
}

function course(id: string, lessons: LessonSummary[]): CourseSummary {
  return {
    id,
    title: id,
    summary: '',
    ageRange: [10, 15],
    level: 'moi-bat-dau',
    tags: [],
    illustration: `${id}.svg`,
    status: 'draft',
    chapters: [
      { id: 'chuong-1', title: 'Chương 1', lessonIds: lessons.map((lesson) => lesson.id) },
    ],
    lessons,
  };
}

const index: ContentIndex = {
  version: 1,
  courses: [
    course('py', [
      summary('py.01-xin-chao', 'Xin chào'),
      summary('py.02-bien', 'Biến'),
      summary('py.03-rua', 'Rùa'),
    ]),
    course('mot-bai', [summary('mot-bai.01-duy-nhat', 'Bài duy nhất')]),
  ],
};

/** Bundle cố ý xếp bài tập lệch thứ tự: thứ tự đúng là `lesson.exercises`. */
function bundle(
  lessonId: string,
  title: string,
  exercises: [slug: string, title: string][],
): Pick<LessonBundle, 'lesson' | 'exercises'> {
  return {
    lesson: {
      id: lessonId,
      title,
      concepts: ['print'],
      estimatedMinutes: 10,
      tags: [],
      exercises: exercises.map(([slug]) => slug),
      status: 'draft',
    },
    exercises: [...exercises].reverse().map(([slug, exerciseTitle]) => ({
      id: `${lessonId}.${slug}`,
      title: exerciseTitle,
    })) as unknown as LessonBundle['exercises'],
  };
}

const lesson02 = bundle('py.02-bien', 'Biến', [
  ['01-dat-ten', 'Đặt tên'],
  ['02-doi-gia-tri', 'Đổi giá trị'],
  ['03-in-bien', 'In biến'],
]);

describe('lessonNeighbours', () => {
  it('bài học giữa khoá: có cả bài trước lẫn bài tiếp', () => {
    expect(lessonNeighbours(index, 'py.02-bien')).toEqual({
      previous: { kind: 'lesson', id: 'py.01-xin-chao', title: 'Xin chào' },
      next: { kind: 'lesson', id: 'py.03-rua', title: 'Rùa' },
    });
  });

  it('bài học đầu khoá: không có bài trước', () => {
    expect(lessonNeighbours(index, 'py.01-xin-chao')?.previous).toBeNull();
  });

  it('bài học cuối khoá: "tiếp" là về trang khoá, không nhảy sang khoá khác', () => {
    expect(lessonNeighbours(index, 'py.03-rua')?.next).toEqual({ kind: 'course', id: 'py' });
  });

  it('khoá chỉ có một bài: không có bài trước, tiếp là trang khoá', () => {
    expect(lessonNeighbours(index, 'mot-bai.01-duy-nhat')).toEqual({
      previous: null,
      next: { kind: 'course', id: 'mot-bai' },
    });
  });

  it('bài học không có trong index → null', () => {
    expect(lessonNeighbours(index, 'py.99-khong-co')).toBeNull();
  });
});

describe('exerciseNeighbours', () => {
  it('bài tập giữa: trước/tiếp là bài tập cùng bài học, theo thứ tự của lesson.exercises', () => {
    expect(exerciseNeighbours(index, lesson02, 'py.02-bien.02-doi-gia-tri')).toEqual({
      previous: { kind: 'exercise', id: 'py.02-bien.01-dat-ten', title: 'Đặt tên' },
      next: { kind: 'exercise', id: 'py.02-bien.03-in-bien', title: 'In biến' },
    });
  });

  it('bài tập đầu: "trước" là trang bài học của nó', () => {
    expect(exerciseNeighbours(index, lesson02, 'py.02-bien.01-dat-ten')?.previous).toEqual({
      kind: 'lesson',
      id: 'py.02-bien',
      title: 'Biến',
    });
  });

  it('bài tập cuối: "tiếp" là bài học kế tiếp (chỉ cần mã, không cần tải bài tập của nó)', () => {
    expect(exerciseNeighbours(index, lesson02, 'py.02-bien.03-in-bien')?.next).toEqual({
      kind: 'lesson',
      id: 'py.03-rua',
      title: 'Rùa',
    });
  });

  it('bài tập cuối của bài học cuối khoá: "tiếp" là trang khoá', () => {
    const last = bundle('py.03-rua', 'Rùa', [['01-ve-vuong', 'Vẽ hình vuông']]);
    expect(exerciseNeighbours(index, last, 'py.03-rua.01-ve-vuong')).toEqual({
      previous: { kind: 'lesson', id: 'py.03-rua', title: 'Rùa' },
      next: { kind: 'course', id: 'py' },
    });
  });

  it('khoá một bài, bài học một bài tập: về bài học / về trang khoá', () => {
    const only = bundle('mot-bai.01-duy-nhat', 'Bài duy nhất', [['01-a', 'A']]);
    expect(exerciseNeighbours(index, only, 'mot-bai.01-duy-nhat.01-a')).toEqual({
      previous: { kind: 'lesson', id: 'mot-bai.01-duy-nhat', title: 'Bài duy nhất' },
      next: { kind: 'course', id: 'mot-bai' },
    });
  });

  it('bài tập không thuộc bài học → null', () => {
    expect(exerciseNeighbours(index, lesson02, 'py.02-bien.99-khong-co')).toBeNull();
  });
});

describe('hrefOf', () => {
  it('trả đúng đường dẫn tiếng Việt của từng loại', () => {
    expect(hrefOf({ kind: 'exercise', id: 'a.b.c', title: '' })).toBe('/bai-tap/a.b.c');
    expect(hrefOf({ kind: 'lesson', id: 'a.b', title: '' })).toBe('/bai-hoc/a.b');
    expect(hrefOf({ kind: 'course', id: 'py' })).toBe('/khoa-hoc/py');
  });
});

describe('completionOf', () => {
  const small: ContentIndex = {
    version: 1,
    courses: [
      course('k', [
        { ...summary('k.01-a', 'A'), exerciseCount: 2 },
        { ...summary('k.02-b', 'B'), exerciseCount: 1 },
      ]),
    ],
  };
  const lessonA = bundle('k.01-a', 'A', [
    ['01-x', 'X'],
    ['02-y', 'Y'],
  ]);
  const lessonB = bundle('k.02-b', 'B', [['01-z', 'Z']]);

  it('còn bài tập chưa xong trong bài học → chưa xong bài, chưa xong khoá', () => {
    expect(completionOf(small, lessonA, new Set(['k.01-a.02-y']))).toEqual({
      lessonDone: false,
      courseDone: false,
    });
  });

  it('xong bài học nhưng bài khác trong khoá còn dở → chỉ xong bài', () => {
    expect(completionOf(small, lessonB, new Set(['k.02-b.01-z', 'k.01-a.01-x']))).toEqual({
      lessonDone: true,
      courseDone: false,
    });
  });

  it('xong mọi bài tập của khoá → xong khoá', () => {
    expect(
      completionOf(small, lessonB, new Set(['k.01-a.01-x', 'k.01-a.02-y', 'k.02-b.01-z'])),
    ).toEqual({ lessonDone: true, courseDone: true });
  });
});

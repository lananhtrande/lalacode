import { afterEach, beforeEach, describe, expect, it, vi as vitest } from 'vitest';
import {
  ContentError,
  findLessonSummary,
  loadContentIndex,
  loadLesson,
  resetContentCache,
} from './loader';

const index = {
  version: 1,
  courses: [
    {
      id: 'py-khoi-dong',
      title: 'Python khởi động',
      summary: 'Làm quen với Python.',
      ageRange: [10, 15],
      status: 'draft',
      lessons: [
        {
          id: 'py-khoi-dong.01-xin-chao',
          slug: '01-xin-chao',
          title: 'Xin chào, Python!',
          concepts: ['print'],
          estimatedMinutes: 10,
          status: 'draft',
          exerciseCount: 2,
          hasVideo: false,
          file: 'lessons/py-khoi-dong.01-xin-chao.abcd1234.json',
        },
      ],
    },
  ],
};

const lessonBundle = {
  version: 1,
  lesson: { id: 'py-khoi-dong.01-xin-chao' },
  markdown: '# Xin chào',
  exercises: [],
};

function mockFetch(handler: (url: string) => Response | Promise<Response>) {
  const spy = vitest.fn((input: string | URL) => Promise.resolve(handler(input.toString())));
  vitest.stubGlobal('fetch', spy);
  return spy;
}

const json = (body: unknown) => new Response(JSON.stringify(body), { status: 200 });

beforeEach(() => resetContentCache());
afterEach(() => vitest.unstubAllGlobals());

describe('content loader', () => {
  it('tải index và chỉ gọi mạng một lần dù gọi nhiều lần', async () => {
    const spy = mockFetch(() => json(index));
    const first = await loadContentIndex();
    const second = await loadContentIndex();
    expect(first.courses[0]?.title).toBe('Python khởi động');
    expect(second).toBe(first);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('/content/index.json');
  });

  it('tải bài học theo đường dẫn có hash lấy từ index', async () => {
    const spy = mockFetch((url) => (url.endsWith('index.json') ? json(index) : json(lessonBundle)));
    const bundle = await loadLesson('py-khoi-dong.01-xin-chao');
    expect(bundle.markdown).toBe('# Xin chào');
    expect(spy).toHaveBeenCalledWith('/content/lessons/py-khoi-dong.01-xin-chao.abcd1234.json');
  });

  it('không tải lại bài học đã có trong bộ nhớ', async () => {
    const spy = mockFetch((url) => (url.endsWith('index.json') ? json(index) : json(lessonBundle)));
    await loadLesson('py-khoi-dong.01-xin-chao');
    await loadLesson('py-khoi-dong.01-xin-chao');
    expect(spy).toHaveBeenCalledTimes(2); // 1 index + 1 bài học
  });

  it('báo lỗi rõ ràng khi không có bài học trong index', async () => {
    mockFetch(() => json(index));
    await expect(loadLesson('khong-co')).rejects.toSatisfy(
      (error: unknown) => error instanceof ContentError && error.code === 'lesson-not-found',
    );
  });

  it('báo lỗi khi server trả về lỗi', async () => {
    mockFetch(() => new Response('', { status: 404 }));
    await expect(loadContentIndex()).rejects.toSatisfy(
      (error: unknown) => error instanceof ContentError && error.code === 'index-not-found',
    );
  });

  it('báo lỗi mạng khi fetch ném lỗi', async () => {
    vitest.stubGlobal(
      'fetch',
      vitest.fn(() => Promise.reject(new Error('mất mạng'))),
    );
    await expect(loadContentIndex()).rejects.toSatisfy(
      (error: unknown) => error instanceof ContentError && error.code === 'network',
    );
  });

  it('tìm được tóm tắt bài học, trả về undefined khi không có', async () => {
    mockFetch(() => json(index));
    expect((await findLessonSummary('py-khoi-dong.01-xin-chao'))?.slug).toBe('01-xin-chao');
    expect(await findLessonSummary('khong-co')).toBeUndefined();
  });
});

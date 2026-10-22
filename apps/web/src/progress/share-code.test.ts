import { describe, expect, it } from 'vitest';
import {
  decodeProgressCode,
  encodeProgressCode,
  mergeProgress,
  ProgressCodeError,
  toSharedProgress,
} from './share-code';
import type { ExerciseProgress, ProgressSnapshot } from './schema';

const exercise = (id: string, overrides: Partial<ExerciseProgress> = {}): ExerciseProgress => ({
  exerciseId: id,
  lessonId: 'py-khoi-dong.01-xin-chao',
  status: 'xong',
  attempts: 2,
  draftCode: 'print("Em tên là Lan Anh")',
  updatedAt: '2026-03-05T10:00:00.000Z',
  passedAt: '2026-03-05T10:00:00.000Z',
  ...overrides,
});

const snapshot = (overrides: Partial<ProgressSnapshot> = {}): ProgressSnapshot => ({
  schemaVersion: 1,
  profile: {
    id: 'me',
    createdAt: '2026-03-01T00:00:00.000Z',
    streakDays: 2,
    lastActiveDay: '2026-03-05',
    badges: ['bai-dau-tien'],
  },
  lessons: [
    {
      lessonId: 'py-khoi-dong.01-xin-chao',
      courseId: 'py-khoi-dong',
      startedAt: '2026-03-05T09:00:00.000Z',
    },
  ],
  exercises: [exercise('py-khoi-dong.01-xin-chao.01-in-loi-chao')],
  ...overrides,
});

describe('mã tiến độ', () => {
  it('đi một vòng xuất rồi nhập vẫn đúng dữ liệu', async () => {
    const code = await encodeProgressCode(snapshot());
    const decoded = await decodeProgressCode(code);
    expect(decoded.profile.badges).toEqual(['bai-dau-tien']);
    expect(decoded.exercises[0]?.status).toBe('xong');
    expect(decoded.lessons[0]?.lessonId).toBe('py-khoi-dong.01-xin-chao');
  });

  it('KHÔNG mang code nháp của trẻ theo mã', async () => {
    const code = await encodeProgressCode(snapshot());
    const decoded = await decodeProgressCode(code);
    expect(decoded.exercises[0]).not.toHaveProperty('draftCode');
    // Và chuỗi mã cũng không chứa nội dung đó ở dạng đọc được.
    expect(code).not.toContain('Lan Anh');
    expect(JSON.stringify(decoded)).not.toContain('Lan Anh');
  });

  it('toSharedProgress bỏ draftCode nhưng giữ phần còn lại', () => {
    const shared = toSharedProgress(snapshot());
    expect(shared.exercises[0]).not.toHaveProperty('draftCode');
    expect(shared.exercises[0]?.attempts).toBe(2);
  });

  it('mã có nén nên ngắn hơn JSON thô', async () => {
    const big = snapshot({
      exercises: Array.from({ length: 40 }, (_, index) => exercise(`bai-${index}`)),
    });
    const code = await encodeProgressCode(big);
    expect(code.length).toBeLessThan(JSON.stringify(toSharedProgress(big)).length);
  });

  it('mã sai, mã rỗng hay mã bị cắt đều báo lỗi rõ ràng, không ném lỗi lạ', async () => {
    for (const bad of ['', 'xin chào', 'LLC1.', 'LLC9.abc', 'LLC1.@@@@']) {
      await expect(decodeProgressCode(bad)).rejects.toBeInstanceOf(ProgressCodeError);
    }
  });

  it('bỏ qua khoảng trắng và xuống dòng khi dán mã', async () => {
    const code = await encodeProgressCode(snapshot());
    const messy = `  ${code.slice(0, 20)}\n${code.slice(20)}  `;
    await expect(decodeProgressCode(messy)).resolves.toBeDefined();
  });

  it('mã của phiên bản mới hơn thì báo đúng loại lỗi', async () => {
    const future = await encodeProgressCode(snapshot({ schemaVersion: 99 }));
    await expect(decodeProgressCode(future)).rejects.toMatchObject({
      code: 'phien-ban-moi-hon',
    });
  });
});

describe('mã bị sửa tay hoặc cố tình phá', () => {
  const encodePlain = (data: unknown) => {
    const bytes = new TextEncoder().encode(JSON.stringify(data));
    let binary = '';
    for (const byte of bytes) binary += String.fromCharCode(byte);
    return `LLC0.${btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '')}`;
  };

  it('từ chối bài tập thiếu trường hoặc sai kiểu, thay vì nhét rác vào máy', async () => {
    const base = toSharedProgress(snapshot());
    const broken = [
      { ...base, exercises: [{ ...base.exercises[0], attempts: 'nhiều' }] },
      { ...base, exercises: [{ ...base.exercises[0], exerciseId: undefined }] },
      { ...base, exercises: [{ ...base.exercises[0], status: 'linh tinh' }] },
      { ...base, profile: { ...base.profile, streakDays: 'ba' } },
      { ...base, profile: { ...base.profile, badges: [1, 2] } },
      { ...base, lessons: [{ lessonId: 'thieu-truong' }] },
    ];
    for (const data of broken) {
      await expect(decodeProgressCode(encodePlain(data))).rejects.toBeInstanceOf(ProgressCodeError);
    }
  });

  it('từ chối mã dài bất thường thay vì ngồi giải nén', async () => {
    await expect(decodeProgressCode(`LLC1.${'a'.repeat(200_000)}`)).rejects.toMatchObject({
      code: 'khong-doc-duoc',
    });
  });

  it('mã nén phình ra quá lớn thì cũng từ chối', async () => {
    // Chuỗi lặp nén rất tốt: nén lại thì ngắn, bung ra thì khổng lồ.
    const huge = {
      schemaVersion: 1,
      profile: {},
      lessons: [],
      exercises: [],
      rac: 'x'.repeat(3_000_000),
    };
    const code = await encodeProgressCode(huge as never);
    expect(code.length).toBeLessThan(100_000);
    await expect(decodeProgressCode(code)).rejects.toBeInstanceOf(ProgressCodeError);
  });
});

describe('gộp tiến độ khi nhập mã', () => {
  it('giữ bài đã xong ở cả hai máy, không mất bài nào', () => {
    const local = snapshot({ exercises: [exercise('bai-1')] });
    const incoming = toSharedProgress(snapshot({ exercises: [exercise('bai-2')] }));
    const merged = mergeProgress(local, incoming);
    expect(merged.exercises.map((item) => item.exerciseId).sort()).toEqual(['bai-1', 'bai-2']);
  });

  it('cùng một bài: đã xong ở một bên thì kết quả là xong', () => {
    const local = snapshot({ exercises: [exercise('bai-1', { status: 'dang-lam', attempts: 1 })] });
    const incoming = toSharedProgress(
      snapshot({ exercises: [exercise('bai-1', { status: 'xong', attempts: 4 })] }),
    );
    const merged = mergeProgress(local, incoming);
    expect(merged.exercises[0]?.status).toBe('xong');
    expect(merged.exercises[0]?.attempts).toBe(4);
  });

  it('giữ code nháp của máy hiện tại, không bị mã ghi đè', () => {
    const local = snapshot({ exercises: [exercise('bai-1', { draftCode: 'em đang viết dở' })] });
    const incoming = toSharedProgress(snapshot({ exercises: [exercise('bai-1')] }));
    expect(mergeProgress(local, incoming).exercises[0]?.draftCode).toBe('em đang viết dở');
  });

  it('bài tập mới từ mã thì chưa có nháp', () => {
    const local = snapshot({ exercises: [] });
    const incoming = toSharedProgress(snapshot({ exercises: [exercise('bai-2')] }));
    expect(mergeProgress(local, incoming).exercises[0]?.draftCode).toBe('');
  });

  it('gộp huy hiệu của cả hai máy, không trùng lặp', () => {
    const local = snapshot();
    const incoming = toSharedProgress(
      snapshot({
        profile: { ...snapshot().profile, badges: ['bai-dau-tien', 'ba-ngay-lien'] },
      }),
    );
    expect(mergeProgress(local, incoming).profile.badges.sort()).toEqual([
      'ba-ngay-lien',
      'bai-dau-tien',
    ]);
  });

  it('lấy streak dài hơn và ngày học gần nhất muộn hơn', () => {
    const local = snapshot();
    const incoming = toSharedProgress(
      snapshot({
        profile: { ...snapshot().profile, streakDays: 9, lastActiveDay: '2026-03-09' },
      }),
    );
    const merged = mergeProgress(local, incoming);
    expect(merged.profile.streakDays).toBe(9);
    expect(merged.profile.lastActiveDay).toBe('2026-03-09');
  });

  it('bài học đã xong ở máy cũ thì sang máy mới vẫn là xong', () => {
    const local = snapshot();
    const incoming = toSharedProgress(
      snapshot({
        lessons: [
          {
            lessonId: 'py-khoi-dong.01-xin-chao',
            courseId: 'py-khoi-dong',
            startedAt: '2026-03-02T09:00:00.000Z',
            completedAt: '2026-03-03T09:00:00.000Z',
          },
        ],
      }),
    );
    const merged = mergeProgress(local, incoming);
    expect(merged.lessons[0]?.completedAt).toBe('2026-03-03T09:00:00.000Z');
    // Giữ mốc bắt đầu sớm nhất của hai máy.
    expect(merged.lessons[0]?.startedAt).toBe('2026-03-02T09:00:00.000Z');
  });
});

describe('trình duyệt cũ không có CompressionStream', () => {
  it('vẫn xuất/nhập được bằng mã không nén', async () => {
    const original = globalThis.CompressionStream;
    // @ts-expect-error cố tình bỏ để giả lập trình duyệt cũ
    delete globalThis.CompressionStream;
    try {
      const code = await encodeProgressCode(snapshot());
      expect(code.startsWith('LLC0.')).toBe(true);
      const decoded = await decodeProgressCode(code);
      expect(decoded.exercises[0]?.status).toBe('xong');
      expect(decoded.exercises[0]).not.toHaveProperty('draftCode');
    } finally {
      globalThis.CompressionStream = original;
    }
  });
});

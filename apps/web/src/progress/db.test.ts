import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';
import {
  clearAllProgress,
  exportSnapshot,
  getExerciseProgress,
  getProfile,
  markLessonCompleted,
  markLessonStarted,
  recordAttempt,
  resetProgressDbForTest,
  saveDraft,
  touchActivity,
} from './db';
import { PROGRESS_SCHEMA_VERSION } from './schema';

const EXERCISE = 'py-khoi-dong.01-xin-chao.01-in-loi-chao';
const LESSON = 'py-khoi-dong.01-xin-chao';

beforeEach(() => {
  // Mỗi test một IndexedDB sạch.
  globalThis.indexedDB = new IDBFactory();
  resetProgressDbForTest();
});

afterEach(() => resetProgressDbForTest());

describe('tiến độ trên máy', () => {
  it('mở lần đầu thì tạo sẵn hồ sơ rỗng, không có tên thật', async () => {
    const profile = await getProfile();
    expect(profile.id).toBe('me');
    expect(profile.streakDays).toBe(0);
    expect(profile.badges).toEqual([]);
    expect(profile.nickname).toBeUndefined();
  });

  it('lưu code nháp rồi đọc lại được đúng như cũ', async () => {
    await saveDraft(EXERCISE, LESSON, 'print("đang làm dở")');
    expect((await getExerciseProgress(EXERCISE))?.draftCode).toBe('print("đang làm dở")');
  });

  it('lưu nháp không tính là một lần nộp bài', async () => {
    await saveDraft(EXERCISE, LESSON, 'a');
    await saveDraft(EXERCISE, LESSON, 'ab');
    expect((await getExerciseProgress(EXERCISE))?.attempts).toBe(0);
  });

  it('đếm số lần nộp và đánh dấu xong khi đạt', async () => {
    await recordAttempt(EXERCISE, LESSON, false, 'sai');
    await recordAttempt(EXERCISE, LESSON, true, 'đúng');
    const progress = await getExerciseProgress(EXERCISE);
    expect(progress?.attempts).toBe(2);
    expect(progress?.status).toBe('xong');
    expect(progress?.passedAt).toBeDefined();
  });

  it('bài đã xong rồi thì nộp sai sau đó không bị gỡ mất dấu xong', async () => {
    await recordAttempt(EXERCISE, LESSON, true, 'đúng');
    const passedAt = (await getExerciseProgress(EXERCISE))?.passedAt;
    await recordAttempt(EXERCISE, LESSON, false, 'nghịch thử');
    const progress = await getExerciseProgress(EXERCISE);
    expect(progress?.status).toBe('xong');
    expect(progress?.passedAt).toBe(passedAt);
  });

  it('nộp bài thì streak tự cập nhật', async () => {
    await recordAttempt(EXERCISE, LESSON, true, 'x', new Date(2026, 2, 5, 20, 0));
    expect((await getProfile()).streakDays).toBe(1);
    await recordAttempt(EXERCISE, LESSON, true, 'x', new Date(2026, 2, 6, 7, 0));
    expect((await getProfile()).streakDays).toBe(2);
  });

  it('ghi nhận bài học bắt đầu và hoàn thành, không ghi đè lần bắt đầu', async () => {
    // Mốc thời gian lưu dạng ISO UTC (để sau này đồng bộ được), còn việc tính
    // "ngày" cho streak mới dùng lịch máy — nên test so bằng ISO, không so chuỗi ngày.
    const first = new Date(2026, 2, 5, 9, 0);
    const later = new Date(2026, 2, 9, 9, 0);
    await markLessonStarted(LESSON, 'py-khoi-dong', first);
    await markLessonStarted(LESSON, 'py-khoi-dong', later);
    await markLessonCompleted(LESSON, 'py-khoi-dong', later);
    const snapshot = await exportSnapshot();
    expect(snapshot.lessons).toHaveLength(1);
    expect(snapshot.lessons[0]?.startedAt).toBe(first.toISOString());
    expect(snapshot.lessons[0]?.completedAt).toBe(later.toISOString());
  });

  it('xuất được toàn bộ tiến độ kèm số phiên bản schema', async () => {
    await recordAttempt(EXERCISE, LESSON, true, 'đúng');
    await markLessonStarted(LESSON, 'py-khoi-dong');
    const snapshot = await exportSnapshot();
    expect(snapshot.schemaVersion).toBe(PROGRESS_SCHEMA_VERSION);
    expect(snapshot.exercises).toHaveLength(1);
    expect(snapshot.lessons).toHaveLength(1);
  });

  it('xoá toàn bộ dữ liệu thì không còn gì sót lại', async () => {
    await recordAttempt(EXERCISE, LESSON, true, 'đúng');
    await markLessonStarted(LESSON, 'py-khoi-dong');
    await touchActivity();

    await clearAllProgress();

    const snapshot = await exportSnapshot();
    expect(snapshot.exercises).toEqual([]);
    expect(snapshot.lessons).toEqual([]);
    expect(snapshot.profile.streakDays).toBe(0);
  });

  it('dữ liệu còn nguyên sau khi đóng rồi mở lại (giả lập tắt trình duyệt)', async () => {
    await saveDraft(EXERCISE, LESSON, 'print("để dành")');
    resetProgressDbForTest();
    expect((await getExerciseProgress(EXERCISE))?.draftCode).toBe('print("để dành")');
  });
});

describe('khi trình duyệt không cho lưu', () => {
  it('quietly() nuốt lỗi để buổi học không bị gián đoạn', async () => {
    const { quietly } = await import('./db');
    await expect(
      quietly(() => Promise.reject(new Error('IndexedDB bị chặn'))),
    ).resolves.toBeUndefined();
    await expect(quietly(() => Promise.resolve('ok'))).resolves.toBe('ok');
  });
});

import { deleteDB, openDB, type DBSchema, type IDBPDatabase } from 'idb';
import {
  DB_NAME,
  PROFILE_KEY,
  PROGRESS_SCHEMA_VERSION,
  type ExerciseProgress,
  type LessonProgress,
  type ProfileState,
  type ProgressSnapshot,
} from './schema';
import { runUpgrades } from './migrate';
import { advanceStreak, dayKey } from './streak';

/**
 * Tiến độ học nằm **hoàn toàn trên máy trẻ** (docs/privacy.md). Không có hàm
 * nào ở đây gọi mạng; muốn mang sang máy khác thì dùng mã tiến độ (S0-14).
 */

export interface ProgressDb extends DBSchema {
  exercises: {
    key: string;
    value: ExerciseProgress;
    indexes: { 'by-lesson': string };
  };
  lessons: { key: string; value: LessonProgress };
  profile: { key: string; value: ProfileState };
}

let dbPromise: Promise<IDBPDatabase<ProgressDb>> | null = null;

/**
 * Lưu tiến độ **không bao giờ được làm hỏng buổi học**: Safari ở chế độ riêng
 * tư, hết dung lượng, hoặc người dùng chặn lưu trữ đều khiến IndexedDB ném lỗi.
 * Gặp vậy thì bỏ qua lặng lẽ — trẻ vẫn học và chạy code bình thường.
 */
export async function quietly<T>(work: () => Promise<T>): Promise<T | undefined> {
  try {
    return await work();
  } catch {
    return undefined;
  }
}

export function openProgressDb(): Promise<IDBPDatabase<ProgressDb>> {
  dbPromise ??= openDB<ProgressDb>(DB_NAME, PROGRESS_SCHEMA_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      runUpgrades(db, transaction, oldVersion, newVersion ?? PROGRESS_SCHEMA_VERSION);
    },
  }).catch((error: unknown) => {
    // Đừng nhớ một promise đã hỏng: hỏng một lần mà nhớ mãi thì lần sau không
    // bao giờ mở lại được, dù nguyên nhân (hết dung lượng…) đã qua.
    dbPromise = null;
    throw error;
  });
  return dbPromise;
}

/** Chỉ dùng trong test: quên kết nối đang mở. */
export function resetProgressDbForTest(): void {
  dbPromise = null;
}

export async function getProfile(): Promise<ProfileState> {
  const db = await openProgressDb();
  const profile = await db.get('profile', PROFILE_KEY);
  return (
    profile ?? { id: PROFILE_KEY, createdAt: new Date().toISOString(), streakDays: 0, badges: [] }
  );
}

/** Ghi nhận "hôm nay có học" và cập nhật streak. */
export async function touchActivity(now: Date = new Date()): Promise<ProfileState> {
  const db = await openProgressDb();
  const profile = await getProfile();
  const next: ProfileState = {
    ...profile,
    ...advanceStreak(
      profile.lastActiveDay === undefined
        ? { streakDays: profile.streakDays }
        : { streakDays: profile.streakDays, lastActiveDay: profile.lastActiveDay },
      dayKey(now),
    ),
  };
  await db.put('profile', next);
  return next;
}

export async function getExerciseProgress(
  exerciseId: string,
): Promise<ExerciseProgress | undefined> {
  const db = await openProgressDb();
  return db.get('exercises', exerciseId);
}

export async function listExerciseProgress(): Promise<ExerciseProgress[]> {
  const db = await openProgressDb();
  return db.getAll('exercises');
}

export async function listLessonProgress(): Promise<LessonProgress[]> {
  const db = await openProgressDb();
  return db.getAll('lessons');
}

/** Lưu code nháp. Gọi thường xuyên nên cố ý nhẹ: không đụng streak, không đếm lần thử. */
export async function saveDraft(
  exerciseId: string,
  lessonId: string,
  draftCode: string,
  now: Date = new Date(),
): Promise<void> {
  const db = await openProgressDb();
  const current = await db.get('exercises', exerciseId);
  await db.put('exercises', {
    lessonId,
    status: 'dang-lam',
    attempts: 0,
    ...current,
    exerciseId,
    draftCode,
    updatedAt: now.toISOString(),
  });
}

/**
 * Ghi nhận một lần nộp bài; `passed` thì đánh dấu xong (và không bao giờ bỏ dấu đó).
 *
 * `lessonExerciseIds` là mọi bài tập của bài học. Nếu lần nộp này làm trọn bài
 * học thì `completedAt` được ghi **trong cùng transaction** với bài tập: trẻ
 * đóng trang giữa chừng thì hoặc cả hai đã lưu, hoặc chưa có gì — không bao giờ
 * có bài học đủ bài tập mà thiếu dấu xong (S0-30).
 */
export async function recordAttempt(
  exerciseId: string,
  lessonId: string,
  passed: boolean,
  draftCode: string,
  lessonExerciseIds: readonly string[] = [],
  now: Date = new Date(),
): Promise<ExerciseProgress> {
  const db = await openProgressDb();
  const transaction = db.transaction(['exercises', 'lessons'], 'readwrite');
  const exercises = transaction.objectStore('exercises');
  const current = await exercises.get(exerciseId);
  const alreadyPassed = current?.status === 'xong';
  const next: ExerciseProgress = {
    exerciseId,
    lessonId,
    attempts: (current?.attempts ?? 0) + 1,
    status: passed || alreadyPassed ? 'xong' : 'dang-lam',
    draftCode,
    updatedAt: now.toISOString(),
    ...(current?.passedAt !== undefined
      ? { passedAt: current.passedAt }
      : passed
        ? { passedAt: now.toISOString() }
        : {}),
  };
  await exercises.put(next);

  if (next.status === 'xong' && lessonExerciseIds.length > 0) {
    const done = new Set(
      (await exercises.index('by-lesson').getAll(lessonId))
        .filter((item) => item.status === 'xong')
        .map((item) => item.exerciseId),
    );
    const lessons = transaction.objectStore('lessons');
    const lesson = await lessons.get(lessonId);
    if (lesson?.completedAt === undefined && lessonExerciseIds.every((id) => done.has(id))) {
      await lessons.put({
        lessonId,
        courseId: lessonId.split('.')[0] ?? '',
        startedAt: lesson?.startedAt ?? now.toISOString(),
        completedAt: now.toISOString(),
      });
    }
  }
  await transaction.done;

  await touchActivity(now);
  return next;
}

export async function markLessonStarted(
  lessonId: string,
  courseId: string,
  now: Date = new Date(),
): Promise<void> {
  const db = await openProgressDb();
  const current = await db.get('lessons', lessonId);
  if (current) return;
  await db.put('lessons', { lessonId, courseId, startedAt: now.toISOString() });
}

/**
 * Cập nhật danh sách huy hiệu đã nhận. Chỉ thêm, không bao giờ lấy lại
 * (xem `badges.ts`), nên hàm này gộp chứ không ghi đè.
 */
export async function awardBadges(earned: readonly string[]): Promise<ProfileState> {
  const db = await openProgressDb();
  const profile = await getProfile();
  const merged = [...new Set([...profile.badges, ...earned])];
  if (merged.length === profile.badges.length) return profile;
  const next: ProfileState = { ...profile, badges: merged };
  await db.put('profile', next);
  return next;
}

/**
 * Token ẩn danh cho gợi ý AI, tạo khi cần và giữ trên máy.
 * Không lưu được (chế độ riêng tư…) thì vẫn trả về một token dùng tạm cho
 * phiên này — trẻ vẫn xin được gợi ý, chỉ là lượt không đếm xuyên phiên.
 */
export async function getAiToken(): Promise<string> {
  const profile = await getProfile();
  if (profile.aiToken !== undefined) return profile.aiToken;

  const aiToken = crypto.randomUUID();
  const saved = await quietly(async () => {
    const db = await openProgressDb();
    await db.put('profile', { ...profile, aiToken });
    return true;
  });
  return saved === undefined ? aiToken : aiToken;
}

/** Toàn bộ tiến độ, dùng cho mã tiến độ và trang báo cáo (S0-14, S0-15). */
export async function exportSnapshot(): Promise<ProgressSnapshot> {
  const [profile, lessons, exercises] = await Promise.all([
    getProfile(),
    listLessonProgress(),
    listExerciseProgress(),
  ]);
  return { schemaVersion: PROGRESS_SCHEMA_VERSION, profile, lessons, exercises };
}

/** Ghi đè toàn bộ tiến độ bằng ảnh chụp đã gộp (dùng khi nhập mã tiến độ). */
export async function importSnapshot(snapshot: ProgressSnapshot): Promise<void> {
  const db = await openProgressDb();
  const transaction = db.transaction(['exercises', 'lessons', 'profile'], 'readwrite');
  const exercises = transaction.objectStore('exercises');
  const lessons = transaction.objectStore('lessons');
  await Promise.all([
    ...snapshot.exercises.map((exercise) => exercises.put(exercise)),
    ...snapshot.lessons.map((lesson) => lessons.put(lesson)),
    transaction.objectStore('profile').put({ ...snapshot.profile, id: PROFILE_KEY }),
  ]);
  await transaction.done;
}

/**
 * Nút "Xoá toàn bộ dữ liệu trên máy này" (S0-16).
 *
 * Làm hai bước để lời hứa với bố mẹ luôn đúng:
 * 1. Dọn sạch từng store — việc này chắc chắn chạy được.
 * 2. Xoá hẳn database. Bước này có thể bị chặn nếu trẻ đang mở lalacode ở tab
 *    khác, nên nó chỉ là dọn nốt cái vỏ rỗng; dữ liệu đã mất từ bước 1.
 */
export async function deleteAllData(): Promise<void> {
  await clearAllProgress();
  const db = await openProgressDb().catch(() => null);
  db?.close();
  dbPromise = null;
  try {
    await deleteDB(DB_NAME, {
      blocked() {
        /* tab khác đang mở: thôi, vỏ rỗng để lại cũng không sao */
      },
    });
  } catch {
    /* dữ liệu đã bị dọn ở bước 1 rồi */
  }
}

/** Dọn sạch từng store. Giữ lại database rỗng. */
export async function clearAllProgress(): Promise<void> {
  const db = await openProgressDb();
  const transaction = db.transaction(['exercises', 'lessons', 'profile'], 'readwrite');
  await Promise.all([
    transaction.objectStore('exercises').clear(),
    transaction.objectStore('lessons').clear(),
    transaction.objectStore('profile').clear(),
  ]);
  await transaction.done;
}

import {
  PROGRESS_SCHEMA_VERSION,
  type ExerciseProgress,
  type LessonProgress,
  type ProfileState,
  type ProgressSnapshot,
} from './schema';

/**
 * "Mã tiến độ": đem tiến độ sang máy khác mà **không cần tài khoản và không
 * gửi gì lên server** (docs/architecture.md §3). Trẻ tự sao chép chuỗi này.
 *
 * Mã **không chứa `draftCode`**: code trẻ tự gõ có thể vô tình có tên thật, mà
 * mã thì trẻ hay dán vào chỗ công khai (nhóm chat, ghi chú). Chuyển máy chỉ cần
 * biết bài nào xong, không cần bài làm dở.
 */

/**
 * Mã nén; `LLC0` là bản dự phòng không nén khi trình duyệt thiếu CompressionStream.
 * `LLC` có từ hồi còn tên lalacode; giữ nguyên để mã đã phát ra vẫn nhập được.
 */
const PREFIX_DEFLATE = 'LLC1';
const PREFIX_PLAIN = 'LLC0';

/**
 * Chặn mã quá khổ. Trẻ có thể dán một mã "đùa" lấy từ đâu đó: dữ liệu nén cao
 * có thể bung ra rất lớn và treo máy. Tiến độ thật của một trẻ chỉ vài kB.
 */
const MAX_CODE_LENGTH = 100_000;
const MAX_JSON_LENGTH = 2_000_000;

/** Tiến độ dùng để chia sẻ: giống snapshot nhưng bài tập đã bỏ code nháp. */
export type SharedExercise = Omit<ExerciseProgress, 'draftCode'>;

export interface SharedProgress {
  schemaVersion: number;
  profile: ProfileState;
  lessons: LessonProgress[];
  exercises: SharedExercise[];
}

export class ProgressCodeError extends Error {
  constructor(
    message: string,
    readonly code: 'khong-doc-duoc' | 'phien-ban-moi-hon',
  ) {
    super(message);
    this.name = 'ProgressCodeError';
  }
}

function toBase64Url(bytes: Uint8Array<ArrayBuffer>): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
}

function fromBase64Url(text: string): Uint8Array<ArrayBuffer> {
  const base64 = text.replaceAll('-', '+').replaceAll('_', '/');
  const binary = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='));
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

const hasCompression = () => typeof globalThis.CompressionStream === 'function';

/** Dựng stream từ chính mảng byte: không qua Blob (jsdom thiếu `Blob.stream`). */
function streamOf(bytes: Uint8Array<ArrayBuffer>): ReadableStream<Uint8Array<ArrayBuffer>> {
  return new ReadableStream<Uint8Array<ArrayBuffer>>({
    start(controller) {
      controller.enqueue(bytes);
      controller.close();
    },
  });
}

async function deflate(text: string): Promise<Uint8Array<ArrayBuffer>> {
  const compressed = streamOf(new TextEncoder().encode(text)).pipeThrough(
    new CompressionStream('deflate-raw'),
  );
  return new Uint8Array(await new Response(compressed).arrayBuffer());
}

async function inflate(bytes: Uint8Array<ArrayBuffer>): Promise<string> {
  const plain = streamOf(bytes).pipeThrough(new DecompressionStream('deflate-raw'));
  const text = await new Response(plain).text();
  if (text.length > MAX_JSON_LENGTH) throw new Error('Dữ liệu sau khi giải nén quá lớn');
  return text;
}

/** Bỏ `draftCode` khỏi mọi bài tập trước khi đóng gói. */
export function toSharedProgress(snapshot: ProgressSnapshot): SharedProgress {
  // Token AI là của riêng máy này: mang sang máy khác thì hai máy dùng chung
  // một hạn mức, mà mã lại hay bị dán ở chỗ công khai.
  const { aiToken: _aiToken, ...profile } = snapshot.profile;
  return {
    schemaVersion: snapshot.schemaVersion,
    profile,
    lessons: snapshot.lessons,
    exercises: snapshot.exercises.map(({ draftCode: _draftCode, ...rest }) => rest),
  };
}

export async function encodeProgressCode(snapshot: ProgressSnapshot): Promise<string> {
  const json = JSON.stringify(toSharedProgress(snapshot));
  if (!hasCompression()) return `${PREFIX_PLAIN}.${toBase64Url(new TextEncoder().encode(json))}`;
  return `${PREFIX_DEFLATE}.${toBase64Url(await deflate(json))}`;
}

const isString = (value: unknown): value is string => typeof value === 'string' && value !== '';
const isCount = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0;

function isSharedExercise(value: unknown): value is SharedExercise {
  if (typeof value !== 'object' || value === null) return false;
  const item = value as Record<string, unknown>;
  return (
    isString(item['exerciseId']) &&
    isString(item['lessonId']) &&
    (item['status'] === 'xong' || item['status'] === 'dang-lam') &&
    isCount(item['attempts']) &&
    isString(item['updatedAt']) &&
    (item['passedAt'] === undefined || isString(item['passedAt']))
  );
}

function isLessonProgress(value: unknown): value is LessonProgress {
  if (typeof value !== 'object' || value === null) return false;
  const item = value as Record<string, unknown>;
  return (
    isString(item['lessonId']) &&
    isString(item['courseId']) &&
    isString(item['startedAt']) &&
    (item['completedAt'] === undefined || isString(item['completedAt']))
  );
}

function isProfile(value: unknown): value is ProfileState {
  if (typeof value !== 'object' || value === null) return false;
  const item = value as Record<string, unknown>;
  return (
    isString(item['createdAt']) &&
    isCount(item['streakDays']) &&
    Array.isArray(item['badges']) &&
    item['badges'].every((badge) => typeof badge === 'string') &&
    (item['lastActiveDay'] === undefined || isString(item['lastActiveDay'])) &&
    (item['nickname'] === undefined || typeof item['nickname'] === 'string')
  );
}

/**
 * Kiểm **từng phần tử**, không chỉ hình dạng tầng trên: một mã bị sửa tay
 * (`attempts` thành chuỗi, thiếu `exerciseId`…) mà lọt vào IndexedDB sẽ làm
 * hỏng bản đồ và huy hiệu cho tới khi trẻ xoá sạch dữ liệu.
 */
function isSharedProgress(value: unknown): value is SharedProgress {
  if (typeof value !== 'object' || value === null) return false;
  const data = value as Record<string, unknown>;
  return (
    typeof data['schemaVersion'] === 'number' &&
    isProfile(data['profile']) &&
    Array.isArray(data['lessons']) &&
    data['lessons'].every(isLessonProgress) &&
    Array.isArray(data['exercises']) &&
    data['exercises'].every(isSharedExercise)
  );
}

export async function decodeProgressCode(code: string): Promise<SharedProgress> {
  if (code.length > MAX_CODE_LENGTH) {
    throw new ProgressCodeError('Mã dài bất thường', 'khong-doc-duoc');
  }
  const trimmed = code.trim().replace(/\s+/g, '');
  const separator = trimmed.indexOf('.');
  const prefix = separator === -1 ? '' : trimmed.slice(0, separator);
  const payload = trimmed.slice(separator + 1);

  if ((prefix !== PREFIX_DEFLATE && prefix !== PREFIX_PLAIN) || payload === '') {
    throw new ProgressCodeError('Mã không đúng dạng', 'khong-doc-duoc');
  }

  let json: string;
  try {
    const bytes = fromBase64Url(payload);
    json = prefix === PREFIX_DEFLATE ? await inflate(bytes) : new TextDecoder().decode(bytes);
  } catch {
    throw new ProgressCodeError('Không giải mã được', 'khong-doc-duoc');
  }

  let data: unknown;
  try {
    data = JSON.parse(json);
  } catch {
    throw new ProgressCodeError('Nội dung mã không hợp lệ', 'khong-doc-duoc');
  }
  if (!isSharedProgress(data)) {
    throw new ProgressCodeError('Nội dung mã không hợp lệ', 'khong-doc-duoc');
  }
  if (data.schemaVersion > PROGRESS_SCHEMA_VERSION) {
    throw new ProgressCodeError('Mã tạo bởi phiên bản mới hơn của lalakode', 'phien-ban-moi-hon');
  }
  return data;
}

const earliest = (a: string | undefined, b: string | undefined): string | undefined =>
  a === undefined ? b : b === undefined ? a : a < b ? a : b;

const latest = (a: string | undefined, b: string | undefined): string | undefined =>
  a === undefined ? b : b === undefined ? a : a > b ? a : b;

/**
 * **Gộp, không ghi đè.** Trẻ nhập mã từ máy cũ vào máy đã học vài bài thì không
 * được mất bài nào: giữ phần tốt hơn của cả hai bên.
 * Code nháp của máy hiện tại luôn được giữ (mã chia sẻ vốn không mang nó).
 */
export function mergeProgress(local: ProgressSnapshot, incoming: SharedProgress): ProgressSnapshot {
  const exercises = new Map<string, ExerciseProgress>();
  for (const exercise of local.exercises) exercises.set(exercise.exerciseId, exercise);

  for (const shared of incoming.exercises) {
    const mine = exercises.get(shared.exerciseId);
    if (!mine) {
      exercises.set(shared.exerciseId, { ...shared, draftCode: '' });
      continue;
    }
    exercises.set(shared.exerciseId, {
      ...mine,
      status: mine.status === 'xong' || shared.status === 'xong' ? 'xong' : 'dang-lam',
      attempts: Math.max(mine.attempts, shared.attempts),
      updatedAt: latest(mine.updatedAt, shared.updatedAt) ?? mine.updatedAt,
      ...(() => {
        const passedAt = earliest(mine.passedAt, shared.passedAt);
        return passedAt === undefined ? {} : { passedAt };
      })(),
    });
  }

  const lessons = new Map<string, LessonProgress>();
  for (const lesson of local.lessons) lessons.set(lesson.lessonId, lesson);
  for (const shared of incoming.lessons) {
    const mine = lessons.get(shared.lessonId);
    if (!mine) {
      lessons.set(shared.lessonId, shared);
      continue;
    }
    const completedAt = earliest(mine.completedAt, shared.completedAt);
    lessons.set(shared.lessonId, {
      ...mine,
      startedAt: earliest(mine.startedAt, shared.startedAt) ?? mine.startedAt,
      ...(completedAt === undefined ? {} : { completedAt }),
    });
  }

  const lastActiveDay = latest(local.profile.lastActiveDay, incoming.profile.lastActiveDay);
  return {
    schemaVersion: PROGRESS_SCHEMA_VERSION,
    profile: {
      ...local.profile,
      createdAt:
        earliest(local.profile.createdAt, incoming.profile.createdAt) ?? local.profile.createdAt,
      streakDays: Math.max(local.profile.streakDays, incoming.profile.streakDays),
      ...(lastActiveDay === undefined ? {} : { lastActiveDay }),
      badges: [...new Set([...local.profile.badges, ...incoming.profile.badges])],
      ...((local.profile.nickname ?? incoming.profile.nickname)
        ? { nickname: local.profile.nickname ?? incoming.profile.nickname }
        : {}),
    },
    lessons: [...lessons.values()],
    exercises: [...exercises.values()],
  };
}

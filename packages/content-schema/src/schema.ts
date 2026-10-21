import { z } from 'zod';
import { NUMBERED_SLUG, PY_IDENTIFIER, SLUG } from './ids.ts';

/**
 * Schema cho nội dung trong `content/`. Thông báo lỗi bằng tiếng Việt vì người
 * đọc là người viết bài, không phải trẻ.
 *
 * Dùng `strictObject` ở mọi nơi: gõ sai tên trường sẽ báo lỗi thay vì bị bỏ qua.
 */

const slug = z.string().regex(SLUG, 'chỉ gồm chữ thường, số và dấu gạch ngang');
const numberedSlug = z.string().regex(NUMBERED_SLUG, 'phải có dạng `01-ten-ngan`');
const pyName = z.string().regex(PY_IDENTIFIER, 'phải là tên hợp lệ trong Python');
const title = z.string().min(1, 'không được để trống').max(80, 'tối đa 80 ký tự');
const status = z.enum(['draft', 'published']);
const friendlyMessage = z
  .string()
  .min(1, 'không được để trống')
  .max(200, 'tối đa 200 ký tự — viết ngắn cho trẻ dễ đọc');

/** `id` đầy đủ: `khoa`, `khoa.01-bai`, `khoa.01-bai.01-bai-tap`. */
const dottedId = z
  .string()
  .regex(/^[a-z0-9-]+(?:\.\d{2}-[a-z0-9-]+){0,2}$/, 'phải có dạng `khoa.01-bai.01-bai-tap`');

export const courseSchema = z.strictObject({
  id: slug,
  title,
  summary: z.string().min(1, 'không được để trống').max(300, 'tối đa 300 ký tự'),
  ageRange: z
    .tuple([z.number().int().min(5).max(18), z.number().int().min(5).max(18)])
    .refine(([from, to]) => from <= to, 'tuổi nhỏ phải đứng trước tuổi lớn'),
  authorId: slug,
  order: z.array(numberedSlug).min(1, 'khoá học cần ít nhất một bài'),
  status,
});

export const videoSchema = z.discriminatedUnion('provider', [
  z.strictObject({
    provider: z.literal('youtube-nocookie'),
    videoId: z.string().regex(/^[A-Za-z0-9_-]{11}$/, 'mã video YouTube gồm 11 ký tự'),
    durationSec: z.number().int().positive().max(3600),
  }),
  z.strictObject({
    provider: z.literal('hls'),
    src: z.string().startsWith('/', 'đường dẫn trên CloudFront, bắt đầu bằng `/`'),
    durationSec: z.number().int().positive().max(3600),
  }),
]);

export const lessonSchema = z.strictObject({
  id: dottedId,
  title,
  concepts: z
    .array(z.string().min(1))
    .min(1, 'ghi ít nhất một khái niệm')
    .max(5, 'tối đa 5 khái niệm — mỗi bài chỉ nên có một khái niệm mới'),
  estimatedMinutes: z.number().int().min(1).max(30, 'một bài nên gọn trong 30 phút'),
  video: videoSchema.optional(),
  exercises: z.array(numberedSlug).min(1, 'bài học cần ít nhất một bài tập'),
  status,
});

/** Giá trị JSON bất kỳ — dùng cho `expected` và `args` của test. */
const jsonValue = z.json();

export const testSchema = z.discriminatedUnion('type', [
  z.strictObject({
    type: z.literal('stdout_equals'),
    expected: z.string(),
    stdin: z.string().optional(),
    message: friendlyMessage,
  }),
  z.strictObject({
    type: z.literal('stdout_contains'),
    expected: z.string().min(1, 'không được để trống'),
    stdin: z.string().optional(),
    message: friendlyMessage,
  }),
  z.strictObject({
    type: z.literal('variable_equals'),
    name: pyName,
    expected: jsonValue,
    message: friendlyMessage,
  }),
  z.strictObject({
    type: z.literal('function_returns'),
    name: pyName,
    args: z.array(jsonValue),
    expected: jsonValue,
    message: friendlyMessage,
  }),
  z.strictObject({
    type: z.literal('python_assert'),
    code: z.string().min(1, 'không được để trống'),
    message: friendlyMessage,
  }),
]);

export const exerciseSchema = z.strictObject({
  id: dottedId,
  title,
  kind: z.literal('code'),
  prompt: z.string().min(1, 'không được để trống').max(400, 'tối đa 400 ký tự'),
  starterCode: z.string().refine((code) => code.split('\n').length <= 20, 'tối đa 20 dòng'),
  solution: z.string().min(1, 'không được để trống'),
  tests: z.array(testSchema).min(1, 'cần ít nhất một test'),
  hints: z.array(z.string().min(1)).length(3, 'phải có đúng 3 gợi ý, tăng dần mức độ'),
  timeoutMs: z.number().int().min(1000).max(10_000, 'tối đa 10 giây').default(5000),
  turtle: z.boolean().default(false),
});

export type Course = z.infer<typeof courseSchema>;
export type Lesson = z.infer<typeof lessonSchema>;
export type Video = z.infer<typeof videoSchema>;
export type Exercise = z.infer<typeof exerciseSchema>;
export type ExerciseTest = z.infer<typeof testSchema>;
export type ContentStatus = z.infer<typeof status>;

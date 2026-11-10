import { foldVietnamese } from './catalog';

/**
 * Mục "Nội dung bài" (S0-38): các tiêu đề mục của `lesson.md` thành link neo.
 * `id` sinh từ chữ tiêu đề bỏ dấu, nên ổn định khi sửa nội dung khác của bài và
 * gửi link `#vong-lap-long-nhau` cho bạn vẫn đúng chỗ.
 */
export interface OutlineItem {
  id: string;
  text: string;
  /** Dòng của tiêu đề trong Markdown (tính từ 1), để gắn `id` vào đúng `h2` khi render. */
  line: number;
}

/** "Lệnh `print` là gì?" → "lenh-print-la-gi". */
export function headingId(text: string): string {
  return (
    foldVietnamese(text)
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'muc'
  );
}

/** Bỏ ký hiệu Markdown trong tiêu đề: `code`, **đậm**, _nghiêng_, [link](…). */
function plainText(markdown: string): string {
  return markdown
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[`*_]/g, '')
    .trim();
}

/**
 * Tiêu đề mục theo đúng thứ tự xuất hiện. Gồm cả `#` lẫn `##` vì màn bài học
 * hiện cả hai thành `h2` (LessonBody); bỏ qua dòng trong khối code. Hai tiêu đề
 * trùng chữ thì cái sau thêm `-2`, `-3`.
 */
export function lessonOutline(markdown: string): OutlineItem[] {
  const items: OutlineItem[] = [];
  const used = new Map<string, number>();
  let inFence = false;
  for (const [index, line] of markdown.split(/\r?\n/).entries()) {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const match = /^#{1,2}\s+(.+?)\s*#*\s*$/.exec(line);
    if (!match?.[1]) continue;
    const text = plainText(match[1]);
    const base = headingId(text);
    const count = (used.get(base) ?? 0) + 1;
    used.set(base, count);
    items.push({ id: count === 1 ? base : `${base}-${count}`, text, line: index + 1 });
  }
  return items;
}

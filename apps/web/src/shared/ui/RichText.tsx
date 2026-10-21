import { Fragment } from 'react';

/**
 * Nội dung bài viết bằng Markdown, nhưng đề bài và gợi ý chỉ dùng mỗi `code`
 * trong dấu nháy ngược. Nên ở đây xử lý đúng một thứ đó, thay vì kéo cả bộ
 * Markdown vào màn bài tập (trang bài học sẽ dùng react-markdown).
 */
export function RichText({ text }: { text: string }) {
  const parts = text.split('`');
  return (
    <>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          <code
            key={`${index}-${part}`}
            className="rounded bg-surface-muted px-1 py-0.5 font-mono text-[0.9em]"
          >
            {part}
          </code>
        ) : (
          <Fragment key={`${index}-${part}`}>{part}</Fragment>
        ),
      )}
    </>
  );
}

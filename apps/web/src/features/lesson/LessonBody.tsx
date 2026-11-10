import type { ReactNode } from 'react';
import Markdown from 'react-markdown';
import type { OutlineItem } from '../../content/outline';

/**
 * Nội dung bài học viết bằng Markdown. Chỉ CommonMark, **không** `remark-gfm`:
 * 20 bài hiện có chỉ dùng tiêu đề, danh sách, khối code, `code` và **đậm**.
 * Khi nào có bài cần bảng thì thêm, kẻo mang thêm vài chục kB cho cả route.
 *
 * `react-markdown` không render HTML thô, nên nội dung không thể chèn thẻ vào
 * trang — đây cũng là lý do không tự viết bộ parse riêng.
 */

/** Bỏ dòng `# Tiêu đề` mở đầu: trang đã có h1 riêng, để lại là lặp hai lần. */
export function stripLeadingTitle(markdown: string): string {
  return markdown.replace(/^\s*#\s+.*\r?\n+/, '');
}

/**
 * `markdown` đã bỏ tiêu đề mở đầu (`stripLeadingTitle`); `outline` sinh từ chính
 * chuỗi đó, nên số dòng của từng tiêu đề khớp với `node.position` của
 * react-markdown — mỗi `h2` nhận đúng `id` mà mục "Nội dung bài" trỏ tới.
 */
export function LessonBody({
  markdown,
  outline = [],
}: {
  markdown: string;
  outline?: readonly OutlineItem[];
}) {
  const idAtLine = new Map(outline.map((item) => [item.line, item.id]));
  const heading = (children: ReactNode, line: number | undefined) => (
    <h2
      id={line === undefined ? undefined : idAtLine.get(line)}
      className="mt-8 scroll-mt-20 text-section-title"
    >
      {children}
    </h2>
  );
  return (
    <div className="mt-6 space-y-4 text-card-title font-normal leading-relaxed" data-testid="lesson-body">
      <Markdown
        components={{
          // Markdown trong bài không được phá cấu trúc tiêu đề của trang.
          h1: ({ children, node }) => heading(children, node?.position?.start.line),
          h2: ({ children, node }) => heading(children, node?.position?.start.line),
          h3: ({ children }) => <h3 className="mt-6 text-card-title">{children}</h3>,
          p: ({ children }) => <p>{children}</p>,
          ul: ({ children }) => <ul className="list-disc space-y-1 pl-6">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal space-y-1 pl-6">{children}</ol>,
          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
          a: ({ children, href }) => (
            <a href={href} rel="noopener noreferrer" className="text-accent-strong underline">
              {children}
            </a>
          ),
          code: ({ children, className }) =>
            className?.startsWith('language-') ? (
              // Khối code: `pre` bên dưới lo phần khung và cuộn ngang.
              <code className="font-mono text-[15px]">{children}</code>
            ) : (
              <code className="rounded bg-surface-muted px-1 py-0.5 font-mono text-[0.9em]">
                {children}
              </code>
            ),
          pre: ({ children }) => (
            <pre className="overflow-x-auto rounded-card bg-code-bg p-4 text-code-text">{children}</pre>
          ),
        }}
      >
        {markdown}
      </Markdown>
    </div>
  );
}

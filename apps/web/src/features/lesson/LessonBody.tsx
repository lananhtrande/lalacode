import Markdown from 'react-markdown';

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

export function LessonBody({ markdown }: { markdown: string }) {
  return (
    <div className="mt-6 space-y-4 text-lg leading-relaxed" data-testid="lesson-body">
      <Markdown
        components={{
          // Markdown trong bài không được phá cấu trúc tiêu đề của trang.
          h1: ({ children }) => <h2 className="mt-8 text-xl font-bold">{children}</h2>,
          h2: ({ children }) => <h2 className="mt-8 text-xl font-bold">{children}</h2>,
          h3: ({ children }) => <h3 className="mt-6 text-lg font-semibold">{children}</h3>,
          p: ({ children }) => <p>{children}</p>,
          ul: ({ children }) => <ul className="list-disc space-y-1 pl-6">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal space-y-1 pl-6">{children}</ol>,
          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
          code: ({ children, className }) =>
            className?.startsWith('language-') ? (
              // Khối code: `pre` bên dưới lo phần khung và cuộn ngang.
              <code className="font-mono text-base">{children}</code>
            ) : (
              <code className="rounded bg-surface-muted px-1 py-0.5 font-mono text-[0.9em]">
                {children}
              </code>
            ),
          pre: ({ children }) => (
            <pre className="overflow-x-auto rounded-2xl bg-ink p-4 text-surface">{children}</pre>
          ),
        }}
      >
        {stripLeadingTitle(markdown)}
      </Markdown>
    </div>
  );
}

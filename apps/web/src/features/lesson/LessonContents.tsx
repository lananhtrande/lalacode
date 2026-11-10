import { useEffect, useState } from 'react';
import type { OutlineItem } from '../../content/outline';
import { vi } from '../../shared/i18n/vi';

/**
 * Khối "Nội dung bài" (S0-38): các tiêu đề mục thành link neo. Ở ≥ 1280px nằm
 * dính bên phải và tô mục đang đọc (`aria-current="location"`).
 */
export function LessonContents({
  outline,
  activeId,
  className = '',
}: {
  outline: readonly OutlineItem[];
  activeId?: string | undefined;
  className?: string;
}) {
  return (
    <nav aria-label={vi.learn.contents} className={className}>
      <h2 className="text-small font-semibold tracking-wide text-ink-soft uppercase">
        {vi.learn.contents}
      </h2>
      <ol className="mt-2 space-y-1 border-l-2 border-line">
        {outline.map((item) => {
          const active = item.id === activeId;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={active ? 'location' : undefined}
                className={[
                  '-ml-0.5 flex min-h-tap items-center border-l-2 py-1 pl-3 text-small',
                  active
                    ? 'border-accent font-semibold text-accent-strong'
                    : 'border-transparent text-ink-soft hover:text-ink',
                ].join(' ')}
              >
                {item.text}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/**
 * Mục đang đọc: tiêu đề gần nhất đã cuộn qua mép trên (dưới topbar). Trình
 * duyệt không có IntersectionObserver (jsdom) thì không tô gì.
 */
export function useActiveHeading(ids: readonly string[]): string | undefined {
  const [active, setActive] = useState<string | undefined>(undefined);
  const key = ids.join(' ');

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined' || key === '') return;
    const headings = key
      .split(' ')
      .map((id) => document.getElementById(id))
      .filter((element) => element !== null);
    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        const first = headings.find((element) => visible.has(element.id));
        if (first) setActive(first.id);
      },
      // Dải ngang ở 1/3 trên của màn: tiêu đề đi vào dải này là mục đang đọc.
      { rootMargin: '-64px 0px -66% 0px' },
    );
    for (const heading of headings) observer.observe(heading);
    return () => observer.disconnect();
  }, [key]);

  return active;
}

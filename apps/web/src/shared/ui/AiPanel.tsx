import type { HTMLAttributes } from 'react';

/**
 * Khung cho **mọi thứ do AI tạo ra**. Nền riêng (`ai-surface`) để trẻ luôn
 * phân biệt được đâu là gợi ý của trợ lý, đâu là nội dung bài.
 */
export function AiPanel({ className = '', ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={['rounded-card bg-ai-surface p-4', className].join(' ')} {...rest} />;
}

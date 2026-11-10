import { createContext, useContext, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

/**
 * Chỗ bên phải topbar của khung học bài (S0-38). Màn bài tập đặt trạng thái
 * "Python sẵn sàng" (và từ S0-39 là nút Chạy thử/Nộp bài) vào đây, dù topbar
 * thuộc về khung chứ không thuộc về màn bài tập.
 */
export const TopbarSlotContext = createContext<HTMLElement | null>(null);

/** Ngoài khung học bài (ví dụ trong unit test của từng màn) thì hiện tại chỗ. */
export function TopbarSlot({ children }: { children: ReactNode }) {
  const target = useContext(TopbarSlotContext);
  return target ? createPortal(children, target) : children;
}

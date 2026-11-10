import { expect, type Page } from '@playwright/test';

/**
 * Màn hẹp (< 1024px) chia bài tập thành ba tab Đề · Code · Kết quả (S0-39) và
 * mở ở tab "Đề": phải sang tab "Code" mới thấy editor. Màn rộng không có tab.
 */
export async function openPart(page: Page, name: 'Đề' | 'Code' | 'Kết quả'): Promise<void> {
  // Đợi bài tập tải xong (editor đã có trong trang, dù đang bị ẩn) rồi mới xét tab.
  await page.locator('.cm-content').waitFor({ state: 'attached' });
  const tab = page.getByRole('tablist', { name: 'Phần của bài tập' }).getByRole('tab', { name });
  if (await tab.isVisible()) await tab.click();
}

export const openCodeTab = (page: Page): Promise<void> => openPart(page, 'Code');

/**
 * Đặt nội dung ô code một cách chắc chắn.
 *
 * Trước đây test gõ bằng bàn phím (`Ctrl/Cmd+A` rồi `type`). Trên máy CI (Linux)
 * cách đó không ổn định: nội dung cũ không bị chọn hết nên chữ mới trộn vào chữ
 * cũ, và lỗi hiện ra là một `SyntaxError` khó hiểu ở tận bước sau. `fill()` ghi
 * thẳng vào contenteditable, rồi mình kiểm tra lại nội dung ngay — sai là biết
 * liền, không phải lần ngược từ triệu chứng.
 */
export async function setCode(page: Page, code: string): Promise<void> {
  await openCodeTab(page);
  const editor = page.locator('.cm-content');
  await editor.waitFor();
  await editor.fill(code);
  await expect(editor).toHaveText(code.replace(/\n$/, ''), { useInnerText: true });
}

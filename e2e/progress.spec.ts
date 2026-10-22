import { expect, test, type Page } from '@playwright/test';

const EXERCISE_1 = '/bai-tap/py-khoi-dong.01-xin-chao.01-in-loi-chao';
const EXERCISE_2 = '/bai-tap/py-khoi-dong.01-xin-chao.02-in-hai-dong';

async function solve(page: Page, url: string, code: string): Promise<void> {
  await page.goto(url);
  const editor = page.locator('.cm-content');
  await editor.waitFor();
  await editor.fill(code);
  await page.getByRole('button', { name: 'Nộp bài' }).click();
  await expect(page.getByText('Tuyệt vời, em làm đúng hết rồi!')).toBeVisible({
    timeout: 120_000,
  });
}

/** Tiến độ, streak và huy hiệu — tất cả đọc từ IndexedDB trên máy. */
test.describe('tiến độ và huy hiệu', () => {
  test.slow();

  test('làm xong bài tập thì bản đồ đếm đúng và có huy hiệu đầu tiên', async ({ page }) => {
    await page.goto('/ban-do');
    await expect(page.getByTestId('progress-py-khoi-dong.01-xin-chao')).toContainText('0/2');
    await expect(page.getByTestId('streak')).toContainText('Hôm nay em học một bài');

    await solve(page, EXERCISE_1, 'print("Xin chào, Python!")');

    await page.goto('/ban-do');
    await expect(page.getByTestId('progress-py-khoi-dong.01-xin-chao')).toContainText('1/2');
    await expect(page.getByTestId('streak')).toContainText('1 ngày học liên tiếp');

    await page.goto('/huy-hieu');
    await expect(page.getByTestId('badge-bai-dau-tien')).toContainText('Đã nhận');
    await expect(page.getByTestId('badge-nam-bai-tap')).toContainText('Tiến trình 1/5');
    await expect(page.getByTestId('badge-count')).toContainText('1/6');
  });

  test('xong hết bài tập thì bài học được đánh dấu Xong và có thêm huy hiệu', async ({ page }) => {
    // Hai lần giải = hai lần nạp Pyodide. Chạy song song nhiều trình duyệt thì
    // ngân sách mặc định (90 giây) hơi chật, nên nới riêng cho test này.
    test.setTimeout(240_000);
    await solve(page, EXERCISE_1, 'print("Xin chào, Python!")');
    await solve(page, EXERCISE_2, 'print("Em thích Python")\nprint("Python cũng thích em")');

    await page.goto('/ban-do');
    const card = page.getByTestId('lesson-py-khoi-dong.01-xin-chao');
    await expect(card).toContainText('Xong');
    await expect(page.getByTestId('progress-py-khoi-dong.01-xin-chao')).toContainText('2/2');

    await page.goto('/huy-hieu');
    await expect(page.getByTestId('badge-xong-bai-hoc')).toContainText('Đã nhận');
    await expect(page.getByTestId('badge-count')).toContainText('2/6');
  });

  test('máy chưa học gì thì bản đồ vẫn mở bình thường, chưa có huy hiệu nào', async ({ page }) => {
    await page.goto('/huy-hieu');
    await expect(page.getByTestId('badge-count')).toContainText('0/6');
    await expect(page.getByTestId('badge-bai-dau-tien')).toContainText('Chưa nhận');
  });
});

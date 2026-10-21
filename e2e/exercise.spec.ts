import { expect, test } from '@playwright/test';

const EXERCISE = '/bai-tap/py-khoi-dong.01-xin-chao.01-in-loi-chao';

/**
 * Luồng chính số 1 trong docs/testing.md: mở bài tập → làm sai → thấy báo lỗi
 * tiếng Việt → sửa đúng → đạt hết. Chạy Pyodide thật nên để chế độ chậm.
 */
test.describe('màn bài tập', () => {
  test.slow();

  test('mở được bài tập: có đề bài, ô code và nút', async ({ page }) => {
    await page.goto(EXERCISE);
    await expect(page.getByRole('heading', { name: 'In lời chào' })).toBeVisible();
    await expect(page.getByText(/Viết chương trình in ra dòng chữ/)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Chạy thử' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Nộp bài' })).toBeVisible();
    await expect(page.getByTestId('python-status')).toHaveText('Python sẵn sàng', {
      timeout: 120_000,
    });
  });

  test('làm sai rồi sửa đúng: báo lỗi tiếng Việt rồi đạt hết', async ({ page }) => {
    await page.goto(EXERCISE);
    const editor = page.locator('.cm-content');
    await expect(editor).toBeVisible();

    // Lần 1: in thiếu chữ → chưa đạt, hiện câu nhắc của người viết bài.
    await editor.click();
    await page.keyboard.press('ControlOrMeta+a');
    await page.keyboard.type('print("Xin chào")');
    await page.getByRole('button', { name: 'Nộp bài' }).click();
    await expect(page.getByText('Gần được rồi. Em xem lại phần chưa đạt nhé.')).toBeVisible({
      timeout: 120_000,
    });
    await expect(page.getByText(/Test 1: Chưa đạt/)).toBeVisible();

    // Lần 2: sửa cho đúng → đạt hết.
    await editor.click();
    await page.keyboard.press('ControlOrMeta+a');
    await page.keyboard.type('print("Xin chào, Python!")');
    await page.getByRole('button', { name: 'Nộp bài' }).click();
    await expect(page.getByText('Tuyệt vời, em làm đúng hết rồi!')).toBeVisible({
      timeout: 120_000,
    });
    await expect(page.getByText(/Test 1: Đạt/)).toBeVisible();
  });

  test('chạy thử hiện output, code lỗi hiện tiếng Việt kèm số dòng', async ({ page }) => {
    await page.goto(EXERCISE);
    const editor = page.locator('.cm-content');
    await editor.click();
    await page.keyboard.press('ControlOrMeta+a');
    await page.keyboard.type('print("thử xem")');
    await page.getByRole('button', { name: 'Chạy thử' }).click();
    await expect(page.getByTestId('exercise-output')).toHaveText('thử xem\n', { timeout: 120_000 });

    await editor.click();
    await page.keyboard.press('ControlOrMeta+a');
    await page.keyboard.type('print(ten_chua_co)');
    await page.getByRole('button', { name: 'Chạy thử' }).click();
    const panel = page.getByTestId('exercise-error');
    await expect(panel).toContainText('Python chưa biết tên', { timeout: 120_000 });
    await expect(panel).toContainText('Dòng 1');
  });

  test('gợi ý mở dần, không lộ hết một lúc', async ({ page }) => {
    await page.goto(EXERCISE);
    await page.getByRole('button', { name: 'Mở gợi ý' }).click();
    await expect(page.getByText(/Gợi ý 1:/)).toBeVisible();
    await expect(page.getByText(/Gợi ý 2:/)).toBeHidden();
    await page.getByRole('button', { name: 'Gợi ý tiếp theo' }).click();
    await expect(page.getByText(/Gợi ý 2:/)).toBeVisible();
  });

  test('vào bản đồ rồi mở bài học, bài tập đều đi được bằng chuột', async ({ page }) => {
    await page.goto('/ban-do');
    await page.getByRole('link', { name: /Xin chào, Python!/ }).click();
    await expect(page).toHaveURL(/\/bai-hoc\/py-khoi-dong\.01-xin-chao$/);
  });

  test('màn bài tập không bị cuộn ngang trên điện thoại', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto(EXERCISE);
    await expect(page.getByRole('heading', { name: 'In lời chào' })).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

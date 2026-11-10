import { expect, test } from '@playwright/test';
import { openPart, setCode } from './support/editor';

/**
 * Hành trình chính sau S0-37 → S0-40: catalog → trang khoá → bài 1 → bài tập 1
 * → Chạy thử → Nộp bài đúng → "Bài tập tiếp theo". Chromium (1280) và WebKit
 * (iPhone 390, iPad).
 */
test('từ catalog tới bài tập tiếp theo', async ({ page }) => {
  test.slow();
  await page.goto('/khoa-hoc');
  await page
    .getByTestId('course-py-khoi-dong')
    .getByRole('link', { name: /Khám phá/ })
    .click();
  await page.getByRole('link', { name: 'Bắt đầu' }).click();
  await expect(page.getByRole('heading', { name: 'Xin chào, Python!', level: 1 })).toBeVisible();
  await expect(page.getByTestId('lesson-body')).toBeVisible();

  await page.getByTestId('lesson-cta').click();
  await expect(page).toHaveURL(/\/bai-tap\/py-khoi-dong\.01-xin-chao\.01-in-loi-chao$/);
  await setCode(page, 'print("Xin chào, Python!")');
  await expect(page.getByTestId('python-status')).toHaveText('Python sẵn sàng', {
    timeout: 120_000,
  });
  await page.getByRole('button', { name: 'Chạy thử' }).click();
  await expect(page.getByTestId('exercise-output')).toContainText('Xin chào, Python!', {
    timeout: 120_000,
  });

  await openPart(page, 'Code');
  await page.getByRole('button', { name: 'Nộp bài' }).click();
  const next = page.getByTestId('next-step').getByRole('link', { name: /Bài tập tiếp theo/ });
  await expect(next).toBeFocused({ timeout: 120_000 });
  await next.click();
  await expect(page).toHaveURL(/\/bai-tap\/py-khoi-dong\.01-xin-chao\.02-in-hai-dong$/);
});

import { expect, test } from '@playwright/test';

test('trang chủ mở được và hiển thị tiếng Việt', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'lalacode' })).toBeVisible();
  await expect(page.getByText('Học Python bằng tiếng Việt, mỗi ngày 15 phút.')).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'vi');
});

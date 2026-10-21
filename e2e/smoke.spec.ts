import { expect, test } from '@playwright/test';

test.describe('khung app', () => {
  test('trang chủ mở được, tiếng Việt, có nút bắt đầu', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'vi');
    await expect(
      page.getByRole('heading', { name: 'Viết dòng code Python đầu tiên ngay hôm nay' }),
    ).toBeVisible();
    await expect(page.getByRole('link', { name: 'Bắt đầu học' })).toBeVisible();
  });

  test('bấm menu chuyển sang trang khác mà không tải lại trang', async ({ page }) => {
    await page.goto('/');
    await page
      .getByRole('navigation', { name: 'Menu chính' })
      .getByRole('link', { name: 'Bản đồ' })
      .click();
    await expect(page).toHaveURL(/\/ban-do$/);
    await expect(page.getByRole('heading', { name: 'Bản đồ nhiệm vụ' })).toBeVisible();
  });

  test('đường dẫn lạ hiện trang không tìm thấy', async ({ page }) => {
    await page.goto('/khong-co-trang-nay');
    await expect(page.getByRole('heading', { name: 'Không tìm thấy trang này' })).toBeVisible();
  });

  test('nút chính đủ lớn cho ngón tay trẻ (≥ 44 px)', async ({ page }) => {
    await page.goto('/');
    const box = await page.getByRole('link', { name: 'Bắt đầu học' }).boundingBox();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
  });

  test('trang không bị cuộn ngang trên màn hình nhỏ', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto('/');
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

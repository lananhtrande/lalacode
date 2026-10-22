import { expect, test } from '@playwright/test';

/**
 * Hai trang này bố mẹ đọc trước khi cho con dùng, nên đường đi tới chúng phải
 * ngắn và không được gãy: từ trang chủ, từ menu, và từ chân trang.
 */
test.describe('trang cho phụ huynh', () => {
  test('từ trang chủ đi tới giới thiệu rồi sang quyền riêng tư', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Đọc trang dành cho bố mẹ' }).click();
    await expect(page).toHaveURL(/\/gioi-thieu$/);
    await expect(page.getByRole('heading', { name: 'lalacode là gì?' })).toBeVisible();

    await page.getByRole('link', { name: 'Đọc trang quyền riêng tư' }).click();
    await expect(page).toHaveURL(/\/quyen-rieng-tu$/);
    await expect(page.getByRole('heading', { name: 'Quyền riêng tư', exact: true })).toBeVisible();
  });

  test('chân trang có đường tới quyền riêng tư ở mọi trang', async ({ page }) => {
    await page.goto('/ban-do');
    await page.getByRole('contentinfo').getByRole('link', { name: 'Quyền riêng tư' }).click();
    await expect(page).toHaveURL(/\/quyen-rieng-tu$/);
  });

  test('trang quyền riêng tư nói thẳng hai giới hạn, và dẫn tới nút xoá dữ liệu', async ({
    page,
  }) => {
    await page.goto('/quyen-rieng-tu');
    await expect(page.getByTestId('privacy-filter-limit')).toContainText('vẫn có thể lọt qua');
    await expect(page.getByTestId('privacy-report-limits')).toContainText('không có chữ ký');

    await page.getByRole('link', { name: 'Tới trang Mã tiến độ' }).click();
    await expect(page).toHaveURL(/\/tien-do$/);
    await expect(page.getByRole('button', { name: 'Xoá dữ liệu' })).toBeVisible();
  });

  test('hai trang không bị cuộn ngang trên điện thoại', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    for (const path of ['/gioi-thieu', '/quyen-rieng-tu']) {
      await page.goto(path);
      // Bảng dữ liệu rộng hơn màn hình: nó phải tự cuộn trong khung của nó.
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, path).toBeLessThanOrEqual(0);
    }
  });
});

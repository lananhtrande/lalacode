import { expect, test } from '@playwright/test';

/**
 * S0-37: catalog → trang khoá → bài 1. Chạy trên Chromium (1280) và WebKit
 * (iPhone 390, iPad).
 */
test.describe('khoá học', () => {
  test('catalog → "Khám phá" → trang khoá → "Bắt đầu" → bài 1', async ({ page }) => {
    await page.goto('/khoa-hoc');
    const card = page.getByTestId('course-py-khoi-dong');
    await expect(card).toContainText('Mới bắt đầu');
    await expect(card).toContainText('20 bài · khoảng 5 giờ');
    await card.getByRole('link', { name: /Khám phá/ }).click();

    await expect(page).toHaveURL(/\/khoa-hoc\/py-khoi-dong$/);
    await expect(page.getByRole('heading', { name: 'Python khởi động', level: 1 })).toBeVisible();
    await expect(page.getByTestId('course-done')).toContainText('0/20');
    // Chương đang học mở sẵn; chương sau đóng.
    await expect(page.getByTestId('chapter-lam-quen-voi-python')).toHaveAttribute('open', '');
    await expect(page.getByTestId('chapter-ve-choi-va-du-an')).not.toHaveAttribute('open');

    await page.getByRole('link', { name: 'Bắt đầu' }).click();
    await expect(page).toHaveURL(/\/bai-hoc\/py-khoi-dong\.01-xin-chao$/);
  });

  test('/ban-do cũ chuyển sang trang khoá', async ({ page }) => {
    await page.goto('/ban-do');
    await expect(page).toHaveURL(/\/khoa-hoc\/py-khoi-dong$/);
    await expect(page.getByRole('heading', { name: 'Python khởi động', level: 1 })).toBeVisible();
  });

  test('bộ lọc nằm trên URL; lọc không ra thì có nút xoá lọc', async ({ page }) => {
    await page.goto('/khoa-hoc');
    await page.getByRole('button', { name: 'Đã xong' }).click();
    await expect(page).toHaveURL(/\?trang-thai=da-xong$/);
    await expect(page.getByText('Không có khoá học nào khớp.')).toBeVisible();

    await page.reload();
    await expect(page.getByRole('button', { name: 'Đã xong' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await page.getByRole('button', { name: 'Xoá bộ lọc' }).click();
    await expect(page).toHaveURL(/\/khoa-hoc$/);
    await expect(page.getByTestId('course-py-khoi-dong')).toBeVisible();
  });

  test('catalog không bị cuộn ngang trên điện thoại', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto('/khoa-hoc');
    await expect(page.getByTestId('course-py-khoi-dong')).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

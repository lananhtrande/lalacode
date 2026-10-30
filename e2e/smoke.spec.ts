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
    // Dưới 1024px menu nằm trong ngăn kéo, phải mở ra trước.
    const openMenu = page.getByRole('button', { name: 'Mở menu' });
    if (await openMenu.isVisible()) await openMenu.click();
    await page
      .getByRole('navigation', { name: 'Menu chính' })
      .getByRole('link', { name: 'Bản đồ' })
      .click();
    await expect(page).toHaveURL(/\/ban-do$/);
    await expect(page.getByRole('heading', { name: 'Bản đồ nhiệm vụ' })).toBeVisible();
  });

  test('khung trang: sidebar trên màn rộng, ngăn kéo menu trên màn hẹp', async ({ page }) => {
    await page.goto('/ban-do');
    const nav = page.getByRole('navigation', { name: 'Menu chính' });
    const openMenu = page.getByRole('button', { name: 'Mở menu' });
    const width = page.viewportSize()?.width ?? 0;
    if (width >= 1024) {
      await expect(nav).toBeVisible();
      await expect(openMenu).toBeHidden();
      // Mục đang chọn được tô đậm.
      await expect(nav.getByRole('link', { name: 'Bản đồ' })).toHaveAttribute(
        'aria-current',
        'page',
      );
    } else {
      await expect(nav).toBeHidden();
      await openMenu.click();
      await expect(nav).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(nav).toBeHidden();
      // Chọn một mục thì ngăn kéo tự đóng.
      await openMenu.click();
      await nav.getByRole('link', { name: 'Huy hiệu' }).click();
      await expect(page).toHaveURL(/\/huy-hieu$/);
      await expect(nav).toBeHidden();
    }
  });

  test('bản đồ liệt kê bài học đọc từ bundle nội dung', async ({ page }) => {
    await page.goto('/ban-do');
    const lesson = page.getByRole('link', { name: /Xin chào, Python!/ });
    await expect(lesson).toBeVisible();
    await expect(lesson).toHaveAttribute('href', '/bai-hoc/py-khoi-dong.01-xin-chao');
  });

  test('bundle nội dung không chứa lời giải mẫu', async ({ page }) => {
    const response = await page.request.get('/content/index.json');
    expect(response.ok()).toBe(true);
    const index = (await response.json()) as {
      courses: { lessons: { file: string }[] }[];
    };
    const file = index.courses[0]?.lessons[0]?.file ?? '';
    const lesson = await page.request.get(`/content/${file}`);
    const text = await lesson.text();
    expect(text).not.toContain('"solution"');
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

import { expect, test } from '@playwright/test';

const LESSON = '/bai-hoc/py-khoi-dong.01-xin-chao';

/**
 * Trước S0-28 màn này là khung "Đang xây", nên bản đồ dẫn vào ngõ cụt: bấm vào
 * bài là không còn đường nào tới bài tập. Test đầu tiên giữ đúng đường đi đó.
 */
test.describe('màn bài học', () => {
  test('từ bản đồ vào bài học rồi sang được bài tập', async ({ page }) => {
    await page.goto('/ban-do');
    await page.getByRole('link', { name: /Xin chào, Python!/ }).click();
    await expect(page).toHaveURL(/\/bai-hoc\/py-khoi-dong\.01-xin-chao$/);
    await expect(page.getByRole('heading', { name: 'Xin chào, Python!', level: 1 })).toBeVisible();

    await page.getByTestId('lesson-cta').click();
    await expect(page).toHaveURL(/\/bai-tap\/py-khoi-dong\.01-xin-chao\.01-in-loi-chao$/);
    await expect(page.getByRole('heading', { name: 'In lời chào' })).toBeVisible();
  });

  test('nội dung bài hiện ra dạng chữ, khối code ra khối code', async ({ page }) => {
    await page.goto(LESSON);
    const body = page.getByTestId('lesson-body');
    await expect(body).toBeVisible();
    await expect(body.locator('pre')).toHaveCount(1);
    await expect(body.locator('pre')).toContainText('print(');
    // Markdown phải được dịch, không phải in nguyên dấu thăng hay nháy ngược.
    await expect(body).not.toContainText('```');
  });

  test('bài học liệt kê đủ bài tập, mỗi bài một đường dẫn', async ({ page }) => {
    await page.goto(LESSON);
    const links = page.getByTestId('lesson-exercises').getByRole('link');
    // Bài 01 có đúng 4 bài tập; con số lấy từ chính bundle nội dung.
    await expect(links).toHaveCount(4);
    await expect(links.first()).toHaveAttribute(
      'href',
      '/bai-tap/py-khoi-dong.01-xin-chao.01-in-loi-chao',
    );
    await expect(links.last()).toHaveAttribute(
      'href',
      '/bai-tap/py-khoi-dong.01-xin-chao.04-cay-thong-sao',
    );
  });

  test('mở bài học không gọi ra ngoài domain của mình', async ({ page }) => {
    const external: string[] = [];
    page.on('request', (request) => {
      const url = new URL(request.url());
      if (url.hostname !== 'localhost' && url.hostname !== '127.0.0.1')
        external.push(request.url());
    });
    await page.goto(LESSON);
    await expect(page.getByTestId('lesson-body')).toBeVisible();
    expect(external).toEqual([]);
  });

  test('bài học lạ thì nói không tìm thấy, vẫn có đường về bản đồ', async ({ page }) => {
    await page.goto('/bai-hoc/khong-co-bai-nay');
    await expect(page.getByRole('heading', { name: 'Không tìm thấy bài học này.' })).toBeVisible();
    await page.getByRole('link', { name: 'Về bản đồ nhiệm vụ' }).click();
    await expect(page).toHaveURL(/\/ban-do$/);
  });

  test('màn bài học không bị cuộn ngang trên điện thoại', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto(LESSON);
    await expect(page.getByTestId('lesson-body')).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

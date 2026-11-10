import { expect, test } from '@playwright/test';

const LESSON = '/bai-hoc/py-khoi-dong.07-lam-di-lam-lai';
const EXERCISE = '/bai-tap/py-khoi-dong.07-lam-di-lam-lai.03-bang-nhan';

/**
 * S0-38: khung học bài. Màn rộng (Chromium 1280, iPad ngang không có — iPad dọc
 * 810 là màn hẹp) có sidebar mục lục; màn hẹp mở mục lục bằng ngăn kéo.
 */
test.describe('trình học bài', () => {
  test('topbar có breadcrumb và bộ đếm; bài học có nhãn chương', async ({ page }) => {
    await page.goto(EXERCISE);
    const crumbs = page.getByRole('navigation', { name: 'Vị trí' });
    await expect(crumbs.getByRole('link', { name: 'Bài 7 · Làm đi làm lại' })).toHaveAttribute(
      'href',
      '/bai-hoc/py-khoi-dong.07-lam-di-lam-lai',
    );
    if ((page.viewportSize()?.width ?? 0) >= 640) {
      await expect(page.getByTestId('lesson-counter')).toHaveText('Bài 7/20');
      await expect(page.getByTestId('exercise-counter')).toHaveText('Bài tập 3/5');
    }
    await expect(page.getByRole('banner').getByTestId('python-status')).toBeVisible();

    await crumbs.getByRole('link', { name: 'Bài 7 · Làm đi làm lại' }).click();
    await expect(page.getByTestId('chapter-label')).toHaveText(
      /Chương 2 · Ra quyết định và lặp lại/i,
    );
  });

  test('mục lục: mục đang mở được tô và có aria-current', async ({ page }) => {
    await page.goto(LESSON);
    const wide = (page.viewportSize()?.width ?? 0) >= 1024;
    if (!wide) await page.getByRole('button', { name: 'Mục lục' }).click();
    const outline = page.getByRole('navigation', { name: 'Mục lục khoá học' });
    const current = outline.locator('[aria-current="page"]');
    await expect(current).toHaveCount(1);
    await expect(current).toHaveAttribute('href', '/bai-hoc/py-khoi-dong.07-lam-di-lam-lai');
    await expect(current).toBeInViewport();

    if (!wide) {
      // Ngăn kéo: Esc thì đóng và trả focus về nút "Mục lục".
      await page.keyboard.press('Escape');
      await expect(page.getByRole('dialog', { name: 'Mục lục khoá học' })).toBeHidden();
      await expect(page.getByRole('button', { name: 'Mục lục' })).toBeFocused();
    }
  });

  test('màn rộng: bài tập mặc định thu gọn mục lục; mở ra thì nhớ sau khi tải lại', async ({
    page,
  }) => {
    test.skip((page.viewportSize()?.width ?? 0) < 1024, 'Màn hẹp dùng ngăn kéo');
    await page.goto(EXERCISE);
    const sidebar = page.getByTestId('learn-sidebar');
    await expect(sidebar).toHaveAttribute('data-collapsed', 'true');
    await page.getByRole('button', { name: 'Mở rộng mục lục' }).click();
    await expect(sidebar).toHaveAttribute('data-collapsed', 'false');
    await page.reload();
    await expect(sidebar).toHaveAttribute('data-collapsed', 'false');
  });

  test('"Nội dung bài" là link neo tới các mục của bài', async ({ page }) => {
    // Bài hiện có chưa chia mục (mỗi bài một tiêu đề), nên chèn thêm hai mục vào
    // bản tải về để thử đúng đường đi: link neo → cuộn tới đúng tiêu đề.
    await page.route('**/content/lessons/py-khoi-dong.07-lam-di-lam-lai.*.json', async (route) => {
      const response = await route.fetch();
      const bundle = (await response.json()) as { markdown: string };
      const filler = 'Chữ để trang đủ dài.\n\n'.repeat(30);
      bundle.markdown += `\n## Vòng lặp lồng nhau\n\n${filler}## Thử ngay\n\n${filler}`;
      await route.fulfill({ response, json: bundle });
    });
    await page.goto(LESSON);
    const contents = page
      .getByRole('navigation', { name: 'Nội dung bài' })
      .filter({ visible: true });
    await expect(contents).toHaveCount(1);
    const link = contents.getByRole('link', { name: 'Thử ngay' });
    await expect(link).toHaveAttribute('href', '#thu-ngay');
    await link.click();
    await expect(page.getByRole('heading', { level: 2, name: 'Thử ngay' })).toBeInViewport();
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

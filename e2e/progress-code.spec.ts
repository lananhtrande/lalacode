import { expect, test } from '@playwright/test';

/**
 * Luồng chính số 3 trong docs/testing.md: xuất mã ở máy này, mở "máy khác"
 * (context mới = IndexedDB trống), nhập mã, tiến độ khôi phục.
 */
test.describe('mã tiến độ', () => {
  test.slow();

  test('mang tiến độ sang máy khác bằng mã', async ({ page, browser }) => {
    // Giải bài + mở thêm một context nữa: nới thời gian như các test nặng khác.
    test.setTimeout(240_000);
    // Máy 1: làm xong một bài rồi lấy mã.
    await page.goto('/bai-tap/py-khoi-dong.01-xin-chao.01-in-loi-chao');
    await page.locator('.cm-content').fill('print("Xin chào, Python!")');
    await page.getByRole('button', { name: 'Nộp bài' }).click();
    await expect(page.getByText('Tuyệt vời, em làm đúng hết rồi!')).toBeVisible({
      timeout: 120_000,
    });
    // Lời khen hiện trước khi lưu xong; rời trang sớm là mất lần nộp (S0-30).
    await expect(page.locator('article[data-save-state="saved"]')).toBeAttached();

    await page.goto('/tien-do');
    const code = await page.getByTestId('progress-code').inputValue();
    expect(code.startsWith('LLC1.')).toBe(true);
    // Mã không mang code của trẻ đi theo.
    expect(code).not.toContain('Xin chào');

    // Máy 2: context mới, chưa học gì.
    const other = await browser.newContext();
    const otherPage = await other.newPage();
    await otherPage.goto('/ban-do');
    await expect(otherPage.getByTestId('progress-py-khoi-dong.01-xin-chao')).toContainText('0/4');

    await otherPage.goto('/tien-do');
    await expect(otherPage.getByTestId('no-code')).toBeVisible();
    await otherPage.getByLabel('Dán mã tiến độ').fill(code);
    await otherPage.getByRole('button', { name: 'Nhập mã' }).click();
    await expect(otherPage.getByTestId('import-done')).toBeVisible();

    await otherPage.goto('/ban-do');
    await expect(otherPage.getByTestId('progress-py-khoi-dong.01-xin-chao')).toContainText('1/4');
    await otherPage.goto('/huy-hieu');
    await expect(otherPage.getByTestId('badge-bai-dau-tien')).toContainText('Đã nhận');
    await other.close();
  });

  test('mã hỏng thì báo tiếng Việt, không làm mất tiến độ đang có', async ({ page }) => {
    await page.goto('/bai-tap/py-khoi-dong.01-xin-chao.01-in-loi-chao');
    await page.locator('.cm-content').fill('print("Xin chào, Python!")');
    await page.getByRole('button', { name: 'Nộp bài' }).click();
    await expect(page.getByText('Tuyệt vời, em làm đúng hết rồi!')).toBeVisible({
      timeout: 120_000,
    });
    // Lời khen hiện trước khi lưu xong; rời trang sớm là mất lần nộp (S0-30).
    await expect(page.locator('article[data-save-state="saved"]')).toBeAttached();

    await page.goto('/tien-do');
    await page.getByLabel('Dán mã tiến độ').fill('LLC1.day-la-ma-bay-ba');
    await page.getByRole('button', { name: 'Nhập mã' }).click();
    await expect(page.getByTestId('import-error')).toContainText('đọc không được');

    await page.goto('/ban-do');
    await expect(page.getByTestId('progress-py-khoi-dong.01-xin-chao')).toContainText('1/4');
  });

  test('xoá toàn bộ dữ liệu: hỏi lại, xoá sạch, và sạch cả sau khi tải lại', async ({ page }) => {
    test.setTimeout(240_000);

    await page.goto('/bai-tap/py-khoi-dong.01-xin-chao.01-in-loi-chao');
    await page.locator('.cm-content').fill('print("Xin chào, Python!")');
    await page.getByRole('button', { name: 'Nộp bài' }).click();
    await expect(page.getByText('Tuyệt vời, em làm đúng hết rồi!')).toBeVisible({
      timeout: 120_000,
    });
    // Lời khen hiện trước khi lưu xong; rời trang sớm là mất lần nộp (S0-30).
    await expect(page.locator('article[data-save-state="saved"]')).toBeAttached();

    await page.goto('/ban-do');
    await expect(page.getByTestId('progress-py-khoi-dong.01-xin-chao')).toContainText('1/4');

    // Bấm xoá thì phải hỏi lại trước đã.
    await page.goto('/tien-do');
    await expect(page.getByTestId('progress-code')).toBeVisible();
    await page.getByTestId('delete-start').click();
    await expect(page.getByTestId('delete-confirm')).toBeVisible();

    // Đổi ý thì không mất gì.
    await page.getByRole('button', { name: 'Thôi, giữ lại' }).click();
    await expect(page.getByTestId('delete-confirm')).toBeHidden();
    await page.goto('/ban-do');
    await expect(page.getByTestId('progress-py-khoi-dong.01-xin-chao')).toContainText('1/4');

    // Xoá thật.
    await page.goto('/tien-do');
    await page.getByTestId('delete-start').click();
    await page.getByTestId('delete-yes').click();
    await expect(page.getByTestId('delete-done')).toBeVisible();
    // Màn hình phải dọn theo ngay, không để lại mã cũ.
    await expect(page.getByTestId('progress-code')).toBeHidden();

    await page.goto('/ban-do');
    await expect(page.getByTestId('progress-py-khoi-dong.01-xin-chao')).toContainText('0/4');
    await page.goto('/huy-hieu');
    await expect(page.getByTestId('badge-count')).toContainText('0/6');

    // Tải lại trang vẫn sạch: dữ liệu mất thật, không phải chỉ ẩn đi.
    await page.reload();
    await expect(page.getByTestId('badge-count')).toContainText('0/6');
    await page.goto('/bai-tap/py-khoi-dong.01-xin-chao.01-in-loi-chao');
    await expect(page.locator('.cm-content')).toContainText('Viết code của em');
  });

  test('chưa học gì thì chưa có mã để sao chép', async ({ page }) => {
    await page.goto('/tien-do');
    await expect(page.getByTestId('no-code')).toBeVisible();
  });

  test('nhập mã không gửi gì lên mạng', async ({ page }) => {
    const external: string[] = [];
    page.on('request', (request) => {
      const url = new URL(request.url());
      const isLocal = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
      if (!isLocal || (request.postData() ?? '').includes('LLC1.')) external.push(request.url());
    });
    await page.goto('/tien-do');
    await page.getByLabel('Dán mã tiến độ').fill('LLC1.sai');
    await page.getByRole('button', { name: 'Nhập mã' }).click();
    await expect(page.getByTestId('import-error')).toBeVisible();
    expect(external).toEqual([]);
  });
});

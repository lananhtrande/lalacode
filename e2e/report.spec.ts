import { expect, test } from '@playwright/test';

/**
 * Luồng chính số 4 trong docs/testing.md: tạo link báo cáo → mở link →
 * thấy đúng số bài đã xong, và **không có request nào mang dữ liệu tiến độ**.
 */
test.describe('báo cáo cho bố mẹ', () => {
  test.slow();

  test('tạo link ở máy con, mở ở máy bố mẹ thì thấy đúng số liệu', async ({ page, browser }) => {
    test.setTimeout(240_000);

    await page.goto('/bai-tap/py-khoi-dong.01-xin-chao.01-in-loi-chao');
    await page.locator('.cm-content').fill('print("Xin chào, Python!")');
    await page.getByRole('button', { name: 'Nộp bài' }).click();
    await expect(page.getByText('Tuyệt vời, em làm đúng hết rồi!')).toBeVisible({
      timeout: 120_000,
    });

    await page.goto('/bao-cao');
    await page.getByRole('button', { name: 'Tạo link báo cáo' }).click();
    const link = await page.getByTestId('report-link').inputValue();
    expect(link).toContain('/bao-cao#');
    // Link gửi cho bố mẹ không được mang code của trẻ.
    expect(link).not.toContain('Xin chào');

    // "Máy bố mẹ": context mới, chưa học gì, chỉ có đường link.
    const parent = await browser.newContext();
    const parentPage = await parent.newPage();
    const requests: string[] = [];
    parentPage.on('request', (request) => requests.push(request.url()));

    const fragment = link.slice(link.indexOf('#'));
    await parentPage.goto(`/bao-cao${fragment}`);
    const body = parentPage.getByTestId('report-body');
    await expect(body).toBeVisible();
    await expect(body).toContainText('1');
    await expect(parentPage.getByTestId('report-lesson-py-khoi-dong.01-xin-chao')).toContainText(
      '1/4',
    );

    // Phần sau dấu # không bao giờ đi theo request nào.
    const code = fragment.slice(1);
    expect(requests.filter((url) => url.includes(code.slice(0, 40)))).toEqual([]);

    // Trang của bố mẹ không hiện ô "tạo link" (ô đó xưng hô với trẻ).
    await expect(parentPage.getByTestId('report-create')).toBeHidden();

    // Máy bố mẹ không hề có tiến độ của riêng nó.
    await parentPage.goto('/ban-do');
    await expect(parentPage.getByTestId('progress-py-khoi-dong.01-xin-chao')).toContainText('0/4');
    await parent.close();
  });

  test('link hỏng thì nói rõ, không hiện số liệu bịa', async ({ page }) => {
    await page.goto('/bao-cao#LLC1.hong-roi');
    await expect(page.getByTestId('report-bad-link')).toBeVisible();
    await expect(page.getByTestId('report-body')).toBeHidden();
  });

  test('mở trang mà không có link thì hướng dẫn, không báo lỗi', async ({ page }) => {
    await page.goto('/bao-cao');
    await expect(page.getByTestId('report-empty')).toBeVisible();
    await expect(page.getByTestId('report-no-progress')).toBeVisible();
  });
});

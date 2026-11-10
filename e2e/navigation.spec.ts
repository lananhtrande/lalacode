import { expect, test, type Page } from '@playwright/test';

const LESSON_01 = 'py-khoi-dong.01-xin-chao';
const LESSON_02 = 'py-khoi-dong.02-cai-hop-ten-la-bien';
const LAST_LESSON = 'py-khoi-dong.20-du-an-cuoi';

/** Ghi thẳng vào editor rồi kiểm lại (xem exercise.spec.ts về lý do không gõ phím). */
async function setCode(page: Page, code: string): Promise<void> {
  const editor = page.locator('.cm-content');
  await editor.waitFor();
  await editor.fill(code);
  await expect(editor).toHaveText(code.replace(/\n$/, ''), { useInnerText: true });
}

async function submitAndPass(page: Page, code: string): Promise<void> {
  await expect(page.getByTestId('python-status')).toHaveText('Python sẵn sàng', {
    timeout: 120_000,
  });
  await setCode(page, code);
  await page.getByRole('button', { name: 'Nộp bài' }).click();
  await expect(page.getByText('Tuyệt vời, em làm đúng hết rồi!')).toBeVisible({
    timeout: 120_000,
  });
}

/**
 * S0-36: đi tiếp từ bài tập sang bài tập, từ bài tập cuối sang bài học sau,
 * và hết khoá thì về trang khoá. Chạy trên Chromium (1280) và WebKit (iPhone 390, iPad).
 */
test.describe('sang bài tiếp theo', () => {
  test.slow();

  test('làm đúng bài 1 → nút chính "Bài tập tiếp theo" (có focus) → tới bài 2', async ({
    page,
  }) => {
    await page.goto(`/bai-tap/${LESSON_01}.01-in-loi-chao`);
    await submitAndPass(page, 'print("Xin chào, Python!")');

    const cta = page.getByTestId('next-step').getByRole('link', { name: /Bài tập tiếp theo/ });
    await expect(cta).toBeFocused();
    await cta.click();

    await expect(page).toHaveURL(new RegExp(`/bai-tap/${LESSON_01}\\.02-in-hai-dong$`));
    await expect(page.getByRole('heading', { name: 'Hai dòng chữ' })).toBeVisible();
    // Bài mới mở sạch: không còn kết quả chấm của bài trước.
    await expect(page.getByText('Tuyệt vời, em làm đúng hết rồi!')).toBeHidden();
  });

  test('thanh bài trước/tiếp luôn có, là link thật, đủ lớn cho ngón tay', async ({ page }) => {
    await page.goto(`/bai-tap/${LESSON_01}.02-in-hai-dong`);
    const nav = page.getByRole('navigation', { name: 'Chuyển bài' });
    const previous = nav.getByRole('link', { name: 'Bài tập trước: In lời chào' });
    const next = nav.getByRole('link', { name: 'Bài tập tiếp: Sửa lỗi giúp bạn' });
    await expect(previous).toHaveAttribute('href', `/bai-tap/${LESSON_01}.01-in-loi-chao`);
    await expect(next).toHaveAttribute('href', `/bai-tap/${LESSON_01}.03-sua-loi-cua-ban`);
    for (const link of [previous, next]) {
      expect((await link.boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(44);
    }
  });

  test('bài tập cuối của bài 01 → nút dẫn tới bài học 02', async ({ page }) => {
    await page.goto(`/bai-tap/${LESSON_01}.04-cay-thong-sao`);
    await expect(
      page
        .getByRole('navigation', { name: 'Chuyển bài' })
        .getByRole('link', { name: 'Bài học tiếp: Cái hộp tên là biến' }),
    ).toHaveAttribute('href', `/bai-hoc/${LESSON_02}`);

    await submitAndPass(page, 'print("  *")\nprint(" ***")\nprint("*****")\n');
    // Mới làm bài cuối, chưa làm ba bài đầu: không khen "xong bài học".
    const card = page.getByTestId('next-step');
    await expect(card).toContainText('vẫn còn bài tập chưa xong');
    await card.getByRole('link', { name: /Bài học tiếp theo/ }).click();
    await expect(page).toHaveURL(new RegExp(`/bai-hoc/${LESSON_02}$`));
    await expect(
      page.getByRole('heading', { name: 'Cái hộp tên là biến', level: 1 }),
    ).toBeVisible();
  });

  test('trang bài học cuối khoá → "Về trang khoá học"', async ({ page }) => {
    await page.goto(`/bai-hoc/${LAST_LESSON}`);
    const nav = page.getByRole('navigation', { name: 'Chuyển bài' });
    await expect(nav.getByRole('link', { name: 'Về trang khoá học' })).toHaveAttribute(
      'href',
      '/khoa-hoc/py-khoi-dong',
    );
    await expect(nav.getByRole('link', { name: /^Bài học trước:/ })).toBeVisible();
  });
});

import { expect, test } from '@playwright/test';

/** S0-40: kho luyện tập — lọc trên URL, "Bài ngẫu nhiên", "Để dành". */
test.describe('kho luyện tập', () => {
  test('lọc "Dễ" rồi "Bài ngẫu nhiên" mở một bài tập dễ', async ({ page }) => {
    await page.goto('/luyen-tap');
    await expect(page.getByTestId('practice-count')).toContainText('81 bài tập');
    // Màn hẹp: bộ lọc nằm sau nút "Bộ lọc".
    const toggle = page.getByRole('button', { name: 'Bộ lọc' });
    if (await toggle.isVisible()) await toggle.click();
    // Ô lọc đọc trạng thái từ URL, mà URL đổi không đồng bộ: bấm rồi đợi, đừng `check()`.
    const easy = page.getByRole('checkbox', { name: /^Dễ/ }).filter({ visible: true });
    await easy.click();
    await expect(easy).toBeChecked();
    await expect(page).toHaveURL(/\?do=de$/);
    const count = Number(
      ((await page.getByTestId('practice-count').textContent()) ?? '').replace(/\D/g, ''),
    );
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThan(81);

    await page.getByRole('button', { name: 'Bài ngẫu nhiên' }).click();
    await expect(page).toHaveURL(/\/bai-tap\/py-khoi-dong\./);
    await expect(page.getByTestId('difficulty')).toHaveText(/Dễ/);
  });

  test('"Để dành" nhớ sau khi tải lại, lọc được "Chỉ bài để dành"', async ({ page }) => {
    await page.goto('/luyen-tap');
    const row = page.getByTestId('practice-py-khoi-dong.01-xin-chao.04-cay-thong-sao');
    const save = row.getByRole('button', { name: /Để dành/ });
    await save.click();
    await expect(save).toHaveAttribute('aria-pressed', 'true');
    await page.reload();
    await expect(save).toHaveAttribute('aria-pressed', 'true');

    await page.goto('/luyen-tap?de-danh=1');
    await expect(page.getByTestId('practice-count')).toContainText('1 bài tập');
  });
});

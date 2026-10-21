import { expect, test } from '@playwright/test';

/**
 * Pyodide thật, không mock (docs/testing.md). Nạp WASM lần đầu khá lâu nên
 * mỗi test được nới thời gian.
 */
test.describe('runner Pyodide', () => {
  test.slow();

  test('nạp được Pyodide tự host và báo đúng phiên bản Python', async ({ page }) => {
    await page.goto('/thu-runner');
    await page.getByRole('button', { name: 'Nạp Pyodide' }).click();
    const status = page.getByTestId('runner-status');
    await expect(status).toContainText('sẵn sàng', { timeout: 120_000 });
    await expect(status).toContainText(/Python 3\.\d+/);
  });

  test('chạy code in ra màn hình', async ({ page }) => {
    await page.goto('/thu-runner');
    await page.getByRole('button', { name: 'Chạy' }).click();
    await expect(page.getByTestId('runner-output')).toHaveText('Xin chào, Python!\n', {
      timeout: 120_000,
    });
  });

  test('input() đọc dữ liệu stdin dựng sẵn', async ({ page }) => {
    await page.goto('/thu-runner');
    await page.getByLabel('Code Python').fill('ten = input()\nprint(f"Chào {ten}")');
    await page.getByLabel('Dữ liệu stdin').fill('Lan');
    await page.getByRole('button', { name: 'Chạy' }).click();
    await expect(page.getByTestId('runner-output')).toHaveText('Chào Lan\n', { timeout: 120_000 });
  });

  test('code sai thì báo lỗi Python, trang vẫn dùng được', async ({ page }) => {
    await page.goto('/thu-runner');
    await page.getByLabel('Code Python').fill('print(ten_chua_co)');
    await page.getByRole('button', { name: 'Chạy' }).click();
    await expect(page.getByTestId('runner-status')).toContainText('lỗi (python)', {
      timeout: 120_000,
    });
    await expect(page.getByTestId('runner-output')).toContainText('NameError');

    // Chạy lại được sau lỗi: worker vẫn sống.
    await page.getByLabel('Code Python').fill('print(1 + 1)');
    await page.getByRole('button', { name: 'Chạy' }).click();
    await expect(page.getByTestId('runner-output')).toHaveText('2\n', { timeout: 120_000 });
  });

  test('vòng lặp vô hạn: hết giờ, báo tiếng Việt, rồi chạy lại được', async ({ page }) => {
    await page.goto('/thu-runner');
    // Nạp sẵn Pyodide để đồng hồ đo đúng lúc chạy, không tính lúc nạp.
    await page.getByRole('button', { name: 'Nạp Pyodide' }).click();
    await expect(page.getByTestId('runner-status')).toContainText('sẵn sàng', { timeout: 120_000 });

    await page.getByLabel('Code Python').fill('while True:\n    pass');
    await page.getByLabel('Thời gian tối đa').fill('2000');
    await page.getByRole('button', { name: 'Chạy' }).click();

    await expect(page.getByTestId('runner-status')).toContainText('lỗi (timeout)', {
      timeout: 30_000,
    });
    await expect(page.getByTestId('runner-output')).toContainText('vòng lặp');

    // Worker đã bị giết và dựng lại: bài tiếp theo vẫn chạy.
    await page.getByLabel('Code Python').fill('print("vẫn chạy được")');
    await page.getByRole('button', { name: 'Chạy' }).click();
    await expect(page.getByTestId('runner-output')).toHaveText('vẫn chạy được\n', {
      timeout: 120_000,
    });
  });

  test('Pyodide tải từ chính domain của mình, không qua CDN ngoài', async ({ page }) => {
    const externalRequests: string[] = [];
    page.on('request', (request) => {
      const url = new URL(request.url());
      if (url.hostname !== 'localhost' && url.hostname !== '127.0.0.1') {
        externalRequests.push(request.url());
      }
    });
    await page.goto('/thu-runner');
    await page.getByRole('button', { name: 'Nạp Pyodide' }).click();
    await expect(page.getByTestId('runner-status')).toContainText('sẵn sàng', { timeout: 120_000 });
    expect(externalRequests).toEqual([]);
  });
});

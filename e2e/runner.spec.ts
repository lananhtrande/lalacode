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

  test('chấm bài bằng grader.py: lời giải đúng thì đạt hết', async ({ page }) => {
    await page.goto('/thu-runner');
    await page.getByRole('button', { name: 'Chấm' }).click();
    await expect(page.getByTestId('runner-status')).toContainText('đạt hết', { timeout: 120_000 });
    await expect(page.getByTestId('runner-output')).toContainText('test 1 (stdout_equals): đạt');
  });

  test('chấm bài: code sai thì chưa đạt, hiện câu tiếng Việt của bài', async ({ page }) => {
    await page.goto('/thu-runner');
    await page.getByLabel('Code Python').fill('print("Chào")');
    await page.getByRole('button', { name: 'Chấm' }).click();
    await expect(page.getByTestId('runner-status')).toContainText('chưa đạt', { timeout: 120_000 });
    const output = page.getByTestId('runner-output');
    await expect(output).toContainText('Thử lại nhé em.');
    await expect(output).toContainText('Xin chào, Python!');
  });

  test('chấm đủ 5 loại test trong một lần, như grader.py chạy bằng CPython', async ({ page }) => {
    await page.goto('/thu-runner');
    await page
      .getByLabel('Code Python')
      .fill('ten = input()\nprint(f"Chào {ten}")\ndiem = 10\ndef cong(a, b):\n    return a + b');
    await page.getByLabel('Dữ liệu stdin').fill('Lan');
    await page.getByLabel('Test JSON').fill(
      JSON.stringify([
        { type: 'stdout_equals', expected: 'Chào Lan\n', stdin: 'Lan\n', message: 'm1' },
        { type: 'stdout_contains', expected: 'Chào', stdin: 'Lan\n', message: 'm2' },
        { type: 'variable_equals', name: 'diem', expected: 10, stdin: 'Lan\n', message: 'm3' },
        {
          type: 'function_returns',
          name: 'cong',
          args: [2, 3],
          expected: 5,
          stdin: 'Lan\n',
          message: 'm4',
        },
        { type: 'python_assert', code: 'assert diem == 10', stdin: 'Lan\n', message: 'm5' },
      ]),
    );
    await page.getByRole('button', { name: 'Chấm' }).click();
    await expect(page.getByTestId('runner-status')).toContainText('đạt hết', { timeout: 120_000 });
    await expect(page.getByTestId('runner-output')).toContainText('test 5 (python_assert): đạt');
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

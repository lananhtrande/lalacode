import { expect, test } from '@playwright/test';
import { openCodeTab, openPart, setCode } from './support/editor';

const EXERCISE = '/bai-tap/py-khoi-dong.01-xin-chao.01-in-loi-chao';

/**
 * Luồng chính số 1 trong docs/testing.md: mở bài tập → làm sai → thấy báo lỗi
 * tiếng Việt → sửa đúng → đạt hết. Chạy Pyodide thật nên để chế độ chậm.
 */
test.describe('màn bài tập', () => {
  test.slow();

  test('mở được bài tập: có đề bài, ô code và nút', async ({ page }) => {
    await page.goto(EXERCISE);
    await expect(page.getByRole('heading', { name: 'In lời chào' })).toBeVisible();
    await expect(page.getByText(/Viết chương trình in ra dòng chữ/)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Chạy thử' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Nộp bài' })).toBeVisible();
    await expect(page.getByTestId('python-status')).toHaveText('Python sẵn sàng', {
      timeout: 120_000,
    });
  });

  test('làm sai rồi sửa đúng: báo lỗi tiếng Việt rồi đạt hết', async ({ page }) => {
    await page.goto(EXERCISE);
    // Lần 1: in thiếu chữ → chưa đạt, hiện câu nhắc của người viết bài.
    await setCode(page, 'print("Xin chào")');
    await page.getByRole('button', { name: 'Nộp bài' }).click();
    await expect(page.getByText('Gần được rồi. Em xem lại phần chưa đạt nhé.')).toBeVisible({
      timeout: 120_000,
    });
    await expect(page.getByText(/Test 1: Chưa đạt/)).toBeVisible();

    // Lần 2: sửa cho đúng → đạt hết.
    await setCode(page, 'print("Xin chào, Python!")');
    await page.getByRole('button', { name: 'Nộp bài' }).click();
    await expect(page.getByText('Tuyệt vời, em làm đúng hết rồi!')).toBeVisible({
      timeout: 120_000,
    });
    await expect(page.getByText(/Test 1: Đạt/)).toBeVisible();
  });

  test('chạy thử hiện output, code lỗi hiện tiếng Việt kèm số dòng', async ({ page }) => {
    await page.goto(EXERCISE);
    await setCode(page, 'print("thử xem")');
    await page.getByRole('button', { name: 'Chạy thử' }).click();
    await expect(page.getByTestId('exercise-output')).toHaveText('thử xem\n', { timeout: 120_000 });

    await setCode(page, 'print(ten_chua_co)');
    await page.getByRole('button', { name: 'Chạy thử' }).click();
    const panel = page.getByTestId('exercise-error');
    await expect(panel).toContainText('Python chưa biết tên', { timeout: 120_000 });
    await expect(panel).toContainText('Dòng 1');
  });

  test('gợi ý mở dần, không lộ hết một lúc', async ({ page }) => {
    // Chưa deploy Lambda ở môi trường test: /api/hint hỏng → rơi về gợi ý viết sẵn.
    await page.goto(EXERCISE);
    await expect(page.getByTestId('hint-privacy')).toContainText('đừng viết tên thật');

    await page.getByTestId('hint-ask').click();
    await expect(page.getByTestId('hint-list')).toContainText('Lệnh để in ra màn hình');
    await expect(page.getByTestId('hint-list')).not.toContainText('Chữ cần in phải nằm');

    await page.getByTestId('hint-ask').click();
    await expect(page.getByTestId('hint-list')).toContainText('Chữ cần in phải nằm');
  });

  test('trợ lý trả lời được thì hiện câu của trợ lý, vẫn kèm gợi ý viết sẵn', async ({ page }) => {
    await page.route('**/api/hint', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ hint: 'Em thử nghĩ xem lệnh nào dùng để in ra màn hình nhé.' }),
      }),
    );
    await page.goto(EXERCISE);
    await page.getByTestId('hint-ask').click();
    await expect(page.getByTestId('ai-hints')).toContainText('lệnh nào dùng để in ra màn hình');
  });

  test('hết lượt hỏi thì nói rõ và vẫn cho gợi ý viết sẵn', async ({ page }) => {
    await page.route('**/api/hint', (route) =>
      route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'qua-nhieu-luot' }),
      }),
    );
    await page.goto(EXERCISE);
    await page.getByTestId('hint-ask').click();
    await expect(page.getByTestId('hint-fallback')).toContainText('đủ số lần hôm nay');
    await expect(page.getByTestId('hint-list')).toContainText('Lệnh để in ra màn hình');
  });

  test('code của trẻ chỉ rời máy khi em tự bấm hỏi trợ giúp', async ({ page }) => {
    const hintCalls: string[] = [];
    await page.route('**/api/hint', (route) => {
      hintCalls.push(route.request().postData() ?? '');
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ hint: 'gợi ý' }),
      });
    });

    await page.goto(EXERCISE);
    await setCode(page, 'print("thử xem")');
    await page.getByRole('button', { name: 'Chạy thử' }).click();
    await expect(page.getByTestId('exercise-output')).toHaveText('thử xem\n', { timeout: 120_000 });
    await page.getByRole('button', { name: 'Nộp bài' }).click();
    await expect(page.getByText(/Test 1:/)).toBeVisible({ timeout: 120_000 });
    // Chạy và nộp bài: tuyệt đối không gọi tới trợ lý.
    expect(hintCalls).toEqual([]);

    // Gợi ý nằm cuối cột đề bài (màn hẹp: tab "Đề").
    await openPart(page, 'Đề');
    await page.getByTestId('hint-ask').click();
    await expect(page.getByTestId('ai-hints')).toBeVisible();
    expect(hintCalls).toHaveLength(1);
    const sent = JSON.parse(hintCalls[0] ?? '{}') as { code?: string; token?: string };
    expect(sent.code).toBe('print("thử xem")');
    // Token ẩn danh đi kèm để đếm lượt; server chỉ lưu bản băm của nó.
    expect(sent.token).toMatch(/^[0-9a-f-]{36}$/);
  });

  test('vào trang khoá rồi mở bài học, bài tập đều đi được bằng chuột', async ({ page }) => {
    await page.goto('/khoa-hoc/py-khoi-dong');
    await page.getByRole('link', { name: /Xin chào, Python!/ }).click();
    await expect(page).toHaveURL(/\/bai-hoc\/py-khoi-dong\.01-xin-chao$/);
  });

  test('đóng rồi mở lại: code đang làm dở vẫn còn (IndexedDB)', async ({ page }) => {
    await page.goto(EXERCISE);
    await setCode(page, 'print("em quay lại sau")');
    // Đợi qua nhịp lưu nháp rồi mới tải lại trang.
    await expect(page.getByTestId('python-status')).toHaveText('Python sẵn sàng', {
      timeout: 120_000,
    });
    await page.waitForTimeout(1500);

    await page.reload();
    await openCodeTab(page);
    await expect(page.locator('.cm-content')).toHaveText('print("em quay lại sau")', {
      useInnerText: true,
    });
    await expect(page.getByTestId('restored-draft')).toBeVisible();

    // "Làm lại từ đầu" hỏi lại ngay trong trang, rồi đưa về code khởi đầu của bài.
    await page.getByRole('button', { name: 'Làm lại từ đầu' }).click();
    await page.getByTestId('reset-confirm').getByRole('button', { name: 'Làm lại' }).click();
    await expect(page.locator('.cm-content')).toContainText('Viết code của em');
  });

  test('tiến độ nằm trên máy: không có request nào mang code của trẻ đi', async ({ page }) => {
    const leaked: string[] = [];
    page.on('request', (request) => {
      const body = request.postData() ?? '';
      if (body.includes('em quay lại sau') || request.url().includes('em quay')) {
        leaked.push(request.url());
      }
    });
    await page.goto(EXERCISE);
    await setCode(page, 'print("em quay lại sau")');
    await page.getByRole('button', { name: 'Nộp bài' }).click();
    await expect(page.getByText(/Test 1:/)).toBeVisible({ timeout: 120_000 });
    expect(leaked).toEqual([]);
  });

  test('màn bài tập không bị cuộn ngang trên điện thoại', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto(EXERCISE);
    await expect(page.getByRole('heading', { name: 'In lời chào' })).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

/**
 * Bố cục chia đôi (S0-39): đề bài bên trái; editor trên, panel kết quả dưới ở
 * bên phải. Dưới 1024px là ba tab Đề · Code · Kết quả.
 */
test.describe('bố cục màn bài tập', () => {
  test.slow();

  test('màn rộng: đề bài trái, editor và kết quả bên phải, tất cả trong khung nhìn', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(EXERCISE);
    const brief = page.getByRole('heading', { name: 'In lời chào', level: 1 });
    const editor = page.locator('.cm-editor');
    const output = page.getByTestId('exercise-output');
    for (const part of [brief, editor, output]) await expect(part).toBeInViewport();
    await expect(page.getByRole('button', { name: 'Nộp bài' })).toBeInViewport();

    const [briefBox, editorBox, outputBox] = await Promise.all(
      [brief, editor, output].map((part) => part.boundingBox()),
    );
    expect(editorBox!.x).toBeGreaterThanOrEqual(briefBox!.x + briefBox!.width);
    expect(outputBox!.y).toBeGreaterThanOrEqual(editorBox!.y + editorBox!.height);
  });

  test('màn rộng: thanh kéo đổi chiều cao panel kết quả bằng bàn phím', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(EXERCISE);
    const resizer = page.getByRole('separator', { name: /đổi chiều cao/ });
    const before = Number(await resizer.getAttribute('aria-valuenow'));
    await resizer.focus();
    await page.keyboard.press('ArrowUp');
    await expect(resizer).toHaveAttribute('aria-valuenow', String(before + 32));
  });

  test('điện thoại: tab Đề · Code · Kết quả; nộp bài xong tự sang Kết quả › Kiểm tra', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(EXERCISE);
    const parts = page.getByRole('tablist', { name: 'Phần của bài tập' });
    await expect(parts.getByRole('tab', { name: 'Đề' })).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByText(/Viết chương trình in ra dòng chữ/)).toBeVisible();
    await expect(page.locator('.cm-editor')).toBeHidden();

    await setCode(page, 'print("Xin chào, Python!")');
    await expect(page.getByTestId('python-status')).toHaveText('Python sẵn sàng', {
      timeout: 120_000,
    });
    await page.getByRole('button', { name: 'Nộp bài' }).click();
    await expect(parts.getByRole('tab', { name: 'Kết quả' })).toHaveAttribute(
      'aria-selected',
      'true',
      { timeout: 120_000 },
    );
    await expect(page.getByRole('tab', { name: 'Kiểm tra (1)' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await expect(page.getByText('Tuyệt vời, em làm đúng hết rồi!')).toBeInViewport();
  });

  test('điện thoại: bấm Chạy thử thì khu kết quả tự vào tầm mắt', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(EXERCISE);
    await setCode(page, 'print("Xin chào, Python!")');
    // Thanh nút dính đáy: luôn bấm được mà không phải cuộn.
    const run = page.getByRole('button', { name: 'Chạy thử' });
    await expect(run).toBeInViewport();
    await run.click();
    const output = page.getByTestId('exercise-output');
    await expect(output).toContainText('Xin chào, Python!', { timeout: 120_000 });
    await expect(output).toBeInViewport();
  });

  test('bài có rùa: hình vẽ hiện ở khu kết quả', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/bai-tap/py-khoi-dong.03-rua-ve-hinh.02-goc-vuong');
    await setCode(page, 'import turtle\nturtle.forward(100)\nturtle.left(90)\nturtle.forward(100)');
    await page.getByRole('button', { name: 'Chạy thử' }).click();
    const canvas = page.getByTestId('turtle-canvas');
    await expect(canvas).toBeInViewport();
    // Có điểm ảnh được vẽ (không chỉ là khung trống).
    await expect
      .poll(
        () =>
          canvas.evaluate((element: HTMLCanvasElement) => {
            const context = element.getContext('2d');
            if (!context) return 0;
            const { data } = context.getImageData(0, 0, element.width, element.height);
            let painted = 0;
            for (let index = 3; index < data.length; index += 4)
              if ((data[index] ?? 0) > 0) painted++;
            return painted;
          }),
        { timeout: 120_000 },
      )
      .toBeGreaterThan(100);
  });
});

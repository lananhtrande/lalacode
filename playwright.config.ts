import { defineConfig, devices } from '@playwright/test';

/**
 * Mặc định chạy trên dev server cho nhanh. `PLAYWRIGHT_PREVIEW=1` thì build rồi
 * chạy trên **bản phát hành thật** — CI dùng chế độ này trước khi deploy.
 */
const preview = Boolean(process.env['PLAYWRIGHT_PREVIEW']);
const PORT = preview ? 4173 : 5173;
const baseURL = `http://localhost:${PORT}`;

// Trẻ dùng điện thoại/tablet là chính → luôn chạy cả WebKit mobile.
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  ...(process.env['CI'] ? { workers: 1 } : {}),
  reporter: process.env['CI'] ? [['github'], ['html', { open: 'never' }]] : [['list']],
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'iphone', use: { ...devices['iPhone 13'] } },
    { name: 'ipad', use: { ...devices['iPad (gen 7)'] } },
  ],
  webServer: {
    command: preview
      ? `npm run build -w @lalacode/web && npm run preview -w @lalacode/web -- --port ${PORT} --strictPort`
      : `npm run dev -w @lalacode/web -- --port ${PORT} --strictPort`,
    url: baseURL,
    reuseExistingServer: !process.env['CI'],
    timeout: 180_000,
  },
});

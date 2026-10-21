import { defineConfig } from 'vitest/config';

// Mỗi workspace tự khai báo cấu hình test của mình (apps/web/vitest.config.ts, ...).
export default defineConfig({
  test: {
    projects: ['apps/*', 'packages/*', 'services/*', 'scripts'],
  },
});

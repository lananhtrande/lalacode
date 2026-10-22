import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'ai-hint',
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});

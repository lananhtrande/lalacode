import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import eslintConfigPrettier from 'eslint-config-prettier';

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/coverage/**',
      'playwright-report/**',
      'test-results/**',
      '.claude/**',
    ],
  },
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    // Lint có kiểu cho TypeScript: bắt được lỗi như promise bị bỏ quên.
    files: ['**/*.{ts,tsx}'],
    extends: [tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
  },
  {
    files: ['apps/web/src/**/*.{ts,tsx}'],
    extends: [reactHooks.configs.flat.recommended],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: { globals: globals.node },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      // Tiền tố `_` nghĩa là "cố tình bỏ", ví dụ khi tách bớt một trường khỏi object.
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      // Giai đoạn 0: không để console.log gỡ lỗi sót lại trong sản phẩm.
      'no-console': ['error', { allow: ['warn', 'error'] }],
      eqeqeq: ['error', 'always'],
    },
  },
  {
    // Script và test chạy ở terminal: in ra màn hình là chuyện bình thường.
    files: ['scripts/**', 'e2e/**', '**/*.config.{ts,js,mjs}', '**/*.test.{ts,tsx}'],
    rules: { 'no-console': 'off' },
  },
  eslintConfigPrettier,
);

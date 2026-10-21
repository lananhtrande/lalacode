import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Chạy Vitest không bật `globals`, nên phải tự dọn DOM sau mỗi test.
afterEach(cleanup);

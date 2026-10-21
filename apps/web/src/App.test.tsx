import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from './App';
import { vi } from './shared/i18n/vi';

describe('App', () => {
  it('hiển thị tên và khẩu hiệu bằng tiếng Việt', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: vi.app.name })).toBeInTheDocument();
    expect(screen.getByText(vi.app.tagline)).toBeInTheDocument();
  });
});

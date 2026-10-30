import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { Send } from 'lucide-react';
import { Button } from './Button';
import { ButtonLink } from './ButtonLink';
import { IconButton } from './IconButton';
import type { ButtonVariant } from './button-classes';

const VARIANTS: ButtonVariant[] = ['primary', 'dark', 'outline', 'ghost'];

describe('Button', () => {
  it.each(VARIANTS)('biến thể %s có tên truy cập và cao tối thiểu 44px', (variant) => {
    render(
      <Button variant={variant} icon={<Send aria-hidden />}>
        Nộp bài
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Nộp bài' });
    expect(button.className).toContain('min-h-tap');
    expect(button.className).toContain('rounded-full');
  });

  it('mặc định là type="button" để không vô tình gửi form', () => {
    render(<Button>Chạy thử</Button>);
    expect(screen.getByRole('button', { name: 'Chạy thử' })).toHaveAttribute('type', 'button');
  });

  it('mỗi biến thể một kiểu riêng', () => {
    const classes = VARIANTS.map((variant) => {
      const { unmount } = render(<Button variant={variant}>{variant}</Button>);
      const className = screen.getByRole('button', { name: variant }).className;
      unmount();
      return className;
    });
    expect(new Set(classes).size).toBe(VARIANTS.length);
  });
});

describe('ButtonLink', () => {
  it('là một liên kết thật nhưng trông như nút', () => {
    const router = createMemoryRouter([
      { path: '/', element: <ButtonLink to="/ban-do">Vào bản đồ</ButtonLink> },
    ]);
    render(<RouterProvider router={router} />);
    const link = screen.getByRole('link', { name: 'Vào bản đồ' });
    expect(link).toHaveAttribute('href', '/ban-do');
    expect(link.className).toContain('min-h-tap');
  });
});

describe('IconButton', () => {
  it('nút chỉ có icon vẫn có tên truy cập và đủ 44×44px', () => {
    render(<IconButton label="Mở menu" icon={<Send aria-hidden />} />);
    const button = screen.getByRole('button', { name: 'Mở menu' });
    expect(button.className).toContain('size-tap');
  });
});

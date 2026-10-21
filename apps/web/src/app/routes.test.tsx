import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router';
import { routes } from './routes';
import { vi as strings } from '../shared/i18n/vi';

function renderAt(path: string) {
  return render(<RouterProvider router={createMemoryRouter(routes, { initialEntries: [path] })} />);
}

describe('router', () => {
  it('trang chủ hiện khẩu hiệu và nút bắt đầu học', async () => {
    renderAt('/');
    expect(
      await screen.findByRole('heading', { name: strings.home.heroTitle }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: strings.home.startLearning })).toHaveAttribute(
      'href',
      '/ban-do',
    );
  });

  it('mọi trang đều có khung chung: liên kết bỏ qua, menu, chân trang', async () => {
    renderAt('/');
    expect(
      await screen.findByRole('link', { name: strings.nav.skipToContent }),
    ).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: strings.nav.menu })).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toHaveTextContent(strings.footer.privacy);
  });

  it.each([
    ['/ban-do', strings.pages.map],
    ['/huy-hieu', strings.pages.badges],
    ['/bao-cao', strings.pages.report],
    ['/gioi-thieu', strings.pages.about],
    ['/bai-hoc/01-xin-chao', strings.pages.lesson],
  ])('đường dẫn %s mở đúng trang "%s"', async (path, title) => {
    renderAt(path);
    expect(await screen.findByRole('heading', { name: title })).toBeInTheDocument();
  });

  it('đường dẫn bài tập mở màn bài tập (màn này có test riêng)', async () => {
    renderAt('/bai-tap/py-khoi-dong.01-xin-chao.01-in-loi-chao');
    expect(await screen.findByRole('status')).toHaveTextContent(strings.exercise.loading);
  });

  it('đường dẫn lạ thì hiện trang không tìm thấy, vẫn giữ khung chung', async () => {
    renderAt('/khong-co-trang-nay');
    expect(
      await screen.findByRole('heading', { name: strings.notFound.title }),
    ).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: strings.nav.menu })).toBeInTheDocument();
  });
});

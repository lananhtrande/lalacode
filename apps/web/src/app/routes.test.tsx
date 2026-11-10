import { describe, expect, it } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
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
      '/khoa-hoc',
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
    ['/khoa-hoc', strings.catalog.title],
    ['/luyen-tap', strings.pages.practice],
    ['/huy-hieu', strings.pages.badges],
    ['/bao-cao', strings.pages.report],
    ['/gioi-thieu', strings.about.title],
    ['/quyen-rieng-tu', strings.privacy.title],
    // Không có bundle nội dung trong jsdom nên màn bài học hiện đúng câu
    // "không tìm thấy" — điều cần kiểm ở đây là route mở được và còn khung chung.
    ['/bai-hoc/01-xin-chao', strings.lesson.notFound],
  ])('đường dẫn %s mở đúng trang "%s"', async (path, title) => {
    renderAt(path);
    expect(await screen.findByRole('heading', { name: title })).toBeInTheDocument();
  });

  it('/ban-do cũ chuyển sang trang khoá, thay chỗ trong lịch sử (không kẹt nút Back)', async () => {
    const router = createMemoryRouter(routes, {
      initialEntries: ['/', '/ban-do'],
      initialIndex: 1,
    });
    render(<RouterProvider router={router} />);
    await waitFor(() => expect(router.state.location.pathname).toBe('/khoa-hoc/py-khoi-dong'));
    expect(router.state.historyAction).toBe('REPLACE');
  });

  it('menu có Khoá học và Luyện tập, không còn Bản đồ', async () => {
    renderAt('/');
    const menu = await screen.findByRole('navigation', { name: strings.nav.menu });
    expect(within(menu).getByRole('link', { name: strings.nav.courses })).toHaveAttribute(
      'href',
      '/khoa-hoc',
    );
    expect(within(menu).getByRole('link', { name: strings.nav.practice })).toHaveAttribute(
      'href',
      '/luyen-tap',
    );
    expect(within(menu).queryByRole('link', { name: 'Bản đồ' })).toBeNull();
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

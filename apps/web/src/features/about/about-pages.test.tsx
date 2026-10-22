import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router';
import { AboutPage } from './AboutPage';
import { PrivacyPage } from './PrivacyPage';
import { vi as strings } from '../../shared/i18n/vi';

function renderPage(Component: () => React.ReactElement) {
  return render(
    <RouterProvider router={createMemoryRouter([{ path: '/', Component }])} />,
  );
}

describe('trang giới thiệu cho phụ huynh', () => {
  it('nói rõ dự án đang thử nghiệm, kể cả chỗ còn thiếu', () => {
    renderPage(AboutPage);
    expect(screen.getByRole('heading', { name: strings.about.title })).toBeInTheDocument();
    // Phần "nói thật" dễ bị cắt khi ai đó dọn trang cho gọn — chốt lại ở đây.
    expect(screen.getByText(strings.about.stageHonest)).toBeInTheDocument();
  });

  it('dẫn sang trang quyền riêng tư và trang báo cáo', () => {
    renderPage(AboutPage);
    expect(screen.getByRole('link', { name: strings.about.privacyLink })).toHaveAttribute(
      'href',
      '/quyen-rieng-tu',
    );
    expect(screen.getByRole('link', { name: strings.about.parentsLink })).toHaveAttribute(
      'href',
      '/bao-cao',
    );
  });
});

describe('trang quyền riêng tư', () => {
  it('liệt kê đủ từng loại dữ liệu và nơi nó nằm', () => {
    renderPage(PrivacyPage);
    expect(screen.getByRole('heading', { name: strings.privacy.title })).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(
      strings.privacy.rows.length + strings.privacy.notDoing.length + strings.privacy.reportLimits.length,
    );
    for (const row of strings.privacy.rows) {
      expect(screen.getByText(row.what)).toBeInTheDocument();
    }
  });

  /**
   * Hai giới hạn này là chỗ docs/privacy.md bắt phải nói thẳng. Nếu một ngày
   * có người rút gọn trang cho "đỡ đáng sợ", test này phải đỏ.
   */
  it('giữ nguyên hai lời thú nhận bắt buộc', () => {
    renderPage(PrivacyPage);
    expect(screen.getByTestId('privacy-filter-limit')).toHaveTextContent('vẫn có thể lọt qua');
    expect(screen.getByTestId('privacy-report-limits')).toHaveTextContent('Mã không có chữ ký');
  });

  it('nói code chỉ rời máy khi trẻ tự bấm hỏi trợ giúp, và có đường tới nút xoá', () => {
    renderPage(PrivacyPage);
    expect(screen.getByText(strings.privacy.aiBody)).toHaveTextContent('chỉ khi chính con bấm nút');
    expect(screen.getByRole('link', { name: strings.privacy.deleteLink })).toHaveAttribute(
      'href',
      '/tien-do',
    );
  });
});

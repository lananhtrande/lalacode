import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LessonVideo } from './LessonVideo';

/**
 * Luật ở docs/privacy.md: không có request nào ra ngoài domain của mình trước
 * khi trẻ chủ động bấm. Test này giữ đúng điều đó.
 */
describe('video bài học', () => {
  const youtube = { provider: 'youtube-nocookie', videoId: 'abcdefghijk', durationSec: 180 } as const;

  it('chưa bấm thì không có khung nhúng nào, chỉ có nút', () => {
    render(<LessonVideo video={youtube} title="Rùa vẽ hình" />);
    expect(screen.queryByTestId('lesson-video')).not.toBeInTheDocument();
    expect(document.querySelector('iframe')).toBeNull();
    expect(screen.getByTestId('lesson-video-play')).toHaveTextContent('Xem video · 3 phút');
  });

  it('bấm rồi mới nhúng, và nhúng bằng tên miền không đặt cookie', async () => {
    render(<LessonVideo video={youtube} title="Rùa vẽ hình" />);
    await userEvent.click(screen.getByTestId('lesson-video-play'));
    const frame = screen.getByTestId('lesson-video');
    expect(frame).toHaveAttribute(
      'src',
      'https://www.youtube-nocookie.com/embed/abcdefghijk?autoplay=1&rel=0',
    );
    expect(frame).toHaveAttribute('title', 'Rùa vẽ hình');
  });

  it('video tự host thì phát thẳng, không hỏi bên thứ ba nào', () => {
    render(
      <LessonVideo video={{ provider: 'hls', src: '/video/rua.m3u8', durationSec: 60 }} title="x" />,
    );
    const player = screen.getByTestId('lesson-video');
    expect(player.tagName).toBe('VIDEO');
    expect(player).toHaveAttribute('preload', 'none');
  });
});

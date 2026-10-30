import { useState } from 'react';
import { Play } from 'lucide-react';
import type { Video } from '@lalakode/content-schema';
import { vi } from '../../shared/i18n/vi';
import { buttonClasses } from '../../shared/ui/button-classes';

/**
 * Video chỉ được tải **sau khi trẻ bấm**. Trước đó không có request nào ra
 * YouTube — kể cả ảnh thu nhỏ, vì chính nó cũng đủ để bên kia biết em đang mở
 * trang này (docs/privacy.md §"Không tải font, script hay ảnh từ CDN ngoài").
 */
export function LessonVideo({ video, title }: { video: Video; title: string }) {
  const [playing, setPlaying] = useState(false);
  const minutes = Math.round(video.durationSec / 60);

  if (video.provider === 'hls') {
    // Video tự host: phát thẳng, không có bên thứ ba nào ở đây.
    return (
      <video
        controls
        preload="none"
        src={video.src}
        className="aspect-video w-full rounded-2xl bg-ink"
        data-testid="lesson-video"
      />
    );
  }

  if (!playing) {
    return (
      <div className="rounded-2xl border border-line bg-surface-muted p-6 text-center">
        <button
          type="button"
          onClick={() => setPlaying(true)}
          data-testid="lesson-video-play"
          className={buttonClasses('primary', 'md')}
        >
          <Play aria-hidden="true" className="size-5" />
          {vi.lesson.videoPlay}
          {minutes > 0 && ` · ${minutes} ${vi.lesson.videoMinutes}`}
        </button>
        <p className="mt-2 text-sm text-ink-soft">{vi.lesson.videoNote}</p>
      </div>
    );
  }

  return (
    <iframe
      // `-nocookie`: YouTube không đặt cookie theo dõi cho tới khi em bấm phát.
      src={`https://www.youtube-nocookie.com/embed/${video.videoId}?autoplay=1&rel=0`}
      title={title}
      allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
      // Chỉ gửi tên miền cho YouTube, không gửi đường dẫn bài học em đang mở.
      // Mặc định của trình duyệt cũng vậy, nhưng ghi rõ thì không phụ thuộc máy nào.
      referrerPolicy="strict-origin-when-cross-origin"
      allowFullScreen
      data-testid="lesson-video"
      className="aspect-video w-full rounded-2xl border-0 bg-ink"
    />
  );
}

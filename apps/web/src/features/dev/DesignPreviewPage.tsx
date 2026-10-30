import {
  CircleCheck,
  Lightbulb,
  Play,
  RotateCcw,
  Send,
  Sparkles,
  Square,
  TriangleAlert,
} from 'lucide-react';
import { AiPanel } from '../../shared/ui/AiPanel';
import { Button } from '../../shared/ui/Button';
import { Card } from '../../shared/ui/Card';
import { IconButton } from '../../shared/ui/IconButton';

const COLORS = [
  'ink',
  'ink-soft',
  'surface',
  'surface-muted',
  'line',
  'accent',
  'on-accent',
  'accent-strong',
  'accent-soft',
  'ai-surface',
  'success',
  'success-surface',
  'attention',
  'attention-surface',
] as const;

const TYPE_SCALE = [
  ['text-page-title', 'Tiêu đề trang · 28/36 đậm'],
  ['text-section-title', 'Tiêu đề mục · 22/30'],
  ['text-card-title', 'Tiêu đề thẻ · 18/26'],
  ['text-body', 'Chữ thân · 16/24'],
  ['text-small text-ink-soft', 'Chữ phụ · 14/20'],
  ['text-label', 'Nhãn nút · 16/24 đậm vừa'],
] as const;

/**
 * Trang mẫu design system — **chỉ có ở chế độ dev** (xem app/routes.tsx).
 * Hiển thị token và component thật, dùng để chụp ảnh cho docs/design-system.md
 * và để tự soát khi đổi token. Chữ ở đây không nằm trong i18n vì trẻ không thấy trang này.
 */
export function DesignPreviewPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-page-title">Design system lalakode (chỉ dev)</h1>

      <Card as="section" aria-labelledby="mau">
        <h2 id="mau" className="text-section-title">
          Màu (token theo vai trò)
        </h2>
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {COLORS.map((name) => (
            <li key={name} className="text-small">
              <span
                className="block h-12 rounded-xl border border-line"
                style={{ background: `var(--color-${name})` }}
              />
              <code className="mt-1 block">{name}</code>
            </li>
          ))}
        </ul>
      </Card>

      <Card as="section" aria-labelledby="chu">
        <h2 id="chu" className="text-section-title">
          Chữ · Be Vietnam Pro
        </h2>
        <div className="mt-4 space-y-3">
          {TYPE_SCALE.map(([className, label]) => (
            <p key={className} className={className}>
              {label} — Hoàn thành! Ổ bánh mì, ước mơ, Đội bóng
            </p>
          ))}
        </div>
      </Card>

      <Card as="section" aria-labelledby="nut">
        <h2 id="nut" className="text-section-title">
          Nút
        </h2>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button icon={<Send aria-hidden className="size-4" />}>Nộp bài</Button>
          <Button variant="dark" icon={<Play aria-hidden className="size-4" />}>
            Chạy thử
          </Button>
          <Button variant="outline" icon={<Square aria-hidden className="size-4" />}>
            Dừng
          </Button>
          <Button variant="ghost" icon={<RotateCcw aria-hidden className="size-4" />}>
            Làm lại từ đầu
          </Button>
          <IconButton label="Gợi ý" icon={<Lightbulb aria-hidden className="size-5" />} />
          <Button size="lg">Bắt đầu học</Button>
          <Button disabled>Đang chấm…</Button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-success-surface px-3 py-1.5 text-small font-semibold text-success">
            <CircleCheck aria-hidden className="size-4" /> Test 1: Đạt
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-attention-surface px-3 py-1.5 text-small font-semibold text-attention">
            <TriangleAlert aria-hidden className="size-4" /> Test 2: Chưa đạt, thử lại nhé
          </span>
        </div>
      </Card>

      <AiPanel>
        <p className="flex items-center gap-2 text-card-title">
          <Sparkles aria-hidden className="size-5" /> Gợi ý từ trợ lý
        </p>
        <p className="mt-1">Em thử đếm xem rùa đã quay mấy lần rồi nhé.</p>
      </AiPanel>
    </div>
  );
}

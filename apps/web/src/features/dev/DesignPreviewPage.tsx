import { useState } from 'react';
import { PALETTES } from './design-palettes';
import { PalettePreview } from './PalettePreview';
import './design-fonts.css';

const FONTS = [
  {
    family: 'Be Vietnam Pro',
    note: 'Thiết kế riêng cho tiếng Việt, dấu đặt gọn, nét hiện đại. Hơi "người lớn" hơn hai font kia.',
  },
  {
    family: 'Lexend',
    note: 'Thiết kế để dễ đọc cho người mới tập đọc: chữ rộng, khoảng cách thoáng. Tốn chỗ hơn.',
  },
  {
    family: 'Nunito',
    note: 'Đầu nét tròn, thân thiện, trẻ trung nhất. Ở cỡ nhỏ hơi mềm.',
  },
] as const;

const SAMPLE = 'Hoàn thành! Ổ bánh mì, ước mơ, Đội bóng';

/**
 * Trang chọn design system — **chỉ có ở chế độ dev** (xem app/routes.tsx).
 * Người duy trì xem hai bảng màu và ba font ở đây rồi chọn (S0-31).
 * Chữ ở đây không nằm trong i18n vì trẻ không bao giờ thấy trang này.
 */
export function DesignPreviewPage() {
  const [font, setFont] = useState<(typeof FONTS)[number]['family']>(FONTS[0].family);

  return (
    <div style={{ fontFamily: `'${font}', system-ui, sans-serif` }} className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Chọn design system (chỉ dev)</h1>
        <p>Chọn một font và một bảng màu. Mọi cặp chữ/nền dưới đây đã được test là đạt WCAG AA.</p>
      </header>

      <section aria-labelledby="chon-font" className="space-y-3">
        <h2 id="chon-font" className="text-xl font-semibold">
          Font (tự host, giấy phép OFL)
        </h2>
        <div role="radiogroup" aria-label="Font" className="flex flex-wrap gap-2">
          {FONTS.map((item) => (
            <button
              key={item.family}
              type="button"
              role="radio"
              aria-checked={font === item.family}
              onClick={() => setFont(item.family)}
              className={[
                'min-h-tap rounded-full border-2 px-5 font-semibold',
                font === item.family ? 'border-ink bg-ink text-surface' : 'border-line',
              ].join(' ')}
              style={{ fontFamily: `'${item.family}', system-ui, sans-serif` }}
            >
              {item.family}
            </button>
          ))}
        </div>
        <div className="grid gap-3 md:grid-cols-3" data-testid="font-samples">
          {FONTS.map((item) => (
            <div
              key={item.family}
              className="rounded-2xl border border-line p-4"
              style={{ fontFamily: `'${item.family}', system-ui, sans-serif` }}
            >
              <p className="text-sm font-semibold">{item.family}</p>
              <p className="mt-1 text-[28px] leading-9 font-bold">{SAMPLE}</p>
              <p className="mt-2 text-[22px] leading-[30px] font-semibold">{SAMPLE}</p>
              <p className="mt-2 text-base">{SAMPLE}</p>
              <p className="mt-2 text-sm">{item.note}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        {PALETTES.map((palette) => (
          <PalettePreview key={palette.id} palette={palette} />
        ))}
      </div>
    </div>
  );
}

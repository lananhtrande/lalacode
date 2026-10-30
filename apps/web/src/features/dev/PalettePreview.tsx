import type { CSSProperties, ReactNode } from 'react';
import {
  Award,
  CircleCheck,
  House,
  Info,
  Lightbulb,
  Map,
  Play,
  RotateCcw,
  Send,
  Sparkles,
  Square,
  TriangleAlert,
  Turtle,
} from 'lucide-react';
import { contrastRatio } from '../../shared/lib/contrast';
import type { Palette } from './design-palettes';

/** Thang chữ đề xuất: 6 kiểu, đặt tên theo vai trò. */
const type = {
  pageTitle: { fontSize: 32, lineHeight: '40px', fontWeight: 700 },
  sectionTitle: { fontSize: 22, lineHeight: '30px', fontWeight: 600 },
  cardTitle: { fontSize: 18, lineHeight: '26px', fontWeight: 600 },
  body: { fontSize: 16, lineHeight: '24px', fontWeight: 400 },
  small: { fontSize: 14, lineHeight: '20px', fontWeight: 400 },
  label: { fontSize: 16, lineHeight: '24px', fontWeight: 600 },
} satisfies Record<string, CSSProperties>;

const pill: CSSProperties = {
  ...type.label,
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  minHeight: 44,
  padding: '0 20px',
  borderRadius: 999,
  border: '2px solid transparent',
};

/**
 * Bản xem trước một bảng màu — dùng style nội tuyến để hai phương án nằm cạnh
 * nhau mà không đụng token thật trong index.css.
 */
export function PalettePreview({ palette }: { palette: Palette }) {
  const c = palette.colors;
  const e = palette.editor;

  const buttons = [
    {
      label: 'Nộp bài',
      icon: <Send size={18} />,
      style: { background: c.accent, color: c.onAccent },
    },
    { label: 'Chạy thử', icon: <Play size={18} />, style: { background: c.ink, color: c.surface } },
    { label: 'Dừng', icon: <Square size={18} />, style: { borderColor: c.ink, color: c.ink } },
    { label: 'Làm lại từ đầu', icon: <RotateCcw size={18} />, style: { color: c.ink } },
  ];

  return (
    <section
      aria-label={palette.name}
      style={{ background: c.surfaceMuted, color: c.ink, borderRadius: 24, padding: 20 }}
      className="space-y-5"
    >
      <header>
        <h2 style={type.sectionTitle}>{palette.name}</h2>
        <p style={{ ...type.small, color: c.inkSoft }}>{palette.why}</p>
      </header>

      {/* Khung trang thu nhỏ: sidebar + thẻ nội dung */}
      <div className="flex gap-4" style={{ background: c.surfaceMuted }}>
        <nav
          aria-label="Sidebar mẫu"
          style={{
            background: c.surface,
            borderRadius: 16,
            padding: 12,
            width: 190,
            flexShrink: 0,
          }}
          className="space-y-1"
        >
          <p
            className="mb-3 flex items-center gap-2 px-2"
            style={{ ...type.cardTitle, fontWeight: 700 }}
          >
            <Turtle size={22} style={{ color: c.accentStrong }} aria-hidden /> lalakode
          </p>
          {[
            { label: 'Trang chủ', icon: <House size={18} /> },
            { label: 'Bản đồ', icon: <Map size={18} />, active: true },
            { label: 'Huy hiệu', icon: <Award size={18} /> },
            { label: 'Giới thiệu', icon: <Info size={18} /> },
          ].map((item) => (
            <span
              key={item.label}
              style={{
                ...pill,
                padding: '0 14px',
                width: '100%',
                ...(item.active
                  ? { background: c.ink, color: c.surface }
                  : { color: c.inkSoft, fontWeight: 500 }),
              }}
            >
              {item.icon}
              {item.label}
            </span>
          ))}
        </nav>

        <Card palette={palette}>
          <h3 style={type.pageTitle}>Bản đồ nhiệm vụ</h3>
          <p style={{ ...type.body, marginTop: 8 }}>
            Hoàn thành! Ổ bánh mì, ước mơ, Đội bóng — chữ thân 16/24.
          </p>
          <p style={{ ...type.small, color: c.inkSoft, marginTop: 4 }}>
            Chữ phụ 14/20: 3 bài tập · khoảng 12 phút
          </p>
          <a
            href="#mau"
            style={{ ...type.body, color: c.accentStrong, textDecoration: 'underline' }}
          >
            Liên kết dùng màu nhấn đậm
          </a>
        </Card>
      </div>

      <Card palette={palette}>
        <h3 style={type.cardTitle}>Nút (viên thuốc, cao ≥ 44px)</h3>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {buttons.map((button) => (
            <button key={button.label} type="button" style={{ ...pill, ...button.style }}>
              {button.icon}
              {button.label}
            </button>
          ))}
          <button
            type="button"
            aria-label="Gợi ý"
            style={{
              ...pill,
              padding: 0,
              width: 44,
              justifyContent: 'center',
              background: c.surfaceMuted,
              color: c.ink,
            }}
          >
            <Lightbulb size={20} />
          </button>
        </div>
        <p style={{ ...type.small, color: c.inkSoft, marginTop: 12 }}>
          Viền focus 3px:
          <span
            style={{
              ...pill,
              marginLeft: 8,
              background: c.accent,
              color: c.onAccent,
              outline: `3px solid ${c.ink}`,
              outlineOffset: 2,
            }}
          >
            Nộp bài
          </span>
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Status color={c.success} background={c.successSurface} icon={<CircleCheck size={18} />}>
            Test 1: Đạt
          </Status>
          <Status
            color={c.attention}
            background={c.attentionSurface}
            icon={<TriangleAlert size={18} />}
          >
            Test 2: Chưa đạt, thử lại nhé
          </Status>
        </div>
      </Card>

      <div style={{ background: c.aiSurface, borderRadius: 16, padding: 16 }}>
        <p className="flex items-center gap-2" style={type.cardTitle}>
          <Sparkles size={20} aria-hidden /> Gợi ý từ trợ lý
        </p>
        <p style={{ ...type.body, marginTop: 6 }}>
          Em thử đếm xem rùa đã quay mấy lần rồi nhé. Mỗi góc của hình vuông là 90 độ.
        </p>
        <p style={{ ...type.small, color: c.inkSoft, marginTop: 4 }}>
          Nền riêng cho mọi thứ do AI tạo ra.
        </p>
      </div>

      <EditorSample palette={palette} />

      <Card palette={palette}>
        <h3 style={type.cardTitle}>Tương phản (chữ / nền)</h3>
        <ul className="mt-2 grid gap-2" style={type.small}>
          {(
            [
              ['ink', 'surface'],
              ['inkSoft', 'surface'],
              ['onAccent', 'accent'],
              ['accentStrong', 'surface'],
              ['ink', 'aiSurface'],
              ['success', 'successSurface'],
              ['attention', 'attentionSurface'],
            ] as const
          ).map(([text, background]) => (
            <li key={`${text}-${background}`} className="flex items-center gap-2">
              <span
                style={{
                  background: c[background],
                  color: c[text],
                  border: `1px solid ${c.line}`,
                  borderRadius: 8,
                  padding: '2px 8px',
                  fontWeight: 600,
                }}
              >
                Aa
              </span>
              <span>
                {text}/{background}:{' '}
                <strong>{contrastRatio(c[text], c[background]).toFixed(1)}</strong>
              </span>
            </li>
          ))}
          <li className="flex items-center gap-2">
            <span
              style={{
                background: e.background,
                color: e.comment,
                borderRadius: 8,
                padding: '2px 8px',
              }}
            >
              #
            </span>
            <span>
              comment/editor: <strong>{contrastRatio(e.comment, e.background).toFixed(1)}</strong>
            </span>
          </li>
        </ul>
      </Card>
    </section>
  );
}

function Card({ palette, children }: { palette: Palette; children: ReactNode }) {
  return (
    <div
      style={{
        background: palette.colors.surface,
        borderRadius: 16,
        padding: 20,
        boxShadow: '0 1px 2px rgb(0 0 0 / 0.05), 0 4px 12px rgb(0 0 0 / 0.04)',
        flex: 1,
      }}
    >
      {children}
    </div>
  );
}

function Status({
  color,
  background,
  icon,
  children,
}: {
  color: string;
  background: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <span
      className="inline-flex items-center gap-2"
      style={{
        ...type.small,
        fontWeight: 600,
        color,
        background,
        borderRadius: 999,
        padding: '6px 12px',
      }}
    >
      {icon}
      {children}
    </span>
  );
}

/** Editor tối mẫu (tĩnh) — theme thật cho CodeMirror là việc của S0-32. */
function EditorSample({ palette }: { palette: Palette }) {
  const e = palette.editor;
  const k = (text: string) => <span style={{ color: e.keyword }}>{text}</span>;
  const s = (text: string) => <span style={{ color: e.string }}>{text}</span>;
  const n = (text: string) => <span style={{ color: e.number }}>{text}</span>;
  const f = (text: string) => <span style={{ color: e.function }}>{text}</span>;
  const b = (text: string) => <span style={{ color: e.builtin }}>{text}</span>;
  const lines: ReactNode[] = [
    <span style={{ color: e.comment }}># Vẽ hình vuông bằng rùa</span>,
    <>{k('import')} turtle</>,
    <></>,
    <>
      {k('for')} canh {k('in')} {b('range')}({n('4')}):
    </>,
    <>
      {'    '}turtle.{f('forward')}({n('100')})
    </>,
    <>
      {'    '}turtle.{f('left')}({n('90')})
    </>,
    <>
      {b('print')}({s('"Xong rồi!"')}, {n('4')})
    </>,
  ];
  const activeLine = 4;

  return (
    <div style={{ borderRadius: 16, overflow: 'hidden', background: e.background }}>
      <p
        style={{
          ...type.small,
          fontWeight: 600,
          color: e.text,
          background: e.gutter,
          padding: '8px 14px',
        }}
      >
        Code của em
      </p>
      <pre
        className="font-mono"
        style={{
          fontSize: 16,
          lineHeight: 1.6,
          color: e.text,
          margin: 0,
          padding: '8px 0',
          overflowX: 'auto',
        }}
      >
        {lines.map((line, index) => (
          <div
            key={index}
            style={{ display: 'flex', background: index === activeLine ? e.activeLine : undefined }}
          >
            <span
              style={{
                color: e.lineNumber,
                background: e.gutter,
                width: 40,
                textAlign: 'right',
                paddingRight: 10,
                flexShrink: 0,
              }}
            >
              {index + 1}
            </span>
            <span style={{ paddingLeft: 12, whiteSpace: 'pre' }}>
              {line}
              {index === activeLine && (
                <span style={{ borderLeft: `2px solid ${palette.colors.accent}`, marginLeft: 1 }} />
              )}
            </span>
          </div>
        ))}
      </pre>
      <div style={{ borderTop: `1px solid ${e.gutter}`, padding: '10px 14px' }}>
        <p style={{ ...type.small, fontWeight: 600, color: e.text }}>Kết quả chạy</p>
        <pre className="font-mono" style={{ fontSize: 15, color: e.text, margin: '4px 0 0' }}>
          Xong rồi! 4
        </pre>
        <p className="font-mono" style={{ fontSize: 14, color: e.lineNumber, marginTop: 4 }}>
          Bấm &quot;Chạy thử&quot; để xem chương trình in ra gì.
        </p>
        <p style={{ ...type.small, color: e.text, marginTop: 8 }}>
          Vùng chọn:{' '}
          <span
            style={{ background: `${palette.colors.accent}40`, color: e.text, padding: '0 4px' }}
          >
            turtle.forward
          </span>
        </p>
      </div>
    </div>
  );
}

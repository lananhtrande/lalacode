import { useId, useRef, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { fill } from '../../shared/i18n/fill';
import { vi } from '../../shared/i18n/vi';

export type ResultTab = 'ket-qua' | 'kiem-tra';

export interface ResultsPanelProps {
  tab: ResultTab;
  onTabChange: (tab: ResultTab) => void;
  testCount: number;
  output: ReactNode;
  tests: ReactNode;
  /** Thu gọn chỉ còn hàng tab (màn rộng). */
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}

const tabs: ResultTab[] = ['ket-qua', 'kiem-tra'];

/**
 * Panel dưới editor (S0-39): hai tab "Kết quả" (console + hình rùa) và
 * "Kiểm tra (N)" (kết quả chấm từng test). Tab theo mẫu WAI-ARIA: mũi tên
 * trái/phải đổi tab, chỉ tab đang chọn nằm trong thứ tự Tab.
 */
export function ResultsPanel({
  tab,
  onTabChange,
  testCount,
  output,
  tests,
  collapsed,
  onCollapsedChange,
}: ResultsPanelProps) {
  const id = useId();
  const tabRefs = useRef<Record<ResultTab, HTMLButtonElement | null>>({
    'ket-qua': null,
    'kiem-tra': null,
  });

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const next = tabs[(tabs.indexOf(tab) + 1) % tabs.length] ?? tab;
    onTabChange(next);
    tabRefs.current[next]?.focus();
  };

  const label = (value: ResultTab) =>
    value === 'ket-qua' ? vi.exercise.tabOutput : fill(vi.exercise.tabTests, { n: testCount });

  return (
    <section
      aria-label={vi.exercise.resultsLabel}
      data-testid="results-panel"
      className="flex min-h-0 flex-col overflow-hidden rounded-card bg-surface shadow-card"
    >
      <div className="flex items-center gap-1 border-b border-line px-2">
        <div role="tablist" aria-label={vi.exercise.resultsLabel} className="flex">
          {tabs.map((value) => {
            const selected = value === tab;
            return (
              <button
                key={value}
                ref={(element) => {
                  tabRefs.current[value] = element;
                }}
                type="button"
                role="tab"
                id={`${id}-${value}`}
                aria-selected={selected}
                aria-controls={`${id}-${value}-panel`}
                tabIndex={selected ? 0 : -1}
                onKeyDown={onKeyDown}
                onClick={() => {
                  onTabChange(value);
                  if (collapsed) onCollapsedChange(false);
                }}
                className={[
                  'relative min-h-tap px-4 text-label',
                  'after:absolute after:inset-x-3 after:bottom-0 after:h-[3px] after:rounded-full',
                  selected
                    ? 'text-ink after:bg-accent'
                    : 'font-medium text-ink-soft hover:text-ink',
                ].join(' ')}
              >
                {label(value)}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          aria-expanded={!collapsed}
          onClick={() => onCollapsedChange(!collapsed)}
          className="ml-auto hidden min-h-tap items-center gap-1 rounded-full px-3 text-small font-semibold text-ink-soft hover:bg-surface-muted hover:text-ink lg:flex"
        >
          {collapsed ? (
            <ChevronUp aria-hidden="true" className="size-4" />
          ) : (
            <ChevronDown aria-hidden="true" className="size-4" />
          )}
          {collapsed ? vi.exercise.expandPanel : vi.exercise.collapsePanel}
        </button>
      </div>
      {tabs.map((value) => (
        <div
          key={value}
          role="tabpanel"
          id={`${id}-${value}-panel`}
          aria-labelledby={`${id}-${value}`}
          // Giữ cả hai tab trong trang (ẩn bằng `hidden`) để `aria-live` và kết
          // quả chạy không mất khi đổi tab.
          hidden={value !== tab || collapsed}
          data-testid={`results-${value}`}
          className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4"
        >
          {value === 'ket-qua' ? output : tests}
        </div>
      ))}
    </section>
  );
}

export const PANEL_MIN = 120;
const STEP = 32;

/**
 * Thanh kéo đổi chiều cao panel kết quả (màn rộng). Dùng được bằng bàn phím:
 * mũi tên lên/xuống, Home/End. `aria-valuenow` là chiều cao panel tính bằng px.
 */
export function PanelResizer({
  height,
  max,
  onChange,
}: {
  height: number;
  max: number;
  onChange: (height: number) => void;
}) {
  const clamp = (value: number) => Math.round(Math.min(max, Math.max(PANEL_MIN, value)));
  const drag = useRef<{ startY: number; startHeight: number } | null>(null);

  const onKeyDown = (event: KeyboardEvent) => {
    const next =
      event.key === 'ArrowUp'
        ? height + STEP
        : event.key === 'ArrowDown'
          ? height - STEP
          : event.key === 'Home'
            ? max
            : event.key === 'End'
              ? PANEL_MIN
              : null;
    if (next === null) return;
    event.preventDefault();
    onChange(clamp(next));
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    drag.current = { startY: event.clientY, startHeight: height };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    // Kéo lên thì panel cao lên.
    onChange(clamp(drag.current.startHeight + drag.current.startY - event.clientY));
  };
  const onPointerUp = () => {
    drag.current = null;
  };

  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      aria-label={vi.exercise.resizePanel}
      aria-valuenow={height}
      aria-valuemin={PANEL_MIN}
      aria-valuemax={max}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      data-testid="results-resizer"
      className="group hidden h-4 shrink-0 cursor-row-resize touch-none items-center justify-center rounded-full lg:flex"
    >
      <span className="h-1 w-12 rounded-full bg-line group-hover:bg-ink-soft" />
    </div>
  );
}

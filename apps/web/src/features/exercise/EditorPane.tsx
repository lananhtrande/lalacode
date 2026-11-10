import { useEffect, useRef, useState } from 'react';
import { AArrowDown, AArrowUp, RotateCcw } from 'lucide-react';
import { CodeEditor } from '../../shared/ui/CodeEditor';
import { useStoredState } from '../../shared/lib/stored-state';
import { vi } from '../../shared/i18n/vi';

const FONT_SIZES = [14, 15, 16, 18, 20, 22] as const;
const isFontSize = (value: unknown): value is number =>
  typeof value === 'number' && (FONT_SIZES as readonly number[]).includes(value);

export interface EditorPaneProps {
  code: string;
  onChange: (code: string) => void;
  readOnly: boolean;
  pythonReady: boolean;
  restoredDraft: boolean;
  onReset: () => void;
}

/**
 * Editor tối của màn bài thực hành (S0-39). Header: nhãn "Python", trạng thái
 * tải, cỡ chữ A−/A+ (nhớ trên máy), nút "Làm lại từ đầu" có hỏi lại ngay trong
 * trang — không dùng `confirm()` vì hộp thoại của trình duyệt chặn cả trang.
 */
export function EditorPane({
  code,
  onChange,
  readOnly,
  pythonReady,
  restoredDraft,
  onReset,
}: EditorPaneProps) {
  const [fontSize, setFontSize] = useStoredState<number>('lalakode.editor-font', 16, isFontSize);
  const [confirming, setConfirming] = useState(false);
  const confirmRef = useRef<HTMLButtonElement | null>(null);
  const resetRef = useRef<HTMLButtonElement | null>(null);
  const position = FONT_SIZES.indexOf(fontSize as (typeof FONT_SIZES)[number]);

  useEffect(() => {
    if (confirming) confirmRef.current?.focus();
  }, [confirming]);

  const closeConfirm = () => {
    setConfirming(false);
    resetRef.current?.focus();
  };

  const iconButton =
    'flex size-11 items-center justify-center rounded-full text-code-text hover:bg-code-active disabled:opacity-40';

  return (
    <section
      aria-labelledby="code-cua-em"
      className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-card bg-code-bg shadow-card"
    >
      <div className="flex flex-wrap items-center gap-x-2 bg-code-gutter px-3 py-1 text-code-text">
        <h2 id="code-cua-em" className="text-label">
          {vi.exercise.editorLabel}
          <span className="sr-only"> · {vi.exercise.yourCode}</span>
        </h2>
        {!pythonReady && (
          <p className="text-small text-code-muted" role="status">
            {vi.exercise.loadingPython}
          </p>
        )}
        {restoredDraft && (
          <p className="text-small text-code-muted" data-testid="restored-draft">
            {vi.exercise.restored}
          </p>
        )}
        <div className="ml-auto flex items-center">
          <button
            type="button"
            className={iconButton}
            aria-label={vi.exercise.fontSmaller}
            title={vi.exercise.fontSmaller}
            disabled={position <= 0}
            onClick={() => setFontSize(FONT_SIZES[position - 1] ?? fontSize)}
          >
            <AArrowDown aria-hidden="true" className="size-5" />
          </button>
          <button
            type="button"
            className={iconButton}
            aria-label={vi.exercise.fontBigger}
            title={vi.exercise.fontBigger}
            disabled={position >= FONT_SIZES.length - 1}
            onClick={() => setFontSize(FONT_SIZES[position + 1] ?? fontSize)}
          >
            <AArrowUp aria-hidden="true" className="size-5" />
          </button>
          <button
            ref={resetRef}
            type="button"
            className={iconButton}
            aria-label={vi.exercise.reset}
            title={vi.exercise.reset}
            aria-expanded={confirming}
            disabled={readOnly}
            onClick={() => setConfirming(true)}
          >
            <RotateCcw aria-hidden="true" className="size-5" />
          </button>
        </div>
      </div>

      {confirming && (
        <div
          role="group"
          aria-label={vi.exercise.reset}
          data-testid="reset-confirm"
          className="flex flex-wrap items-center gap-2 border-b border-code-active bg-code-active px-4 py-2 text-code-text"
          onKeyDown={(event) => {
            if (event.key === 'Escape') closeConfirm();
          }}
        >
          <p className="mr-auto text-small">{vi.exercise.resetConfirm}</p>
          <button
            ref={confirmRef}
            type="button"
            className="min-h-tap rounded-full bg-code-text px-4 text-label text-code-bg"
            onClick={() => {
              onReset();
              closeConfirm();
            }}
          >
            {vi.exercise.resetYes}
          </button>
          <button
            type="button"
            className="min-h-tap rounded-full px-4 text-label hover:bg-code-gutter"
            onClick={closeConfirm}
          >
            {vi.exercise.resetNo}
          </button>
        </div>
      )}

      <div className="relative flex min-h-0 flex-1 flex-col">
        {/* Nằm dưới editor: CodeMirror dựng xong là che mất, chậm thì trẻ vẫn thấy chữ chờ. */}
        <p aria-hidden="true" className="absolute inset-0 p-4 text-small text-code-muted">
          {vi.exercise.loadingEditor}
        </p>
        <CodeEditor
          value={code}
          onChange={onChange}
          label={vi.exercise.yourCode}
          readOnly={readOnly}
          fontSize={fontSize}
          // Tối thiểu ~10 dòng ở điện thoại; màn rộng cao hết phần trên của cột phải.
          className="relative min-h-64 flex-1 lg:min-h-40"
        />
      </div>
    </section>
  );
}

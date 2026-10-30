import { useEffect, useRef, useState } from 'react';
import { Compartment, EditorState } from '@codemirror/state';
import {
  EditorView,
  drawSelection,
  highlightActiveLine,
  keymap,
  lineNumbers,
} from '@codemirror/view';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import {
  bracketMatching,
  indentOnInput,
  syntaxHighlighting,
  defaultHighlightStyle,
} from '@codemirror/language';
import { python } from '@codemirror/lang-python';

/**
 * Ô viết code. CodeMirror quản lý DOM của nó, nên React chỉ dựng một lần rồi
 * để yên — `value` là giá trị khởi tạo, thay đổi sau đó đi qua `onChange`.
 */
export interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  /** Khoá ô code khi đang chạy, để trẻ không sửa giữa chừng. */
  readOnly?: boolean;
}

export function CodeEditor({ value, onChange, label, readOnly = false }: CodeEditorProps) {
  // Compartment cho phép đổi một phần cấu hình sau khi editor đã dựng.
  const [editableCompartment] = useState(() => new Compartment());
  const hostRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);

  // Không gán ref lúc render; effect chạy sau mỗi lần render là đủ sớm.
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const view = new EditorView({
      parent: host,
      state: EditorState.create({
        doc: value,
        extensions: [
          // Cố ý **không** dùng `basicSetup`: nó kéo theo gợi ý code, tìm kiếm,
          // lint, gập code — trẻ mới học không cần, mà nặng hơn gấp đôi ngân
          // sách bundle cho một route (docs/tech-stack.md).
          lineNumbers(),
          history(),
          drawSelection(),
          highlightActiveLine(),
          indentOnInput(),
          bracketMatching(),
          syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
          keymap.of([...defaultKeymap, ...historyKeymap]),
          python(),
          editableCompartment.of(EditorView.editable.of(!readOnly)),
          // Tab thụt dòng thay vì nhảy ra khỏi ô — trẻ gõ Python cần thụt dòng.
          keymap.of([indentWithTab]),
          EditorView.lineWrapping,
          EditorView.updateListener.of((update) => {
            if (update.docChanged) onChangeRef.current(update.state.doc.toString());
          }),
          EditorView.contentAttributes.of({ 'aria-label': label }),
          EditorView.theme({
            '&': { fontSize: '15px' },
            '.cm-content': { fontFamily: 'var(--font-mono)', minHeight: '9rem' },
            '&.cm-focused': { outline: '3px solid var(--color-accent)' },
          }),
        ],
      }),
    });
    viewRef.current = view;
    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // Dựng một lần: các lần sau cập nhật qua effect bên dưới.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Đổi bài tập (hoặc bấm "làm lại từ đầu") → nạp lại nội dung.
  useEffect(() => {
    const view = viewRef.current;
    if (!view || view.state.doc.toString() === value) return;
    view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: value } });
  }, [value]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({ effects: editableCompartment.reconfigure(EditorView.editable.of(!readOnly)) });
  }, [readOnly, editableCompartment]);

  return <div ref={hostRef} className="overflow-hidden rounded-xl border border-line" />;
}

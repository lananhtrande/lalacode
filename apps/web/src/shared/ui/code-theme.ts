import { HighlightStyle } from '@codemirror/language';
import {
  Decoration,
  EditorView,
  MatchDecorator,
  ViewPlugin,
  type DecorationSet,
  type ViewUpdate,
} from '@codemirror/view';
import { tags } from '@lezer/highlight';

/**
 * Theme tối **tự viết** cho editor (S0-32). Không dùng `@codemirror/theme-one-dark`
 * hay `basicSetup` để giữ ngân sách bundle (ADR 0007). Màu lấy từ token
 * `--color-code-*` trong index.css — `tokens.test.ts` chốt chúng đạt AA.
 */
const color = (name: string) => `var(--color-${name})`;

export const darkEditorTheme = EditorView.theme(
  {
    '&': {
      color: color('code-text'),
      backgroundColor: color('code-bg'),
      fontSize: '16px',
      height: '100%',
    },
    '@media (max-width: 639px)': {
      '&': { fontSize: '15px' },
    },
    '.cm-scroller': { fontFamily: 'var(--font-mono)', lineHeight: '1.6', overflow: 'auto' },
    '.cm-content': { caretColor: color('accent'), padding: '8px 0' },
    '.cm-cursor, .cm-dropCursor': { borderLeft: `2px solid ${color('accent')}` },
    '&.cm-focused': { outline: `3px solid ${color('accent')}`, outlineOffset: '-3px' },
    '&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection':
      { backgroundColor: 'rgb(45 212 191 / 0.25)' },
    '.cm-activeLine': { backgroundColor: color('code-active') },
    '.cm-gutters': {
      backgroundColor: color('code-gutter'),
      color: color('code-muted'),
      border: 'none',
    },
    '.cm-lineNumbers .cm-gutterElement': { padding: '0 10px 0 12px' },
    '.cm-activeLineGutter': { backgroundColor: color('code-active'), color: color('code-text') },
    '&.cm-focused .cm-matchingBracket': {
      backgroundColor: 'rgb(45 212 191 / 0.3)',
      outline: 'none',
    },
    // Đang chạy: chỉ đọc → tối đi một chút, ẩn con trỏ để trẻ biết chưa gõ được.
    '&.cm-readonly .cm-content': { opacity: '0.75' },
    '&.cm-readonly .cm-cursor': { display: 'none' },
    '.cm-builtin, .cm-builtin *': { color: `${color('code-builtin')} !important` },
  },
  { dark: true },
);

export const darkHighlightStyle = HighlightStyle.define([
  {
    tag: [
      tags.keyword,
      tags.controlKeyword,
      tags.definitionKeyword,
      tags.moduleKeyword,
      tags.operatorKeyword,
      tags.modifier,
    ],
    color: color('code-keyword'),
  },
  { tag: [tags.string, tags.special(tags.string), tags.escape], color: color('code-string') },
  { tag: [tags.number, tags.bool, tags.null], color: color('code-number') },
  { tag: [tags.comment, tags.lineComment], color: color('code-comment') },
  {
    tag: [
      tags.function(tags.variableName),
      tags.function(tags.propertyName),
      tags.function(tags.definition(tags.variableName)),
      tags.definition(tags.className),
    ],
    color: color('code-function'),
  },
  {
    tag: [tags.operator, tags.arithmeticOperator, tags.compareOperator, tags.definitionOperator],
    color: color('code-text'),
  },
]);

/**
 * Hàm có sẵn của Python mà trẻ hay gặp. Ngữ pháp Python của CodeMirror tô
 * `print(...)` giống hệt hàm trẻ tự viết, nên tô riêng bằng một lớp trang trí.
 */
const BUILTINS = [
  'print',
  'input',
  'range',
  'len',
  'int',
  'str',
  'float',
  'bool',
  'list',
  'dict',
  'set',
  'tuple',
  'abs',
  'max',
  'min',
  'sum',
  'round',
  'sorted',
  'reversed',
  'enumerate',
  'zip',
  'type',
];

const builtinMatcher = new MatchDecorator({
  regexp: new RegExp(`\\b(?:${BUILTINS.join('|')})(?=\\s*\\()`, 'g'),
  decoration: Decoration.mark({ class: 'cm-builtin' }),
});

export const highlightBuiltins = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;
    constructor(view: EditorView) {
      this.decorations = builtinMatcher.createDeco(view);
    }
    update(update: ViewUpdate) {
      this.decorations = builtinMatcher.updateDeco(update, this.decorations);
    }
  },
  { decorations: (plugin) => plugin.decorations },
);

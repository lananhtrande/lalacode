/**
 * Hai phương án bảng màu cho S0-31, để người duy trì chọn ở `/dev/design`.
 * Chọn xong, phương án thắng chuyển thành token trong `index.css` và file này bị xoá.
 *
 * Tên token theo **vai trò**, không theo màu: đổi bảng màu thì không phải đổi
 * tên class ở các màn.
 */

export interface Palette {
  id: 'ngoc' | 'san-ho';
  name: string;
  why: string;
  colors: {
    /** Chữ chính, gần đen. */
    ink: string;
    /** Chữ phụ. Vẫn đạt AA trên mọi nền sáng. */
    inkSoft: string;
    surface: string;
    surfaceMuted: string;
    line: string;
    /** Màu nhấn duy nhất: nút chính, mục đang chọn, con trỏ editor. */
    accent: string;
    onAccent: string;
    /** Màu nhấn đậm hơn, dùng cho chữ/link trên nền trắng (màu nhấn sáng không đạt AA). */
    accentStrong: string;
    /** Nền riêng cho mọi thứ do AI tạo ra. */
    aiSurface: string;
    success: string;
    successSurface: string;
    attention: string;
    attentionSurface: string;
  };
  editor: {
    background: string;
    gutter: string;
    activeLine: string;
    text: string;
    lineNumber: string;
    keyword: string;
    string: string;
    number: string;
    comment: string;
    function: string;
    builtin: string;
  };
}

export const PALETTES: readonly Palette[] = [
  {
    id: 'ngoc',
    name: 'A · Ngọc biển',
    why: 'Xanh ngọc tươi, mát mắt, gợi biển và lá cây. Hợp cả bé trai lẫn bé gái, không trùng màu đỏ "sai" hay vàng "cảnh báo".',
    colors: {
      ink: '#0F1A1C',
      inkSoft: '#4A5A5E',
      surface: '#FFFFFF',
      surfaceMuted: '#F3F6F6',
      line: '#DCE3E4',
      accent: '#2DD4BF',
      onAccent: '#06302B',
      accentStrong: '#0F766E',
      aiSurface: '#F1EEFF',
      success: '#126B32',
      successSurface: '#E7F6EC',
      attention: '#A64B00',
      attentionSurface: '#FFF3E0',
    },
    editor: {
      background: '#0D1B1E',
      gutter: '#122428',
      activeLine: '#16292D',
      text: '#E4F0F0',
      lineNumber: '#8DA2A6',
      keyword: '#FF9AC1',
      string: '#A5E3A0',
      number: '#FFC57A',
      comment: '#9AAEB2',
      function: '#7CC6FF',
      builtin: '#5FE3D2',
    },
  },
  {
    id: 'san-ho',
    name: 'B · San hô',
    why: 'Cam san hô ấm, vui, nổi bật trên nền trắng. Năng động hơn A nhưng cần giữ "cần chú ý" ở tông hổ phách để không lẫn với màu nhấn.',
    colors: {
      ink: '#1C1412',
      inkSoft: '#5C4E4A',
      surface: '#FFFFFF',
      surfaceMuted: '#F7F3F1',
      line: '#E7DFDB',
      accent: '#FF7A59',
      onAccent: '#2B0E05',
      accentStrong: '#B5381A',
      aiSurface: '#EDF3FF',
      success: '#126B32',
      successSurface: '#E7F6EC',
      attention: '#9A5800',
      attentionSurface: '#FFF4E2',
    },
    editor: {
      background: '#1A1513',
      gutter: '#221B19',
      activeLine: '#2A221F',
      text: '#F3ECE9',
      lineNumber: '#A3958F',
      keyword: '#C9A7FF',
      string: '#A5E3A0',
      number: '#FFD27A',
      comment: '#AA9C96',
      function: '#7CC6FF',
      builtin: '#FF9F85',
    },
  },
];

type ColorKey = keyof Palette['colors'];
type EditorKey = keyof Palette['editor'];

/** Mọi cặp chữ/nền thật sự xuất hiện trên giao diện. Test đòi tất cả ≥ 4.5:1. */
export const TEXT_PAIRS: readonly (readonly [ColorKey, ColorKey])[] = [
  ['ink', 'surface'],
  ['ink', 'surfaceMuted'],
  ['inkSoft', 'surface'],
  ['inkSoft', 'surfaceMuted'],
  ['onAccent', 'accent'],
  ['accentStrong', 'surface'],
  ['accentStrong', 'surfaceMuted'],
  ['ink', 'aiSurface'],
  ['inkSoft', 'aiSurface'],
  ['success', 'surface'],
  ['success', 'successSurface'],
  ['attention', 'surface'],
  ['attention', 'attentionSurface'],
];

export const EDITOR_TEXT: readonly EditorKey[] = [
  'text',
  'lineNumber',
  'keyword',
  'string',
  'number',
  'comment',
  'function',
  'builtin',
];

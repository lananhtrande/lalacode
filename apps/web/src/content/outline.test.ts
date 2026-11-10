import { describe, expect, it } from 'vitest';
import { headingId, lessonOutline } from './outline';

describe('headingId', () => {
  it('bỏ dấu tiếng Việt, viết thường, nối bằng gạch ngang', () => {
    expect(headingId('Vòng lặp lồng nhau')).toBe('vong-lap-long-nhau');
    expect(headingId('Đổi giá trị của biến')).toBe('doi-gia-tri-cua-bien');
    expect(headingId('Lệnh print là gì?')).toBe('lenh-print-la-gi');
  });

  it('tiêu đề chỉ có ký hiệu vẫn có id', () => {
    expect(headingId('!!!')).toBe('muc');
  });
});

describe('lessonOutline', () => {
  it('lấy tiêu đề # và ## theo thứ tự, bỏ ký hiệu Markdown', () => {
    const markdown = [
      '## Lệnh `print`',
      'Chữ thường.',
      '# Thử **ngay**',
      '### Mục nhỏ không vào mục lục',
      '## [Đọc thêm](https://example.org)',
    ].join('\n');
    expect(lessonOutline(markdown)).toEqual([
      { id: 'lenh-print', text: 'Lệnh print', line: 1 },
      { id: 'thu-ngay', text: 'Thử ngay', line: 3 },
      { id: 'doc-them', text: 'Đọc thêm', line: 5 },
    ]);
  });

  it('bỏ qua dòng bắt đầu bằng # trong khối code (comment Python)', () => {
    const markdown = ['## Code mẫu', '```python', '# Đây là comment', 'print(1)', '```'].join('\n');
    expect(lessonOutline(markdown).map((item) => item.text)).toEqual(['Code mẫu']);
  });

  it('hai tiêu đề trùng chữ thì id thêm số để không đụng nhau', () => {
    expect(lessonOutline('## Thử\n## Thử\n## Thử').map((item) => item.id)).toEqual([
      'thu',
      'thu-2',
      'thu-3',
    ]);
  });
});

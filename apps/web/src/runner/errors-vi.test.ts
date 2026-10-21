import { describe, expect, it } from 'vitest';
import { translatePythonError } from './errors-vi';
import fixtures from './pyodide-errors.fixture.json';

/**
 * `pyodide-errors.fixture.json` là traceback **thật** lấy từ Pyodide 314.0.7
 * (chạy từng đoạn code sai trong trình duyệt rồi ghi lại). Dịch mà chỉ đoán
 * theo trí nhớ thì rất dễ lệch với chuỗi thật.
 */
const raw = (key: keyof typeof fixtures) => fixtures[key];

describe('translatePythonError — traceback thật từ Pyodide', () => {
  it('NameError: nêu đúng tên và nhắc kiểm tra chính tả', () => {
    const info = translatePythonError(raw('name_error'));
    expect(info.type).toBe('NameError');
    expect(info.title).toContain('ten_chua_co');
    expect(info.hint).toContain('chính tả');
    expect(info.line).toBe(1);
  });

  it('NameError gõ nhầm: chuyển luôn gợi ý "Did you mean" sang tiếng Việt', () => {
    const info = translatePythonError(raw('name_error_typo'));
    expect(info.title).toContain('prnt');
    expect(info.hint).toContain('`print`');
    expect(info.hint).not.toContain('Did you mean');
  });

  it.each([
    ['syntax_invalid', 'chưa đóng lại'],
    ['syntax_unterminated_string', 'dấu nháy'],
    ['syntax_colon', 'hai chấm'],
    ['indentation_expected', 'thụt vào'],
    ['indentation_unexpected', 'thụt vào'],
    ['type_concat', 'dấu `+`'],
    ['type_add', 'phép'],
    ['type_args', 'thiếu'],
    ['value_int', 'int()'],
    ['zero_division', 'chia'],
    ['index_error', 'danh sách'],
    ['key_error', 'khoá'],
    ['attribute_error', 'append'],
    ['module_not_found', 'thư viện'],
    ['eof_error', 'nhập'],
    ['recursion', 'dừng'],
    ['unbound_local', 'giá trị'],
    ['type_not_callable', 'không phải là hàm'],
  ] as const)('%s → câu tiếng Việt chứa "%s"', (key, expected) => {
    const info = translatePythonError(raw(key));
    expect(info.title + (info.hint ?? '')).toContain(expected);
  });

  it('không để lọt hướng dẫn tiếng Anh của Pyodide về micropip', () => {
    const info = translatePythonError(raw('module_not_found'));
    expect(info.title + (info.hint ?? '')).not.toMatch(/micropip|pyodide\.org/);
  });

  it('mọi lỗi trong fixture đều có câu tiếng Việt, không rơi vào câu chung', () => {
    for (const key of Object.keys(fixtures) as (keyof typeof fixtures)[]) {
      const info = translatePythonError(raw(key));
      expect(info.title, `${key} chưa có câu riêng`).not.toContain('mình chưa đọc được');
      expect(info.title, `${key} rơi vào câu chung`).not.toMatch(/^Chương trình dừng vì lỗi/);
    }
  });
});

describe('translatePythonError — chi tiết', () => {
  it('lấy dòng của code trẻ, bỏ qua các dòng bên trong Pyodide', () => {
    expect(translatePythonError(raw('index_error')).line).toBe(2);
    expect(translatePythonError(raw('type_args')).line).toBe(3);
  });

  it('đọc được cả thông báo một dòng mà grader.py trả về', () => {
    const info = translatePythonError("NameError: name 'diem' is not defined");
    expect(info.title).toContain('diem');
    expect(info.line).toBeUndefined();
  });

  it('giữ nguyên văn dòng lỗi để gỡ rối và để gửi cho AI', () => {
    expect(translatePythonError(raw('zero_division')).raw).toBe(
      'ZeroDivisionError: division by zero',
    );
  });

  it('lỗi lạ thì vẫn nêu tên lỗi trong câu chung, không ném exception', () => {
    const info = translatePythonError('MotLoiLa: chuyện gì đó');
    expect(info.title).toContain('MotLoiLa');
    expect(info.hint).toContain('gợi ý');
    expect(() => translatePythonError('')).not.toThrow();
  });

  it('đọc được cả lỗi Python không kết thúc bằng Error', () => {
    expect(translatePythonError('StopIteration: ').type).toBe('StopIteration');
  });

  it('không nhầm dòng "Traceback (most recent call last):" là dòng lỗi', () => {
    const info = translatePythonError(
      'Traceback (most recent call last):\n  File "<exec>", line 1, in <module>\nKeyError: \'b\'',
    );
    expect(info.type).toBe('KeyError');
  });

  it('không nói "sai" hay mắng trẻ trong bất kỳ câu nào', () => {
    for (const key of Object.keys(fixtures) as (keyof typeof fixtures)[]) {
      const info = translatePythonError(raw(key));
      expect(`${info.title} ${info.hint ?? ''}`.toLowerCase()).not.toMatch(/\bsai\b|ngu|dốt|tệ/);
    }
  });
});

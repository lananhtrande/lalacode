/**
 * Dịch lỗi Python sang tiếng Việt cho trẻ 10–15 tuổi.
 *
 * Nguyên tắc (docs/content-format.md §Giọng văn):
 * - Nói *chuyện gì xảy ra*, rồi *làm gì tiếp*. Không mắng, không "Sai!".
 * - Giữ nguyên tên lỗi và dòng lỗi để trẻ quen dần với thuật ngữ thật.
 *
 * Mẫu traceback thật lấy từ Pyodide nằm ở `pyodide-errors.fixture.json`.
 */

export interface PythonErrorInfo {
  /** Tên lỗi Python, ví dụ `NameError`. Rỗng nếu không nhận ra. */
  type: string;
  /** Câu chính, tiếng Việt. */
  title: string;
  /** Gợi ý việc nên làm tiếp. */
  hint?: string;
  /** Dòng trong code của trẻ, nếu tìm được. */
  line?: number;
  /** Nguyên văn dòng lỗi Python — để gỡ rối và để gửi cho dịch vụ gợi ý AI. */
  raw: string;
}

/** Chỉ lấy dòng của **code trẻ**: Pyodide dùng `<exec>`, grader.py dùng `bai-lam.py`. */
const STUDENT_FRAME = /File "(?:<exec>|bai-lam\.py)", line (\d+)/g;

/**
 * Dòng kết luận của traceback: `NameError: name 'x' is not defined`.
 * Không ép tên phải kết thúc bằng `Error`: Python còn có `StopIteration`,
 * `KeyboardInterrupt`, và học sinh/bài tập có thể tự đặt tên lỗi riêng.
 */
const ERROR_LINE = /^([A-Z][A-Za-z0-9_]*): ?(.*)$/;

interface Rule {
  type: string;
  /** Khớp với phần mô tả sau dấu hai chấm. Bỏ trống nghĩa là khớp mọi mô tả. */
  detail?: RegExp;
  build: (match: RegExpMatchArray | null, detail: string) => { title: string; hint?: string };
}

const RULES: Rule[] = [
  {
    type: 'NameError',
    detail: /name '([^']+)' is not defined\. Did you mean: '([^']+)'\?/,
    build: (match) => ({
      title: `Python chưa biết tên \`${match?.[1] ?? ''}\`.`,
      hint: `Có phải em định viết \`${match?.[2] ?? ''}\` không?`,
    }),
  },
  {
    type: 'NameError',
    detail: /name '([^']+)' is not defined/,
    build: (match) => ({
      title: `Python chưa biết tên \`${match?.[1] ?? ''}\`.`,
      hint: 'Em kiểm tra lại chính tả, hoặc tạo biến này trước khi dùng nhé.',
    }),
  },
  {
    type: 'SyntaxError',
    detail: /'(.)' was never closed/,
    build: (match) => ({
      title: `Em mở \`${match?.[1] ?? '('}\` mà chưa đóng lại.`,
      hint: 'Mỗi dấu mở đều cần một dấu đóng tương ứng.',
    }),
  },
  {
    type: 'SyntaxError',
    detail: /unterminated string literal/,
    build: () => ({
      title: 'Có một chuỗi chữ chưa đóng dấu nháy.',
      hint: 'Chữ cần nằm giữa hai dấu nháy, ví dụ `"Xin chào"`.',
    }),
  },
  {
    type: 'SyntaxError',
    detail: /expected ':'/,
    build: () => ({
      title: 'Dòng này còn thiếu dấu hai chấm `:` ở cuối.',
      hint: 'Sau `if`, `for`, `while` hay `def` đều cần dấu `:`.',
    }),
  },
  {
    type: 'SyntaxError',
    build: () => ({
      title: 'Python chưa hiểu dòng này.',
      hint: 'Em xem lại dấu ngoặc, dấu nháy và dấu hai chấm ở dòng đó nhé.',
    }),
  },
  {
    type: 'IndentationError',
    detail: /expected an indented block/,
    build: () => ({
      title: 'Sau dòng có dấu `:`, dòng tiếp theo phải thụt vào.',
      hint: 'Em thêm 4 dấu cách ở đầu dòng bên trong nhé.',
    }),
  },
  {
    type: 'IndentationError',
    build: () => ({
      title: 'Dòng này thụt vào không khớp với các dòng xung quanh.',
      hint: 'Các dòng cùng một khối phải thụt vào bằng nhau.',
    }),
  },
  {
    type: 'TabError',
    build: () => ({
      title: 'Code đang trộn phím Tab với dấu cách.',
      hint: 'Em chọn một kiểu thôi — dùng 4 dấu cách là tiện nhất.',
    }),
  },
  {
    type: 'TypeError',
    detail: /can only concatenate str \(not "(\w+)"\) to str/,
    build: (match) => ({
      title: `Không nối chữ với ${match?.[1] === 'int' ? 'số' : `kiểu \`${match?.[1] ?? ''}\``} bằng dấu \`+\` được.`,
      hint: 'Em đổi số thành chữ bằng `str(...)`, hoặc dùng f-string: `f"tuổi: {tuoi}"`.',
    }),
  },
  {
    type: 'TypeError',
    detail: /unsupported operand type\(s\) for ([^:]+): '(\w+)' and '(\w+)'/,
    build: (match) => ({
      title: `Không dùng được phép \`${match?.[1] ?? ''}\` giữa kiểu \`${match?.[2] ?? ''}\` và \`${match?.[3] ?? ''}\`.`,
      hint: 'Hai bên của phép tính phải cùng loại. Số dùng `int(...)`, chữ dùng `str(...)`.',
    }),
  },
  {
    type: 'TypeError',
    detail: /(\w+)\(\) missing (\d+) required positional argument/,
    build: (match) => ({
      title: `Gọi hàm \`${match?.[1] ?? ''}\` còn thiếu ${match?.[2] ?? ''} thông tin.`,
      hint: 'Em xem lại hàm cần bao nhiêu tham số rồi điền đủ vào trong ngoặc nhé.',
    }),
  },
  {
    type: 'TypeError',
    detail: /(\w+)\(\) takes (\d+) positional arguments? but (\d+) (?:was|were) given/,
    build: (match) => ({
      title: `Hàm \`${match?.[1] ?? ''}\` chỉ nhận ${match?.[2] ?? ''} thông tin, nhưng em đưa ${match?.[3] ?? ''}.`,
      hint: 'Em bớt bớt phần trong ngoặc cho khớp nhé.',
    }),
  },
  {
    type: 'TypeError',
    detail: /'(\w+)' object is not callable/,
    build: (match) => ({
      title: `\`${match?.[1] ?? ''}\` không phải là hàm nên không gọi bằng \`()\` được.`,
      hint: 'Có thể em đặt tên biến trùng tên một hàm. Thử đổi tên biến xem sao.',
    }),
  },
  {
    type: 'TypeError',
    detail: /'(\w+)' object is not subscriptable/,
    build: (match) => ({
      title: `Kiểu \`${match?.[1] ?? ''}\` không lấy phần tử bằng \`[...]\` được.`,
      hint: 'Cách này chỉ dùng cho danh sách, chuỗi hay từ điển.',
    }),
  },
  {
    type: 'ValueError',
    detail: /invalid literal for int\(\) with base 10: '([^']*)'/,
    build: (match) => ({
      title: `\`int()\` không đổi được \`${match?.[1] ?? ''}\` thành số.`,
      hint: 'Chỉ chữ gồm toàn chữ số mới đổi được, ví dụ `int("10")`.',
    }),
  },
  {
    type: 'ZeroDivisionError',
    build: () => ({
      title: 'Không chia được cho 0.',
      hint: 'Trước khi chia, em kiểm tra số chia có khác 0 không nhé.',
    }),
  },
  {
    type: 'IndexError',
    build: () => ({
      title: 'Em lấy phần tử ở vị trí không có trong danh sách.',
      hint: 'Phần tử đầu tiên là `[0]`, nên danh sách 3 phần tử chỉ có `[0]`, `[1]`, `[2]`.',
    }),
  },
  {
    type: 'KeyError',
    build: (_match, detail) => ({
      title: `Từ điển không có khoá ${detail || 'này'}.`,
      hint: 'Em kiểm tra lại tên khoá, chú ý chữ hoa chữ thường.',
    }),
  },
  {
    type: 'AttributeError',
    detail: /'([\w.]+)' object has no attribute '(\w+)'/,
    build: (match) => ({
      title: `Kiểu \`${match?.[1] ?? ''}\` không có \`${match?.[2] ?? ''}\`.`,
      hint: 'Em xem lại tên lệnh — ví dụ danh sách thì dùng `append`, không phải `push`.',
    }),
  },
  {
    type: 'ModuleNotFoundError',
    detail: /No module named '([^']+)'/,
    build: (match) => ({
      title: `Bài này không dùng được thư viện \`${match?.[1] ?? ''}\`.`,
      hint: 'Em chỉ cần những lệnh đã học trong bài là đủ làm bài này rồi.',
    }),
  },
  {
    type: 'EOFError',
    build: () => ({
      title: 'Chương trình đang đợi em nhập, nhưng bài này không có dữ liệu nhập.',
      hint: 'Em bỏ bớt lệnh `input()`, hoặc dùng dữ liệu mà đề bài cho sẵn.',
    }),
  },
  {
    type: 'RecursionError',
    build: () => ({
      title: 'Hàm tự gọi chính nó mãi mà không dừng.',
      hint: 'Hàm đệ quy cần một trường hợp dừng, ví dụ `if n == 0: return 1`.',
    }),
  },
  {
    type: 'UnboundLocalError',
    detail: /local variable '([^']+)'|variable '([^']+)' where it is not associated/,
    build: (match) => ({
      title: `Biến \`${match?.[1] ?? match?.[2] ?? ''}\` trong hàm chưa có giá trị mà đã được dùng.`,
      hint: 'Em gán giá trị đầu tiên cho biến trước khi cộng/trừ nó nhé.',
    }),
  },
  {
    type: 'KeyboardInterrupt',
    build: () => ({ title: 'Chương trình đã bị dừng giữa chừng.' }),
  },
];

function findErrorLine(rawError: string): { type: string; detail: string; raw: string } {
  const lines = rawError.split('\n');
  for (let index = lines.length - 1; index >= 0; index -= 1) {
    const line = lines[index]?.trim() ?? '';
    const match = ERROR_LINE.exec(line);
    if (match?.[1]) return { type: match[1], detail: match[2] ?? '', raw: line };
  }
  const fallback = lines.filter((line) => line.trim() !== '').pop() ?? rawError;
  return { type: '', detail: '', raw: fallback.trim() };
}

function findStudentLine(rawError: string): number | undefined {
  let line: number | undefined;
  for (const match of rawError.matchAll(STUDENT_FRAME)) {
    const value = Number(match[1]);
    if (Number.isInteger(value)) line = value;
  }
  return line;
}

/**
 * Nhận traceback (hoặc chỉ một dòng `NameError: ...` như grader.py trả về) và
 * trả về thông tin đã dịch. Không bao giờ ném lỗi: không nhận ra thì trả câu chung.
 */
export function translatePythonError(rawError: string): PythonErrorInfo {
  const { type, detail, raw } = findErrorLine(rawError);
  const line = findStudentLine(rawError);

  for (const rule of RULES) {
    if (rule.type !== type) continue;
    const match = rule.detail ? rule.detail.exec(detail) : null;
    if (rule.detail && !match) continue;
    const { title, hint } = rule.build(match, detail);
    return {
      type,
      title,
      ...(hint === undefined ? {} : { hint }),
      ...(line === undefined ? {} : { line }),
      raw,
    };
  }

  return {
    type,
    title: type
      ? `Chương trình dừng vì lỗi \`${type}\`.`
      : 'Chương trình dừng vì một lỗi mình chưa đọc được.',
    hint: 'Em đọc dòng lỗi bên dưới, hoặc bấm nút gợi ý nhé.',
    ...(line === undefined ? {} : { line }),
    raw,
  };
}

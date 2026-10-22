# Định dạng nội dung & nguyên tắc sư phạm

Nội dung là dữ liệu. Schema chuẩn nằm ở `packages/content-schema` (zod); tài liệu này mô tả nó cho người viết.

## Cấu trúc thư mục

```
content/courses/<course-id>/
  course.json
  lessons/<NN>-<lesson-slug>/
    lesson.json          # metadata bài học
    lesson.md            # nội dung đọc (Markdown)
    exercises/<NN>-<exercise-slug>.json
```

`id` là chuỗi ổn định, không đổi khi sửa tiêu đề: `py-khoi-dong`, `py-khoi-dong.01-xin-chao`, `py-khoi-dong.01-xin-chao.01-in-loi-chao`. `id` bài tập = `id` bài học + `.` + tên file (bỏ `.json`). Ví dụ đầy đủ: `content/courses/py-khoi-dong/`.

## `course.json`

```json
{
  "id": "py-khoi-dong",
  "title": "Python khởi động",
  "summary": "Làm quen với Python qua 20 bài ngắn.",
  "ageRange": [10, 15],
  "authorId": "core",
  "order": ["01-xin-chao", "02-bien"],
  "status": "draft"
}
```

## `lesson.json`

```json
{
  "id": "py-khoi-dong.01-xin-chao",
  "title": "Xin chào, Python!",
  "concepts": ["print", "chuỗi"],
  "estimatedMinutes": 10,
  "video": { "provider": "youtube-nocookie", "videoId": "XXXXXXXXXXX", "durationSec": 360 },
  "exercises": ["01-in-loi-chao", "02-in-hai-dong"],
  "status": "draft"
}
```

`video` là tuỳ chọn. Giai đoạn 0 chỉ dùng `youtube-nocookie` hoặc `hls` (đường dẫn trên CloudFront).

## Bài tập (`exercises/*.json`)

```json
{
  "id": "py-khoi-dong.01-xin-chao.01-in-loi-chao",
  "title": "In lời chào",
  "kind": "code",
  "prompt": "Viết chương trình in ra dòng chữ `Xin chào, Python!`",
  "starterCode": "# Viết code của em ở dưới\n",
  "solution": "print(\"Xin chào, Python!\")",
  "tests": [
    { "type": "stdout_equals", "expected": "Xin chào, Python!\n", "message": "Em kiểm tra lại dấu phẩy và chữ hoa nhé." }
  ],
  "hints": [
    "Lệnh để in ra màn hình là `print`.",
    "Chữ cần in phải nằm trong dấu ngoặc kép.",
    "Ví dụ tương tự: `print(\"Chào bạn\")`."
  ],
  "timeoutMs": 5000,
  "turtle": false
}
```

### Các loại test (`tests[].type`)

| type | Trường | Ý nghĩa |
| --- | --- | --- |
| `stdout_equals` | `expected`, `stdin?` | Output khớp chính xác (chuẩn hoá xuống dòng cuối) |
| `stdout_contains` | `expected`, `stdin?` | Output chứa chuỗi |
| `variable_equals` | `name`, `expected` (JSON) | Biến toàn cục có giá trị |
| `function_returns` | `name`, `args` (JSON[]), `expected` | Gọi hàm học sinh viết |
| `python_assert` | `code` | Đoạn Python tuỳ ý chạy sau code học sinh; dùng khi các loại trên không đủ |

Mỗi test có `message`: câu tiếng Việt thân thiện hiện khi test fail. Không lộ đáp án trong `message`.

### Quy tắc bắt buộc (script kiểm tra)
- `solution` pass **tất cả** test; `starterCode` fail **ít nhất một** test (`npm run content:verify`).
- Đúng 3 `hints`, tăng dần mức độ; hint 3 là ví dụ **tương tự**, không phải lời giải.
- `prompt` ≤ 400 ký tự; `starterCode` ≤ 20 dòng.
- Chỉ dùng thư viện chuẩn của Python có trong Pyodide; không mạng, không file.

### `npm run content:check` kiểm tra những gì

Schema (`packages/content-schema`) chạy ở chế độ chặt: **trường lạ là lỗi**, nên gõ sai tên trường sẽ bị bắt ngay thay vì bị bỏ qua lặng lẽ. Ngoài các giới hạn ở trên, script còn kiểm tra quan hệ giữa các file:

| Luật | Mức |
| --- | --- |
| `id` khớp đường dẫn (`course.id` = tên thư mục; `lesson.id` = `<khoá>.<thư-mục-bài>`; `exercise.id` = `<lesson.id>.<tên-file>`) | lỗi |
| `course.order` khớp đúng danh sách thư mục bài trên đĩa, không thiếu, không thừa, không trùng | lỗi |
| `lesson.exercises` khớp đúng các file trong `exercises/`, không thiếu, không thừa, không trùng | lỗi |
| `lesson.md` tồn tại và không rỗng | lỗi |
| Không gợi ý nào chứa nguyên văn `solution` | lỗi |
| Bài `published` nhưng có dưới 3 bài tập | cảnh báo |
| Khoá `published` mà bài vẫn `draft` | cảnh báo |
| `turtle: true` nhưng lời giải không dùng `turtle` | cảnh báo |

Cảnh báo không làm script đỏ; lỗi thì có. Đường dẫn là nguồn sự thật — khi `id` lệch, script báo theo tên thư mục/file.

Việc chạy thật lời giải và starter là của `npm run content:verify`: nó gọi `scripts/grader.py` bằng CPython 3.12+, lời giải phải pass hết test và starter phải fail ít nhất một test.

### Thứ gì tới được trình duyệt

`npm run content:build` sinh bundle cho web và **bỏ trường `solution`**: trẻ mở devtools sẽ không thấy đáp án. `tests`, `hints`, `starterCode`, `prompt` thì có trong bundle vì việc chạy và chấm diễn ra ngay trên máy. Vì vậy:

- Đừng viết đáp án trong `prompt`, `hints` hay `message` của test.
- `solution` chỉ dùng cho `content:verify` và (sau này) cho dịch vụ gợi ý AI ở phía server.

### Bài có vẽ hình (`turtle: true`)

Rùa là **bản tự viết** (`apps/web/src/runner/turtle.py`), không phải `turtle` của CPython — bản thật cần tkinter nên không chạy được cả trên web lẫn trong `content:verify`. Chỉ dùng những lệnh có trong bảng này; cần thêm lệnh thì sửa `turtle.py` trước, đừng để bài học tự chế:

| Nhóm | Lệnh |
| --- | --- |
| Di chuyển | `forward`/`fd`, `backward`/`bk`, `right`/`rt`, `left`/`lt`, `goto`/`setpos`, `setx`, `sety`, `setheading`/`seth`, `home`, `circle`, `dot` |
| Bút | `penup`/`pu`, `pendown`/`pd`, `pensize`/`width`, `pencolor`, `color`, `fillcolor`, `begin_fill`, `end_fill` |
| Hiển thị | `hideturtle`/`ht`, `showturtle`/`st`, `speed` (không có tác dụng), `clear`, `reset`, `done`, `exitonclick`, `mainloop` |
| Đọc trạng thái | `position`/`pos`, `xcor`, `ycor`, `heading`, `isdown` |

Dùng được cả `import turtle` rồi `turtle.forward(60)`, lẫn `t = turtle.Turtle()`.

Toạ độ như turtle thật: gốc ở giữa, trục y hướng lên, 0 độ là hướng phải. Màu nhận tên tiếng Anh (`"red"`, `"blue"`) hoặc mã hex.

Test cho bài vẽ hình: dùng `python_assert` hoặc `variable_equals` để kiểm tra **vị trí/hướng của rùa** (`turtle.xcor()`, `turtle.heading()`), vì hiện chưa có cách so sánh hình vẽ.

## Nguyên tắc sư phạm (trẻ 10–15 tuổi)

- **Một khái niệm mới mỗi bài.** 2 phút đọc/xem + 3–5 bài tập, tổng ≤ 15 phút.
- **Làm trước, giải thích sau:** bài tập đầu tiên luôn chạy được ngay bằng cách sửa 1 dòng.
- **Ví dụ gần gũi trẻ Việt:** điểm kiểm tra, tiền tiêu vặt, đội bóng, nấu ăn, trò chơi — tránh ví dụ người lớn (lương, thuế, hẹn hò).
- **Có hình:** ít nhất 1/3 bài tập trong khoá đầu dùng `turtle` hoặc mini-game chữ.
- Bám chương trình Tin học: khoá "Chuẩn bị lớp 10" dùng đúng thuật ngữ SGK Kết nối tri thức.

## Huy hiệu (giai đoạn 0)

Sáu huy hiệu đầu nằm ở `apps/web/src/progress/badges.ts`, chữ hiển thị ở `shared/i18n/vi.ts`. Tất cả **khen nỗ lực và thói quen**, không khen "giỏi":

| Mã | Tên | Điều kiện |
| --- | --- | --- |
| `bai-dau-tien` | Bài đầu tiên | Xong một bài tập bất kỳ |
| `nam-bai-tap` | Năm bài liền tay | Xong 5 bài tập |
| `xong-bai-hoc` | Trọn một bài học | Xong hết bài tập của một bài học |
| `ba-ngay-lien` | Ba ngày liên tiếp | Học 3 ngày liền nhau |
| `bay-ngay-lien` | Bảy ngày liên tiếp | Học 7 ngày liền nhau |
| `kien-tri` | Không bỏ cuộc | Thử lại ≥ 5 lần rồi làm đạt |

Thêm huy hiệu mới thì thêm luật vào `badges.ts` **và** chữ vào `vi.ts`; điều kiện phải tính được chỉ từ tiến độ trên máy.

## Giọng văn
- Xưng "em", gọi trẻ là "em"; hệ thống tự xưng "mình" hoặc tên linh vật.
- Câu ngắn (≤ 20 từ), động từ chủ động. Khen nỗ lực, không khen "thông minh".
- Lỗi: "Chưa đúng rồi, thử lại nhé!" thay vì "Sai". Không dùng dấu chấm than liên tục, không emoji tràn lan (tối đa 1/màn).
- Thuật ngữ tiếng Anh giữ nguyên trong code (`print`, `if`), giải thích bằng tiếng Việt lần đầu xuất hiện.

## Quy trình viết bài
Dùng skill `new-lesson` → `npm run content:check && npm run content:verify` → agent `content-reviewer` → đổi `status` sang `"published"` khi người duy trì duyệt.

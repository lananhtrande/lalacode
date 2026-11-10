# Video 18 — Trò đoán chữ

**Khái niệm:** từ khoá `in`, `True`/`False`, `for` qua từng chữ cái · **Thời lượng:** ~4 phút 30 · **Bài tập đi kèm:** Có chữ đó không, Đọc từng chữ, Đếm nguyên âm, Đoán chữ cái

**Sau video, em biết:** kiểm tra một chữ có nằm trong từ bằng `in`; `True`/`False` dùng thẳng trong `if`; `in` dùng được với danh sách; đi qua từng chữ cái; ghép lại thành trò đoán chữ.

---

## Cảnh 1 · 0:00–0:30 · Mở đầu
**Hình:** Một tấm bảng trò chơi đoán chữ tự thiết kế (không dựa trên chương trình truyền hình nào): các ô chữ úp. Lala đoán chữ "m", ô chữ lật lên.
**Trên màn hình:** `Bài 18 · Trò đoán chữ`
**Lời đọc:**
> Chào em! Em đã bao giờ chơi trò đoán chữ chưa? Người chơi đoán một chữ cái, nếu chữ đó có trong từ bí mật thì ô chữ lật lên. Hôm nay, mình sẽ học hai mảnh ghép để tự làm trò này bằng Python.

## Cảnh 2 · 0:30–1:05 · Từ khoá `in`
**Hình:** Từ "con mèo" là một dãy ô. Chữ "m" bay dọc theo dãy, gặp ô "m" thì sáng xanh: `True`. Chữ "z" bay hết dãy không gặp: `False` màu xám.
**Trên màn hình:**
```python
tu = "con mèo"
print("m" in tu)   # True
print("z" in tu)   # False
```
**Lời đọc:**
> Từ khoá "in" hỏi máy: chữ này có nằm trong từ kia không? Chữ m có trong con mèo, máy trả lời "tru". Chữ z thì không có, máy trả lời "phôn". True nghĩa là đúng, False nghĩa là sai. Đây là hai giá trị đặc biệt, viết hoa chữ đầu.

## Cảnh 3 · 1:05–1:35 · Dùng `in` với `if` và danh sách
**Hình:** Dòng `if` sáng lên khi nhận `True`. Sau đó danh sách bạn bè; chữ "Lan" được tìm thấy trong danh sách, có dấu ✓.
**Trên màn hình:**
```python
if "m" in tu:
    print("Có chữ m")

ban = ["Lan", "Minh"]
if "Lan" in ban:
    print("Lan có trong lớp")
```
**Lời đọc:**
> Vì kết quả là đúng hoặc sai, em đặt thẳng nó vào if được. Nếu chữ m có trong từ, thì in Có chữ m. Và in còn dùng được với danh sách nữa: hỏi xem Lan có trong danh sách bạn không.

## Cảnh 4 · 1:35–2:05 · Đi qua từng chữ cái
**Hình:** Từ "mèo" tách ra; từng chữ m, è, o lần lượt nhảy xuống hộp `chu` rồi in ra mỗi chữ một dòng.
**Trên màn hình:**
```python
for chu in "mèo":
    print(chu)
```
Kết quả: `m` / `è` / `o`
**Lời đọc:**
> Vòng lặp for đi qua được từng chữ cái của một từ, giống như đi qua từng toa tàu của danh sách. Mỗi lượt, biến chữ nhận một chữ cái. Python hiểu cả chữ có dấu tiếng Việt: e có dấu huyền là một chữ cái.

## Cảnh 5 · 2:05–2:40 · Ghép lại: đếm nguyên âm
**Hình:** Bộ đếm số bên cạnh; mỗi chữ cái đi qua cổng "có trong aeiou?" — đúng thì bộ đếm cộng 1 kèm tiếng "ting".
**Trên màn hình:**
```python
tu = "banana"
dem = 0
for chu in tu:
    if chu in "aeiou":
        dem += 1
print(dem)   # 3
```
**Lời đọc:**
> Ghép for và in lại, em đếm được nguyên âm. Đi qua từng chữ cái. Nếu chữ đó nằm trong chuỗi a e i o u, cộng thêm một vào bộ đếm. Từ banana có ba chữ a, nên máy in ba. Thêm một vòng while và input nữa là em có trò đoán chữ hoàn chỉnh, như bài tập cuối.

## Cảnh 6 · 2:40–3:20 · Lala thử ngay: kiểm tra mật khẩu bí mật
**Hình:** Một cánh cửa có ổ khoá; chữ người dùng gõ bay tới ổ khoá, nếu có chữ số thì cửa sáng xanh.
**Trên màn hình:**
```python
mat_khau = input()
co_so = False
for chu in mat_khau:
    if chu in "0123456789":
        co_so = True
print(co_so)
```
**Lời đọc:**
> Lala muốn kiểm tra xem mật khẩu có chứa ít nhất một chữ số không. Bạn ấy đặt biến có số bằng False từ đầu. Rồi đi qua từng ký tự. Ký tự nào nằm trong chuỗi các chữ số thì đổi có số thành True. Cuối cùng in ra. Mẹo này rất hay: bắt đầu bằng False, chỉ cần gặp một lần đúng là đổi thành True.

## Cảnh 7 · 3:20–4:00 · Dừng lại thử nhé!
**Trên màn hình:**
```python
print("an" in "con mèo")
print("Mèo" in "con mèo")
```
**Lời đọc:**
> Đố em: hai dòng này in ra gì? Tạm dừng nhé. … Cả hai đều là False! Trong "con mèo" có "on" nhưng không có "an". Còn Mèo viết hoa thì khác mèo viết thường. Máy phân biệt chữ hoa, chữ thường đấy, em cẩn thận nhé!

## Cảnh 8 · 4:00–4:30 · Tóm tắt và bài tập
**Trên màn hình:** ① `"m" in tu` → `True`/`False` · ② Dùng thẳng trong `if` · ③ `in` chạy với cả danh sách · ④ `for chu in tu:` từng chữ cái
**Lời đọc:**
> Tóm lại: in hỏi có nằm trong không, trả về True hoặc False. Dùng thẳng trong if, dùng được với cả danh sách. Và for đi qua từng chữ cái. Giờ em làm trò đoán chữ trong bài tập nhé. Hẹn gặp em ở bài sau!

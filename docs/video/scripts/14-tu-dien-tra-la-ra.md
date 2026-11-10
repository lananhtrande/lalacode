# Video 14 — Từ điển: tra là ra

**Khái niệm:** dict, khoá, giá trị, thêm/sửa mục, `for` qua từ điển · **Thời lượng:** ~4 phút 10 · **Bài tập đi kèm:** Tra điểm một môn, Thêm một môn, Liệt kê bảng điểm, Môn điểm cao nhất

**Sau video, em biết:** khi nào dùng từ điển thay danh sách; viết từ điển với khoá và giá trị; tra, thêm, sửa; đi qua từng khoá; khoá phải viết đúng y hệt.

---

## Cảnh 1 · 0:00–0:30 · Mở đầu
**Hình:** Lala lật một cuốn từ điển giấy: tìm chữ "mèo" → ra nghĩa. Rồi Lala cầm bảng điểm: "Toán mấy điểm nhỉ?"
**Trên màn hình:** `Bài 14 · Từ điển: tra là ra`
**Lời đọc:**
> Chào em! Danh sách tìm theo số thứ tự: phần tử số không, số một. Nhưng nếu Lala muốn hỏi: điểm môn Toán là mấy? Mình đâu nhớ Toán nằm ở vị trí số mấy. Lúc đó, ta dùng từ điển: tra bằng tên là ra ngay.

## Cảnh 2 · 0:30–1:05 · Khoá và giá trị
**Hình:** Một tủ có các ngăn kéo; mỗi ngăn dán nhãn tên môn (khoá), bên trong là điểm (giá trị). Code hiện cạnh tủ; ngoặc nhọn tô sáng, dấu hai chấm nối nhãn với giá trị.
**Trên màn hình:**
```python
diem = {"Toán": 9, "Văn": 7}
print(diem["Toán"])   # 9
```
**Lời đọc:**
> Từ điển viết trong cặp ngoặc nhọn. Mỗi mục có hai phần. Phần đứng trước dấu hai chấm là khoá, giống cái nhãn trên ngăn kéo. Phần đứng sau là giá trị, thứ nằm trong ngăn. Muốn tra, em viết tên từ điển, rồi khoá trong ngoặc vuông. Diem, Toán, ra chín. Tra là ra!

## Cảnh 3 · 1:05–1:35 · Thêm và sửa
**Hình:** Một ngăn kéo mới "Anh" mọc ra, số 8 rơi vào. Ngăn "Văn" mở ra, số 7 bị thay bằng 8.
**Trên màn hình:**
```python
diem["Anh"] = 8   # thêm mới
diem["Văn"] = 8   # sửa lại
```
**Lời đọc:**
> Thêm một môn mới rất dễ: viết khoá mới trong ngoặc vuông, rồi dấu bằng, rồi giá trị. Nếu khoá đã có sẵn, cùng cách viết đó sẽ sửa giá trị cũ. Khoá mới thì thêm, khoá cũ thì sửa.

## Cảnh 4 · 1:35–2:00 · Đi qua từng mục
**Hình:** Một bàn tay mở lần lượt từng ngăn kéo; mỗi lần, nhãn bay vào hộp `mon`, rồi in dòng "Toán: 9", "Văn: 8", "Anh: 8".
**Trên màn hình:**
```python
for mon in diem:
    print(f"{mon}: {diem[mon]}")
```
**Lời đọc:**
> Vòng lặp for đi qua từ điển sẽ lần lượt lấy từng khoá. Biến mon nhận Toán, rồi Văn, rồi Anh. Còn diem mon là giá trị của khoá đó. Thế là em in được cả bảng điểm.

## Cảnh 5 · 2:00–2:25 · Khoá phải viết đúng y hệt
**Hình:** Lala tra `diem["toán"]` (chữ t thường) → ngăn kéo không mở, ⚠ `KeyError`. Kính lúp phóng to chữ T hoa ở nhãn ngăn kéo.
**Trên màn hình:** ✗ `diem["toán"]` → ⚠ `KeyError` · ✓ `diem["Toán"]`
**Lời đọc:**
> Chú ý nhé: khoá phải viết đúng y hệt. Toán viết hoa và toán viết thường là hai khoá khác nhau. Tra sai một chữ, máy sẽ báo lỗi "ki ơ-rơ", nghĩa là không tìm thấy khoá đó.

## Cảnh 6 · 2:25–3:05 · Lala thử ngay: từ điển Anh – Việt mini
**Hình:** Những tấm thẻ từ vựng hai mặt: mặt trước tiếng Anh, mặt sau tiếng Việt; tra 'cat' thì thẻ lật ra 'con mèo'.
**Trên màn hình:**
```python
tu_dien = {"cat": "con mèo", "dog": "con chó"}
tu = input()
print(tu_dien[tu])
```
**Lời đọc:**
> Lala làm một cuốn từ điển Anh Việt nhỏ. Khoá là từ tiếng Anh, giá trị là nghĩa tiếng Việt. Người dùng gõ cat, máy tra khoá cat và in ra con mèo. Đúng như tên bài: tra là ra! Nhưng nếu người dùng gõ một từ không có trong từ điển, máy sẽ báo lỗi. Sau này em sẽ học cách kiểm tra trước bằng từ khoá in.

## Cảnh 7 · 3:05–3:35 · Dừng lại thử nhé!
**Trên màn hình:**
```python
tuoi = {"Lan": 12, "Minh": 11}
tuoi["Minh"] = 12
print(tuoi)
```
**Lời đọc:**
> Đố em: máy in ra gì? Tạm dừng nhé. … Khoá Minh đã có, nên giá trị được sửa thành mười hai. Từ điển giờ là Lan mười hai, Minh mười hai.

## Cảnh 8 · 3:35–4:10 · Tóm tắt và bài tập
**Trên màn hình:** ① `{khoá: giá trị}` · ② Tra: `diem["Toán"]` · ③ Khoá mới thì thêm, khoá cũ thì sửa · ④ `for mon in diem:` lấy từng khoá · ⑤ Khoá viết đúng y hệt
**Lời đọc:**
> Tóm lại: từ điển gồm khoá và giá trị, tra bằng khoá. Gán vào khoá mới thì thêm, khoá cũ thì sửa. For lấy từng khoá. Và khoá phải viết đúng y hệt. Giờ em làm bảng điểm và tìm môn điểm cao nhất trong bài tập nhé. Hẹn gặp em ở bài sau!

# Video 04 — Máy hỏi, em trả lời

**Khái niệm:** `input`, f-string · **Thời lượng:** ~4 phút 40 · **Bài tập đi kèm:** Chào người ta, Xin chào kèm tên, Hai câu hỏi

**Sau video, em biết:** `input()` dừng lại chờ người dùng gõ; cất câu trả lời vào biến; ghép chữ và biến bằng f-string; hai lỗi hay gặp với f-string.

---

## Cảnh 1 · 0:00–0:30 · Mở đầu
**Hình:** Lala nói chuyện với máy tính, máy chỉ lặp lại đúng một câu "Xin chào!" dù Lala hỏi gì. Lala chán nản.
**Trên màn hình:** `Bài 4 · Máy hỏi, em trả lời`
**Lời đọc:**
> Chào em! Tới giờ, chương trình của mình chạy lần nào cũng giống hệt nhau. Lala hỏi gì máy cũng chỉ nói đúng một câu. Chán quá phải không? Hôm nay mình sẽ dạy máy biết hỏi, và biết nghe câu trả lời.

## Cảnh 2 · 0:30–1:10 · `input()` chờ em gõ
**Hình:** Code hiện ra. Khi chạy, khung kết quả hiện con trỏ nhấp nháy, một đồng hồ cát nhỏ xoay — máy đang chờ. Bàn tay hoạt hình gõ chữ "Lan", nhấn Enter. Chữ "Lan" bay vào hộp nhãn `ten`, rồi in ra.
**Trên màn hình:**
```python
ten = input()
print(ten)
```
**Lời đọc:**
> Lệnh "in-pút" nghĩa là nhập vào. Khi gặp input, máy dừng lại, chờ người dùng gõ một thứ gì đó rồi nhấn Enter. Chữ người ta gõ được cất ngay vào hộp ten. Dòng sau in hộp ten ra. Người dùng gõ Lan, máy in Lan. Gõ Minh, máy in Minh. Lần đầu tiên, chương trình của em mỗi lần chạy có thể ra một kết quả khác!

## Cảnh 3 · 1:10–1:45 · Ghép chữ với biến: f-string
**Hình:** Một câu "Xin chào ___!" có chỗ trống. Hộp `ten` bay tới, chữ "Lan" rơi vào chỗ trống. Sau đó code f-string hiện, tô sáng chữ `f` (nhãn "nhớ chữ f"), và `{ten}` (nhãn "chỗ trống điền biến").
**Trên màn hình:**
```python
ten = input()
print(f"Xin chào {ten}!")
```
Kết quả: `Xin chào Lan!`
**Lời đọc:**
> Bây giờ mình muốn máy nói cả câu: Xin chào Lan! Em dùng một cách viết gọi là f-string. Em thêm chữ f ngay trước dấu ngoặc kép. Rồi ở chỗ muốn điền tên, em đặt tên biến trong cặp ngoặc nhọn. Giống như một câu có chỗ trống, máy sẽ tự điền thứ trong hộp vào chỗ trống ấy.

## Cảnh 4 · 1:45–2:25 · Hai lỗi hay gặp
**Hình:** Hai thẻ "Sai — Đúng". Thẻ 1: quên chữ `f` → máy in nguyên văn `Xin chào {ten}!`, Lala bật cười. Thẻ 2: viết `"{ten}"` trong ngoặc kép riêng / chữ f cách xa dấu nháy → ⚠. Thẻ "Đúng" sáng ✓.
**Trên màn hình:** ✗ `print("Xin chào {ten}!")` → `Xin chào {ten}!` · ✗ `print(f "Xin chào {ten}!")` · ✓ `print(f"Xin chào {ten}!")`
**Lời đọc:**
> Có hai lỗi các bạn hay gặp. Thứ nhất, quên chữ f. Khi đó máy không điền gì cả, mà in nguyên văn cả cặp ngoặc nhọn ra màn hình, trông rất buồn cười. Thứ hai, chữ f phải nằm sát ngay trước dấu ngoặc kép, không có dấu cách ở giữa. Nhớ hai điều đó là f-string của em sẽ chạy ngon lành.

## Cảnh 5 · 2:25–2:55 · Hai câu hỏi
**Hình:** Máy hỏi hai lần, hai hộp `ten` và `mon` lần lượt được lấp đầy, rồi cùng rơi vào câu "___ thích môn ___".
**Trên màn hình:**
```python
ten = input()
mon = input()
print(f"{ten} thích môn {mon}")
```
Kết quả: `Lan thích môn Toán`
**Lời đọc:**
> Muốn hỏi hai câu thì dùng hai lần input, cất vào hai cái hộp. Trong f-string, em đặt bao nhiêu cặp ngoặc nhọn cũng được. Ở bài tập trên LaLaKode, phần người dùng gõ đã được chuẩn bị sẵn, nên em không cần gõ tay đâu.

## Cảnh 6 · 2:55–3:35 · Lala thử ngay: máy chào hỏi thân thiện
**Hình:** Máy tính hỏi tên và lớp; mỗi câu trả lời rơi vào một hộp, rồi cùng bay vào một bong bóng lời thoại.
**Trên màn hình:**
```python
ten = input()
lop = input()
print(f"Chào {ten}!")
print(f"{ten} học lớp {lop} nhé.")
```
**Lời đọc:**
> Lala làm một chiếc máy chào hỏi. Máy hỏi hai câu: tên và lớp. Rồi máy nói hai câu, dùng f-string để điền tên và lớp vào. Để ý biến ten được dùng hai lần ở hai câu khác nhau. Cất vào hộp một lần, dùng lại bao nhiêu lần cũng được, đó là sức mạnh của biến mà em học ở bài hai.

## Cảnh 7 · 3:35–4:05 · Dừng lại thử nhé!
**Hình:** Đồng hồ đếm. Ghi chú "Người dùng gõ: Minh".
**Trên màn hình:**
```python
ten = input()
print(f"Chào {ten}, chào {ten}!")
```
**Lời đọc:**
> Đố em: nếu người dùng gõ Minh, máy in ra gì? Tạm dừng nhé. … Đáp án là: Chào Minh, chào Minh! Một biến dùng hai lần trong cùng một câu cũng được.

## Cảnh 8 · 4:05–4:40 · Tóm tắt và bài tập
**Trên màn hình:** ① `input()` chờ người dùng gõ · ② Cất vào biến: `ten = input()` · ③ f-string: `f"... {ten} ..."` · ④ Chữ `f` sát dấu nháy
**Lời đọc:**
> Tóm lại: input chờ người dùng gõ, câu trả lời cất vào biến. Muốn ghép chữ với biến, dùng f-string: chữ f sát trước ngoặc kép, tên biến trong ngoặc nhọn. Giờ em thử cho máy chào người dùng trong bài tập nhé. Hẹn gặp em ở bài sau, mình sẽ cho máy làm toán!

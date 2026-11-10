# Video 13 — Danh sách thông minh hơn

**Khái niệm:** `max`, `min`, `sorted`, lọc bằng `for` + `if` + `append` · **Thời lượng:** ~4 phút · **Bài tập đi kèm:** Cao nhất thấp nhất, Xếp theo thứ tự, Chọn điểm giỏi, Bạn nào tên dài

**Sau video, em biết:** tìm số lớn nhất, nhỏ nhất; xếp danh sách bằng `sorted` (tạo danh sách mới); lọc phần tử theo điều kiện; nhớ tạo danh sách rỗng trước.

---

## Cảnh 1 · 0:00–0:30 · Mở đầu
**Hình:** Lala đứng trước bảng điểm cả lớp, dò từng dòng bằng ngón tay, mắt hoa lên. Một chiếc robot nhỏ chạy tới phân loại giúp.
**Trên màn hình:** `Bài 13 · Danh sách thông minh hơn`
**Lời đọc:**
> Chào em! Em đã biết tạo danh sách, thêm phần tử, đếm và cộng. Hôm nay, mình sẽ làm danh sách thông minh hơn: tìm điểm cao nhất, thấp nhất, xếp theo thứ tự, và chọn ra những điểm giỏi.

## Cảnh 2 · 0:30–0:55 · Lớn nhất, nhỏ nhất
**Hình:** Bốn cột điểm 8, 5, 10, 7 như bốn toà nhà. `max` đặt vương miện lên cột 10; `min` đặt chiếc lá nhỏ lên cột 5.
**Trên màn hình:**
```python
diem = [8, 5, 10, 7]
print(max(diem))   # 10
print(min(diem))   # 5
```
**Lời đọc:**
> Lệnh "mắc" tìm số lớn nhất, lệnh "min" tìm số nhỏ nhất. Em không cần tự so sánh từng số, Python làm hết trong nháy mắt, dù danh sách có hàng nghìn số.

## Cảnh 3 · 0:55–1:20 · Xếp thứ tự
**Hình:** Các cột tự đổi chỗ, xếp từ thấp đến cao. Danh sách gốc vẫn còn ở hàng trên, bản đã xếp là một hàng mới bên dưới.
**Trên màn hình:**
```python
print(sorted(diem))   # [5, 7, 8, 10]
print(diem)           # [8, 5, 10, 7]
```
**Lời đọc:**
> Sorted xếp danh sách từ bé tới lớn. Nhưng giống upper ở bài chuỗi, sorted tạo ra một danh sách mới đã xếp. Danh sách cũ vẫn nguyên như lúc đầu.

## Cảnh 4 · 1:20–2:00 · Chọn ra điểm giỏi
**Hình:** Một băng chuyền đưa từng điểm qua một cổng kiểm tra `>= 8`. Điểm đạt thì đi vào chiếc giỏ trống nhãn `cao` (ban đầu `[]`), điểm không đạt thì đi thẳng ra ngoài. Cuối cùng giỏ có 8 và 10.
**Trên màn hình:**
```python
cao = []
for d in diem:
    if d >= 8:
        cao.append(d)
print(cao)   # [8, 10]
```
**Lời đọc:**
> Muốn chọn ra những điểm từ tám trở lên, em ghép for với if. Đầu tiên, tạo một danh sách rỗng, gọi là cao, giống như một chiếc giỏ trống. Rồi đi qua từng điểm. Nếu điểm từ tám trở lên, thả vào giỏ bằng append. Hết vòng lặp, trong giỏ chỉ còn những điểm giỏi. Đừng quên tạo giỏ trống trước khi bỏ đồ vào nhé, không thì máy báo lỗi.

## Cảnh 5 · 2:00–2:25 · Lọc cả chữ
**Hình:** Danh sách tên bạn bè trên các thẻ; thẻ nào dài hơn 3 chữ cái thì bật lên.
**Trên màn hình:**
```python
ban = ["An", "Minh", "Hoa", "Phương"]
for t in ban:
    if len(t) > 3:
        print(t)
```
**Lời đọc:**
> Cách lọc này dùng được cho cả chữ. Em đi qua từng tên, tên nào dài hơn ba ký tự thì in ra. Em sẽ làm bài này trong bài tập cuối.

## Cảnh 6 · 2:25–3:05 · Lala thử ngay: bảng xếp hạng chạy bộ
**Hình:** Thời gian chạy của các bạn là các vạch trên đường đua; `min` cắm cờ ở vạch nhanh nhất, `sorted` xếp các bạn lên bục.
**Trên màn hình:**
```python
giay = [52, 47, 60, 49]
print(f"Nhanh nhất: {min(giay)} giây")
print(sorted(giay))
```
**Lời đọc:**
> Lớp Lala thi chạy. Thời gian của bốn bạn được ghi vào một danh sách. Chạy nhanh nhất là người có số giây nhỏ nhất, nên mình dùng min, không phải max. Sorted xếp các thời gian từ bé tới lớn, chính là thứ tự về đích. Chọn đúng lệnh cho đúng câu hỏi là một kỹ năng quan trọng của người viết code.

## Cảnh 7 · 3:05–3:35 · Dừng lại thử nhé!
**Trên màn hình:**
```python
tuoi = [12, 9, 11]
print(sorted(tuoi)[0])
```
**Lời đọc:**
> Đố em: dòng này in ra gì? Tạm dừng nhé. … Xếp lại được chín, mười một, mười hai. Phần tử số không là chín, cũng chính là số nhỏ nhất.

## Cảnh 8 · 3:35–4:00 · Tóm tắt và bài tập
**Trên màn hình:** ① `max` `min` · ② `sorted` tạo danh sách mới · ③ Lọc: giỏ rỗng `[]` + `for` + `if` + `append`
**Lời đọc:**
> Tóm lại: max và min tìm lớn nhất, nhỏ nhất. Sorted xếp thứ tự. Muốn lọc, chuẩn bị giỏ rỗng, rồi for, if, append. Giờ em thử trong bài tập nhé. Hẹn gặp em ở bài sau!

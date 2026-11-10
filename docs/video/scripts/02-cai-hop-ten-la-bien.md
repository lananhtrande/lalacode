# Video 02 — Cái hộp tên là biến

**Khái niệm:** biến, gán giá trị · **Thời lượng:** ~4 phút 50 · **Bài tập đi kèm:** Cất điểm vào hộp, Tên của em, Đổi giá trị trong hộp, Hai cái hộp

**Sau video, em biết:** tạo biến bằng dấu `=`; biến đựng được số và chữ; in biến thì không đặt tên trong ngoặc kép; đổi được giá trị trong biến; đặt tên biến dễ hiểu.

---

## Cảnh 1 · 0:00–0:35 · Mở đầu
**Hình:** Lala ngồi trước đống đồ chơi bừa bộn, gãi đầu. Một dãy hộp các-tông có dán nhãn trượt vào.
**Trên màn hình:** `Bài 2 · Cái hộp tên là biến`
**Lời đọc:**
> Chào em! Bài trước, em đã biết dùng print để in chữ ra màn hình. Hôm nay, Lala có một vấn đề: đồ đạc bừa bộn quá, chẳng biết cái gì nằm ở đâu. Cách hay nhất là gì? Cất vào hộp và dán nhãn lên! Trong Python, cái hộp có nhãn ấy tên là biến.

## Cảnh 2 · 0:35–1:10 · Biến là cái hộp có nhãn
**Hình:** Một chiếc hộp hoạt hình, nhãn ghi `diem`. Số 9 bay vào hộp, nắp đóng lại. Bên dưới, code hiện ra; dấu `=` tô sáng kèm mũi tên cong từ số 9 vào hộp.
**Trên màn hình:**
```python
diem = 9
```
Chú thích: `=` nghĩa là "cất vào", không phải "bằng nhau"
**Lời đọc:**
> Em viết diem, dấu bằng, chín. Dòng này nghĩa là: lấy số chín, cất vào cái hộp có nhãn diem. Chú ý nhé, trong Python, dấu bằng ở đây không có nghĩa là hai bên bằng nhau như trong toán. Nó nghĩa là cất vào. Bên phải là thứ được cất, bên trái là tên cái hộp.

## Cảnh 3 · 1:10–1:45 · Mở hộp ra xem
**Hình:** Thêm dòng `print(diem)`. Nắp hộp bật mở, số 9 bay sang khung kết quả. Sau đó hộp thứ hai nhãn `ten`, chữ "Lan" trong ngoặc kép bay vào.
**Trên màn hình:**
```python
diem = 9
print(diem)
ten = "Lan"
print(ten)
```
Kết quả: `9` / `Lan`
**Lời đọc:**
> Muốn xem trong hộp có gì, em dùng print, và đặt tên hộp vào trong ngoặc tròn. Máy mở hộp diem ra và in số chín. Hộp đựng được cả chữ nữa. Em viết ten bằng, rồi chữ Lan trong ngoặc kép. Nhớ nhé: chữ thì phải có ngoặc kép, còn số thì không cần.

## Cảnh 4 · 1:45–2:20 · Bẫy hay gặp: ngoặc kép quanh tên biến
**Hình:** Hai khung so sánh trái/phải. Trái: `print(diem)` → mở hộp → `9`. Phải: `print("diem")` → không mở hộp, in nguyên bốn chữ cái d-i-e-m. Lala ngạc nhiên.
**Trên màn hình:** `print(diem)` → `9` · `print("diem")` → `diem`
**Lời đọc:**
> Có một cái bẫy mà nhiều bạn hay mắc. Nếu em viết print, rồi diem nằm trong ngoặc kép, máy sẽ không mở hộp đâu. Nó coi đó là một chuỗi chữ bình thường, và in đúng bốn chữ cái: đê, i, e, em. Vậy nên, khi muốn in thứ bên trong hộp, đừng đặt tên hộp trong ngoặc kép nhé.

## Cảnh 5 · 2:20–3:00 · Đổi đồ trong hộp và đặt tên hay
**Hình:** Hộp `tien` đang chứa 10000. Số 20000 bay tới, số cũ bị đẩy văng ra ngoài. Sau đó ba hộp nhãn `a`, `b`, `x` mờ đi, ba hộp `diem`, `ten`, `tuoi` sáng lên với dấu ✓.
**Trên màn hình:**
```python
tien = 10000
tien = 20000
print(tien)
```
Kết quả: `20000`
**Lời đọc:**
> Hộp cũng thay được đồ bên trong. Lúc đầu, tiền là mười nghìn. Dòng sau, em cất hai mươi nghìn vào cùng cái hộp đó. Số cũ bị thay ra, trong hộp giờ chỉ còn hai mươi nghìn. Một mẹo nữa: hãy đặt tên hộp nói đúng thứ nó đựng. Tên như diem, ten, tuoi dễ hiểu hơn nhiều so với a, b, x.

## Cảnh 6 · 3:00–3:45 · Lala thử ngay: phiếu điểm của Lala
**Hình:** Ba hộp `ten`, `mon`, `diem` xếp hàng; Lala lần lượt mở từng hộp, nội dung bay xuống ghép thành một tấm phiếu điểm.
**Trên màn hình:**
```python
ten = "Lala"
mon = "Toán"
diem = 10
print(ten)
print(mon)
print(diem)
```
**Lời đọc:**
> Lala làm một tấm phiếu điểm nhỏ. Bạn ấy cất tên vào hộp ten, môn học vào hộp mon, và điểm vào hộp diem. Rồi in lần lượt ba cái hộp. Chú ý: tên và môn là chữ nên có ngoặc kép, còn điểm mười là số nên không cần. Hay ở chỗ: tuần sau có điểm mới, Lala chỉ cần sửa đúng một dòng, phần in phía dưới giữ nguyên. Đó chính là lợi ích của biến.

## Cảnh 7 · 3:45–4:15 · Dừng lại thử nhé!
**Hình:** Đồng hồ đếm 5-4-3-2-1. Khung kết quả che dấu "?".
**Trên màn hình:**
```python
mon = "Toán"
mon = "Văn"
print(mon)
```
**Lời đọc:**
> Đố em: đoạn code này in ra chữ gì? Tạm dừng video và đoán nhé. … Đáp án là Văn. Vì dòng thứ hai đã thay chữ Toán bằng chữ Văn rồi.

## Cảnh 8 · 4:15–4:50 · Tóm tắt và bài tập
**Hình:** Ba thẻ ghi nhớ. Lala xếp các hộp gọn gàng lên kệ.
**Trên màn hình:** ① Biến là cái hộp có nhãn · ② `=` nghĩa là cất vào · ③ In biến: không có ngoặc kép · ④ Đặt tên dễ hiểu
**Lời đọc:**
> Mình nhớ lại nhé. Biến là cái hộp có dán nhãn. Dấu bằng nghĩa là cất vào hộp. In biến thì không đặt tên trong ngoặc kép. Và tên biến nên dễ hiểu. Giờ em thử tạo những cái hộp của riêng mình trong bài tập nhé. Hẹn gặp em ở bài sau, nơi có một chú rùa biết vẽ!

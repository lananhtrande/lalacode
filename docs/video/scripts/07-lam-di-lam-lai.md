# Video 07 — Làm đi làm lại

**Khái niệm:** `for`, `range`, vòng lặp lồng nhau · **Thời lượng:** ~4 phút 30 · **Bài tập đi kèm:** Ba lần xin chào, Đếm từ 1 đến 5, Bảng nhân 3, Hình vuông bằng vòng lặp, Bông hoa của rùa

**Sau video, em biết:** dùng `for … in range(n)` để lặp n lần; Python đếm từ 0; `range(1, 6)` dừng trước 6; dùng biến lượt `i`; vẽ hình vuông bằng vòng lặp; vòng lặp trong vòng lặp.

---

## Cảnh 1 · 0:00–0:30 · Mở đầu
**Hình:** Lala đang chép đi chép lại bốn lần cùng hai dòng code vẽ hình vuông, tay mỏi nhừ, mồ hôi nhỏ giọt.
**Trên màn hình:** `Bài 7 · Làm đi làm lại`
**Lời đọc:**
> Chào em! Em còn nhớ bài rùa vẽ hình vuông không? Mình phải viết đi viết lại bốn lần cùng hai dòng code. Mỏi tay quá! Nếu phải vẽ một trăm hình vuông thì sao? Hôm nay Lala sẽ học cách bảo máy: làm lại cho mình nhiều lần nhé.

## Cảnh 2 · 0:30–1:05 · `for` và `range`
**Hình:** Code hiện ra. Một chiếc đồng hồ đếm lượt có 3 ô. Mỗi lượt, một ô sáng lên và dòng "Xin chào" mới bật ra ở khung kết quả.
**Trên màn hình:**
```python
for i in range(3):
    print("Xin chào")
```
**Lời đọc:**
> Đây là vòng lặp "fo". Đọc là: với mỗi lần i chạy trong dãy ba số, hãy in Xin chào. Range ba tạo ra ba lượt. Máy làm phần việc bên trong ba lần, rồi dừng. Giống if, dòng for kết thúc bằng dấu hai chấm, và phần việc lặp lại phải thụt vào bốn dấu cách.

## Cảnh 3 · 1:05–1:40 · Python đếm từ 0
**Hình:** Ba ô của đồng hồ được đánh số 0, 1, 2. Mỗi lượt, số trong ô bay vào hộp `i` rồi được in ra. Lala ngạc nhiên vì không thấy số 3.
**Trên màn hình:**
```python
for i in range(3):
    print(i)
```
Kết quả: `0` `1` `2`
**Lời đọc:**
> Biến i giữ số của lượt đang chạy. Nhưng có một điều lạ: Python đếm từ số không! Range ba cho ba số: không, một, hai. Không có số ba đâu. Nghe hơi lạ, nhưng em sẽ quen rất nhanh, vì hầu hết các ngôn ngữ lập trình đều đếm từ không.

## Cảnh 4 · 1:40–2:10 · Đếm từ 1 tới 5
**Hình:** Một thước kẻ số từ 0 đến 7. Dấu bắt đầu đặt ở 1, dấu dừng đặt ở 6 có rào chắn; các số 1 đến 5 sáng lên. Sau đó bảng nhân 3 hiện từng dòng.
**Trên màn hình:**
```python
for i in range(1, 6):
    print(f"3 x {i} = {3 * i}")
```
**Lời đọc:**
> Muốn đếm từ một tới năm, em viết range một, sáu. Số đầu là chỗ bắt đầu. Số sau là chỗ dừng, nhưng máy dừng trước số đó, nên không in số sáu. Ghép với f-string, em có ngay bảng nhân ba.

## Cảnh 5 · 2:10–2:50 · Hình vuông chỉ ba dòng, rồi bông hoa
**Hình:** Code hình vuông thu gọn: bốn cặp dòng gộp lại thành một vòng lặp. Rùa vẽ hình vuông. Sau đó vòng lặp ngoài xuất hiện bao quanh: rùa vẽ 6 hình vuông, mỗi lần xoay 60 độ, thành bông hoa nhiều màu.
**Trên màn hình:**
```python
import turtle

for i in range(4):
    turtle.forward(70)
    turtle.left(90)
```
**Lời đọc:**
> Còn hình vuông của rùa? Giờ chỉ cần ba dòng thôi. Lặp bốn lần: đi thẳng, quay trái. Và một điều thú vị nữa: em đặt được một vòng lặp vào bên trong một vòng lặp khác. Vòng trong vẽ một hình vuông. Vòng ngoài lặp lại cả hình vuông đó sáu lần, mỗi lần quay một chút. Kết quả là một bông hoa! Em sẽ thử ở bài tập cuối.

## Cảnh 6 · 2:50–3:30 · Lala thử ngay: đếm cừu đi ngủ
**Hình:** Từng chú cừu nhảy qua hàng rào, mỗi chú mang một con số; Lala ngáp dài.
**Trên màn hình:**
```python
for i in range(1, 6):
    print(f"{i} con cừu")
print("Chúc ngủ ngon!")
```
**Lời đọc:**
> Tối nay Lala khó ngủ, nên bạn ấy đếm cừu. Vòng lặp đếm từ một tới năm, mỗi lượt in số con cừu. Để ý dòng Chúc ngủ ngon nằm sát lề, không thụt vào, nên nó không thuộc vòng lặp. Máy chỉ in nó một lần, sau khi đếm xong. Thụt vào hay không thụt vào khác nhau nhiều lắm đấy.

## Cảnh 7 · 3:30–4:00 · Dừng lại thử nhé!
**Trên màn hình:**
```python
for i in range(2, 5):
    print(i)
```
**Lời đọc:**
> Đố em: đoạn này in ra những số nào? Tạm dừng nhé. … Bắt đầu từ hai, dừng trước năm: hai, ba, bốn. Ba số.

## Cảnh 8 · 4:00–4:30 · Tóm tắt và bài tập
**Trên màn hình:** ① `for i in range(n):` lặp n lần · ② Đếm từ 0 · ③ `range(a, b)` dừng **trước** b · ④ Lặp lồng nhau vẽ được hình đẹp
**Lời đọc:**
> Tóm lại: for và range giúp máy làm lại nhiều lần. Python đếm từ không, và range dừng trước số cuối. Vòng lặp đặt được trong vòng lặp. Giờ em thử in, đếm, làm bảng nhân và vẽ bông hoa cho rùa nhé. Hẹn gặp em ở bài sau!

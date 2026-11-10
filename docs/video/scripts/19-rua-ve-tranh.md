# Video 19 — Rùa vẽ tranh

**Khái niệm:** toạ độ, `goto`, `dot`, `circle` · **Thời lượng:** ~4 phút 50 · **Bài tập đi kèm:** Chấm tròn đầu tiên, Hai con mắt, Khuôn mặt tròn, Hàng chấm nhiều màu

**Sau video, em biết:** đọc toạ độ (0, 0) ở giữa, x sang phải, y lên trên; dời rùa bằng `goto`; chấm tròn bằng `dot`; vẽ đường tròn bằng `circle`; ghép nhiều phần thành một nhân vật.

---

## Cảnh 1 · 0:00–0:30 · Mở đầu
**Hình:** Một khung tranh trống trên giá vẽ. Rùa đeo kính, mang bảng màu. Một bức chân dung hoạt hình đơn giản (mặt tròn, hai mắt, nụ cười) hiện mờ như mục tiêu.
**Trên màn hình:** `Bài 19 · Rùa vẽ tranh`
**Lời đọc:**
> Chào em! Rùa đã vẽ được hình vuông, tam giác, tô màu. Hôm nay rùa muốn vẽ cả một bức tranh. Muốn thế, rùa cần biết mình đang đứng ở đâu trên tờ giấy. Mình cùng học về toạ độ nhé.

## Cảnh 2 · 0:30–1:10 · Toạ độ
**Hình:** Một lưới ô vuông hiện lên trên canvas. Điểm (0, 0) ở giữa có ngôi sao nhỏ. Trục x nằm ngang có mũi tên sang phải ghi "x tăng", trục y đứng có mũi tên lên trên ghi "y tăng". Một chấm di chuyển tới (100, 50): đi sang phải 100, lên trên 50.
**Trên màn hình:** `(0, 0)` ở giữa · x → phải · y → lên trên · `(100, 50)` = phải 100, lên 50
**Lời đọc:**
> Mỗi chỗ trên màn hình có một địa chỉ, gọi là toạ độ, gồm hai số x và y. Điểm không, không nằm chính giữa màn hình, nơi rùa bắt đầu. X tăng thì đi sang phải, x âm thì sang trái. Y tăng thì đi lên trên, y âm thì đi xuống dưới. Toạ độ một trăm, năm mươi nghĩa là: sang phải một trăm, lên trên năm mươi.

## Cảnh 3 · 1:10–1:40 · `goto` đi tới địa chỉ
**Hình:** Rùa nhấc bút, "bay" thẳng tới (-100, 50) không để lại nét, đặt bút xuống. Một biển địa chỉ nhỏ ghi (-100, 50) cắm cạnh rùa.
**Trên màn hình:**
```python
turtle.penup()
turtle.goto(-100, 50)
turtle.pendown()
```
**Lời đọc:**
> Lệnh goto đưa rùa đi thẳng tới một toạ độ. Âm một trăm, năm mươi là sang trái một trăm, lên trên năm mươi. Nhớ bài trước nhé: nhấc bút lên trước khi đi, rồi đặt bút xuống khi tới nơi, để không vẽ vệt thừa.

## Cảnh 4 · 1:40–2:20 · Chấm tròn và đường tròn
**Hình:** `dot(20, "red")`: một chấm đỏ "bụp" xuống ngay chỗ rùa. Sau đó `circle(40)`: rùa bò thành vòng tròn, bán kính 40 có thước đo.
**Trên màn hình:**
```python
turtle.dot(20, "red")
turtle.circle(40)
```
**Lời đọc:**
> Dot chấm một chấm tròn ngay tại chỗ rùa đang đứng. Số hai mươi là độ to, chữ red là màu. Còn circle vẽ một đường tròn. Số bốn mươi là bán kính, khoảng cách từ tâm ra viền. Chú ý: rùa vẽ vòng tròn bằng cách bò vòng quanh, nên vòng tròn nằm phía bên trái rùa, không phải tâm ở chỗ rùa đứng.

## Cảnh 5 · 2:20–3:00 · Ghép thành nhân vật
**Hình:** Từng phần của khuôn mặt được vẽ theo thứ tự: đường tròn làm mặt; nhấc bút, goto, chấm đen bên trái; goto, chấm đen bên phải; goto, chấm vàng làm má. Cuối cùng hiện ra một khuôn mặt cười, Lala vỗ tay.
**Trên màn hình:**
```python
turtle.circle(50)
turtle.penup()
turtle.goto(-20, 60)
turtle.dot(15, "black")
turtle.goto(20, 60)
turtle.dot(15, "black")
```
**Lời đọc:**
> Giờ mình ghép lại. Một đường tròn làm khuôn mặt. Nhấc bút, đi tới chỗ mắt trái, chấm một chấm đen. Đi tới chỗ mắt phải, chấm thêm một chấm. Vì dot không cần bút đặt xuống, nên khi chỉ chấm chấm thôi, em không cần pen down. Vẽ xong phần nào, nhấc bút, dời sang chỗ mới, rồi vẽ tiếp. Thế là em có một nhân vật của riêng mình!

## Cảnh 6 · 3:00–3:40 · Lala thử ngay: bầu trời sao
**Hình:** Rùa dời tới nhiều toạ độ, chấm các chấm vàng to nhỏ khác nhau trên nền xanh đêm.
**Trên màn hình:**
```python
turtle.penup()
for x in [-90, -30, 30, 90]:
    turtle.goto(x, 60)
    turtle.dot(12, "gold")
```
**Lời đọc:**
> Lala muốn vẽ bầu trời đầy sao. Bạn ấy để các toạ độ x vào một danh sách. Vòng lặp đi qua từng x, rùa đi tới toạ độ x, sáu mươi, rồi chấm một chấm vàng. Vì chỉ chấm chấm nên Lala nhấc bút một lần ở đầu là xong. Danh sách, vòng lặp, toạ độ, chấm tròn: bốn bài học gói gọn trong bốn dòng.

## Cảnh 7 · 3:40–4:15 · Dừng lại thử nhé!
**Trên màn hình:** Rùa đang ở `(0, 0)`. Lệnh `goto(0, -50)` đưa rùa đi đâu?
**Lời đọc:**
> Đố em: goto không, âm năm mươi đưa rùa đi đâu? Tạm dừng nhé. … X bằng không nên không sang trái hay phải. Y âm năm mươi nên đi xuống dưới năm mươi bước.

## Cảnh 8 · 4:15–4:50 · Tóm tắt và bài tập
**Trên màn hình:** ① `(0, 0)` ở giữa · x → phải, y → lên · ② `goto(x, y)` · ③ `dot(to, "màu")` · ④ `circle(ban_kinh)` · ⑤ Nhấc bút khi dời chỗ
**Lời đọc:**
> Tóm lại: không, không ở giữa, x sang phải, y lên trên. Goto để dời rùa, dot để chấm tròn, circle để vẽ đường tròn. Và nhớ nhấc bút khi dời chỗ. Giờ em vẽ hai con mắt, khuôn mặt tròn, và một hàng chấm nhiều màu nhé. Bài sau là bài cuối, một dự án thật sự đang chờ em!

# Video 16 — Rùa và hàm

**Khái niệm:** hàm vẽ hình, `fillcolor`/`begin_fill`/`end_fill`, `penup`/`goto`/`pendown` · **Thời lượng:** ~4 phút 30 · **Bài tập đi kèm:** Hàm vẽ tam giác, Tô màu hình vuông, Hai hình cạnh nhau, Ba hình ba màu

**Sau video, em biết:** gom lệnh vẽ vào hàm có tham số kích thước; tô màu hình khép kín; nhấc bút để dời rùa mà không vẽ.

---

## Cảnh 1 · 0:00–0:25 · Mở đầu
**Hình:** Rùa trở lại với hộp bút màu và một chiếc "nút bấm vẽ vuông" to đùng.
**Trên màn hình:** `Bài 16 · Rùa và hàm`
**Lời đọc:**
> Chào em! Chú rùa quay lại rồi! Lần này, em đã biết làm hàm. Mình sẽ ghép hai thứ đó lại: tạo những chiếc nút bấm vẽ hình, tô màu cho hình, và dời rùa đi khắp màn hình.

## Cảnh 2 · 0:25–0:55 · Hàm vẽ hình vuông
**Hình:** Code hàm `ve_vuong` đóng lại thành một nút bấm có khe `canh`. Bấm với 50 → hình vuông nhỏ; bấm với 80 → hình vuông to bao quanh.
**Trên màn hình:**
```python
import turtle

def ve_vuong(canh):
    for i in range(4):
        turtle.forward(canh)
        turtle.left(90)

ve_vuong(50)
ve_vuong(80)
```
**Lời đọc:**
> Em gom vòng lặp vẽ hình vuông vào một hàm tên là vẽ vuông, với tham số là độ dài cạnh. Giờ mỗi lần muốn vẽ, chỉ cần một dòng. Năm mươi là hình vuông nhỏ, tám mươi là hình vuông to. Viết một lần, dùng mãi mãi.

## Cảnh 3 · 0:55–1:30 · Tô màu
**Hình:** Rùa cầm thùng sơn cam. `begin_fill()` = rùa mở nắp thùng sơn; rùa vẽ bốn cạnh; `end_fill()` = sơn đổ tràn lấp đầy hình vuông. Một hình hở (thiếu một cạnh) bị tô lem ra ngoài trông rất xấu, có dấu ✗.
**Trên màn hình:**
```python
turtle.fillcolor("orange")
turtle.begin_fill()
ve_vuong(60)
turtle.end_fill()
```
**Lời đọc:**
> Muốn tô màu bên trong hình, em chọn màu bằng fillcolor. Rồi begin fill, nghĩa là bắt đầu tô từ đây. Vẽ hình. Rồi end fill, nghĩa là tô xong rồi. Màu chỉ đổ vào khi gặp end fill. Và hình phải khép kín, rùa phải quay về chỗ cũ, thì màu mới tô đẹp.

## Cảnh 4 · 1:30–2:05 · Nhấc bút, dời chỗ
**Hình:** Rùa nhấc bút lên (bút bay khỏi mặt giấy), bò sang phải để lại vệt chân mờ không có nét, đặt bút xuống ở toạ độ (100, 0), vẽ hình vuông thứ hai. Phiên bản quên `pendown`: rùa bò mãi không thấy nét, Lala gãi đầu.
**Trên màn hình:**
```python
turtle.penup()
turtle.goto(100, 0)
turtle.pendown()
```
**Lời đọc:**
> Muốn vẽ hình thứ hai ở chỗ khác, mà không muốn có đường kẻ nối giữa hai hình, em nhấc bút lên bằng pen up. Dời rùa tới chỗ mới bằng goto. Rồi đặt bút xuống bằng pen down. Nếu quên pen down, rùa vẫn đi nhưng không để lại nét nào. Lala đã từng mắc lỗi này đấy!

## Cảnh 5 · 2:05–2:35 · Ghép với danh sách màu
**Hình:** Danh sách ba ống sơn đỏ, xanh dương, xanh lá. Vòng lặp lấy lần lượt từng màu, rùa vẽ ba hình vuông xoay quanh một điểm, mỗi lần quay 120 độ.
**Trên màn hình:**
```python
mau = ["red", "blue", "green"]
for m in mau:
    turtle.fillcolor(m)
    turtle.begin_fill()
    ve_vuong(50)
    turtle.end_fill()
    turtle.left(120)
```
**Lời đọc:**
> Giờ mình ghép tất cả những gì đã học: danh sách màu, vòng lặp, hàm, và tô màu. Mỗi lượt, rùa lấy một màu, tô một hình vuông, rồi quay một trăm hai mươi độ. Ba lượt là ba hình ba màu, xoay quanh nhau thật đẹp.

## Cảnh 6 · 2:35–3:15 · Lala thử ngay: ngôi nhà nhỏ
**Hình:** Rùa vẽ một hình vuông tô vàng làm thân nhà, rồi một tam giác tô đỏ làm mái đặt bên trên.
**Trên màn hình:**
```python
turtle.fillcolor("yellow")
turtle.begin_fill()
ve_vuong(80)
turtle.end_fill()
turtle.left(90)
turtle.forward(80)
turtle.right(90)
turtle.fillcolor("red")
turtle.begin_fill()
ve_tam_giac(80)
turtle.end_fill()
```
**Lời đọc:**
> Lala ghép hai hàm để vẽ một ngôi nhà. Đầu tiên, hình vuông tô vàng làm thân nhà. Rồi rùa đi lên tới nóc tường, quay mặt sang phải lại, và vẽ một tam giác tô đỏ làm mái. Mỗi hình nằm trong cặp begin fill và end fill riêng. Có sẵn hàm rồi, vẽ cả ngôi nhà chỉ cần vài dòng.

## Cảnh 7 · 3:15–3:55 · Dừng lại thử nhé!
**Trên màn hình:**
```python
def ve_tam_giac(canh):
    for i in range(3):
        turtle.forward(canh)
        turtle.left(120)
```
**Lời đọc:**
> Đố em: hàm này vẽ hình gì? Vì sao lại quay một trăm hai mươi độ? Tạm dừng nhé. … Ba cạnh, đó là tam giác đều. Rùa cần quay tổng cộng đủ một vòng, ba trăm sáu mươi độ. Chia cho ba góc, mỗi góc một trăm hai mươi độ.

## Cảnh 8 · 3:55–4:30 · Tóm tắt và bài tập
**Trên màn hình:** ① Gom lệnh vẽ vào hàm · ② `fillcolor` → `begin_fill` → vẽ → `end_fill` · ③ `penup` → `goto` → `pendown`
**Lời đọc:**
> Tóm lại: gom lệnh vẽ vào hàm để dùng lại. Tô màu thì begin fill, vẽ hình khép kín, end fill. Dời chỗ thì nhấc bút, goto, rồi đặt bút. Giờ em vẽ tam giác, tô hình vuông cam, và vẽ ba hình ba màu nhé. Hẹn gặp em ở bài sau!

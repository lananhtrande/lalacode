# Video 03 — Rùa vẽ hình

**Khái niệm:** `turtle`, `forward`, `left`/`right`, góc quay, `pencolor` · **Thời lượng:** ~5 phút 15 · **Bài tập đi kèm:** Một nét thẳng, Góc vuông, Hình vuông màu đỏ, Bậc thang

**Sau video, em biết:** gọi rùa bằng `import turtle`; cho rùa đi thẳng và quay; góc 90 độ là góc vuông; đổi màu bút; thứ tự đi và quay làm hình khác nhau.

---

## Cảnh 1 · 0:00–0:30 · Mở đầu
**Hình:** Lala đội mũ hoạ sĩ, ngậm một cây bút chì to. Một tờ giấy trắng trải ra.
**Trên màn hình:** `Bài 3 · Rùa vẽ hình`
**Lời đọc:**
> Chào em! Hôm nay là ngày đặc biệt của Lala, vì Python có hẳn một chú rùa biết vẽ! Rùa cầm một cây bút. Em ra lệnh, rùa bò tới đâu thì nét vẽ hiện ra tới đó. Mình cùng vẽ nhé.

## Cảnh 2 · 0:30–1:05 · Gọi rùa ra và đi thẳng
**Hình:** Code `import turtle` hiện; một cánh cửa mở ra, rùa bước vào giữa canvas, đầu quay sang phải (mũi tên nhỏ chỉ hướng). Dòng `forward(100)` chạy: rùa bò sang phải, để lại nét xanh dương, thước đo hiện "100 bước".
**Trên màn hình:**
```python
import turtle

turtle.forward(100)
```
**Lời đọc:**
> Dòng đầu tiên, import turtle, là để gọi chú rùa ra. Không có dòng này, rùa không xuất hiện đâu. Rùa luôn bắt đầu ở giữa màn hình, và đầu quay sang bên phải. Lệnh turtle chấm forward, mở ngoặc, một trăm, nghĩa là đi thẳng một trăm bước. Forward nghĩa là tiến lên.

## Cảnh 3 · 1:05–1:45 · Quay trái, quay phải
**Hình:** Rùa đứng yên, xoay tại chỗ: một cung tròn màu cam vẽ góc 90 độ, chữ "90°". Một góc tờ giấy hiện ra bên cạnh để so sánh: góc vuông. Rùa đi tiếp lên trên 100 bước tạo thành chữ L ngược.
**Trên màn hình:**
```python
import turtle

turtle.forward(100)
turtle.left(90)
turtle.forward(100)
```
**Lời đọc:**
> Muốn rùa đổi hướng, em dùng left để quay trái, hoặc right để quay phải. Số trong ngoặc là số độ. Chín mươi độ là góc vuông, giống hệt góc của tờ giấy. Chú ý: lệnh quay không làm rùa bò đi, rùa chỉ xoay người tại chỗ thôi. Sau khi quay trái chín mươi độ, rùa đi thêm một trăm bước, và em có một góc vuông.

## Cảnh 4 · 1:45–2:25 · Hình vuông và màu bút
**Hình:** Rùa đi bốn cạnh, mỗi lần quay hiện số đếm "1", "2", "3", "4". Hết vòng, rùa về đúng chỗ cũ, quay mặt sang phải như lúc đầu, hiện chữ "đủ một vòng = 4 × 90° = 360°". Sau đó bút đổi màu đỏ, vẽ lại hình vuông nhỏ.
**Trên màn hình:**
```python
turtle.pencolor("red")
turtle.forward(60)
turtle.left(90)
```
…(lặp 4 lần) · Màu dùng được: `red` `blue` `green` `orange`
**Lời đọc:**
> Đi rồi quay, đi rồi quay, làm bốn lần, em được một hình vuông. Bốn lần chín mươi độ là đủ một vòng, rùa quay về đúng chỗ cũ. Muốn đổi màu bút, em dùng pencolor, và viết tên màu bằng tiếng Anh trong ngoặc kép, ví dụ red là đỏ, blue là xanh dương, green là xanh lá, orange là màu cam.

## Cảnh 5 · 2:25–3:10 · Đi trước hay quay trước?
**Hình:** Màn hình chia đôi. Bên trái: forward rồi left. Bên phải: left rồi forward. Hai rùa chạy cùng lúc, hai hình vẽ khác nhau rõ rệt. Lala nhìn qua nhìn lại.
**Trên màn hình:** Trái `forward(80)` → `left(90)` · Phải `left(90)` → `forward(80)`
**Lời đọc:**
> Bây giờ một điều quan trọng. Hai đoạn code này có cùng hai lệnh, chỉ khác thứ tự. Bên trái, rùa đi trước rồi mới quay, nên nét vẽ nằm ngang. Bên phải, rùa quay trước rồi mới đi, nên nét vẽ dựng đứng lên. Thứ tự lệnh khác nhau, hình vẽ ra cũng khác nhau. Khi vẽ, em hãy tưởng tượng mình là chú rùa, và tự hỏi: mình đang quay mặt về hướng nào?

## Cảnh 6 · 3:10–3:55 · Lala thử ngay: chữ L khổng lồ
**Hình:** Rùa vẽ chữ L: đi xuống, quay, đi sang phải. Bút đổi sang màu xanh lá, nét dày.
**Trên màn hình:**
```python
import turtle

turtle.pencolor("green")
turtle.right(90)
turtle.forward(100)
turtle.left(90)
turtle.forward(60)
```
**Lời đọc:**
> Lala muốn rùa vẽ chữ cái đầu tên mình: chữ L. Đầu tiên đổi bút sang màu xanh lá. Lúc đầu rùa quay mặt sang phải, nên muốn đi xuống, rùa phải quay phải chín mươi độ. Đi xuống một trăm bước. Rồi quay trái chín mươi độ để quay mặt sang phải lại, và đi thêm sáu mươi bước. Thế là có chữ L! Em thử nghĩ xem, chữ cái đầu tên em cần những nét nào?

## Cảnh 7 · 3:55–4:35 · Dừng lại thử nhé!
**Hình:** Đồng hồ đếm. Canvas bị che. Sau đó lật mở: rùa vẽ bậc thang hai bậc.
**Trên màn hình:**
```python
turtle.left(90)
turtle.forward(40)
turtle.right(90)
turtle.forward(40)
```
**Lời đọc:**
> Đố em: rùa sẽ vẽ hình gì? Nhớ rằng lúc đầu rùa quay mặt sang phải. Tạm dừng và đoán nhé. … Rùa quay trái thành quay mặt lên trên, đi lên bốn mươi bước, rồi quay phải, đi sang phải bốn mươi bước. Đó là một bậc thang!

## Cảnh 8 · 4:35–5:15 · Tóm tắt và bài tập
**Hình:** Ba thẻ ghi nhớ, Lala giơ bức tranh hình vuông đỏ.
**Trên màn hình:** ① `import turtle` gọi rùa · ② `forward` đi, `left`/`right` quay · ③ 90° là góc vuông, 4 lần là đủ vòng · ④ Thứ tự lệnh quan trọng
**Lời đọc:**
> Mình nhớ lại nhé. Import turtle để gọi rùa. Forward để đi, left và right để quay. Chín mươi độ là góc vuông, quay bốn lần là đủ một vòng. Và thứ tự lệnh rất quan trọng. Giờ em cầm bút giúp rùa trong bài tập nhé: vẽ nét thẳng, góc vuông, hình vuông màu đỏ, và một cái bậc thang. Hẹn gặp em ở bài sau!

# Video 12 — Chia lấy nguyên, chia lấy dư

**Khái niệm:** `//`, `%`, `round` · **Thời lượng:** ~4 phút 10 · **Bài tập đi kèm:** Chia kẹo, Đổi giây sang phút, Làm tròn điểm, Đếm số chia hết cho 3

**Sau video, em biết:** `//` cho phần nguyên, `%` cho phần dư; dùng `%` để biết chẵn lẻ, chia hết; đổi giây sang phút; làm tròn bằng `round`.

---

## Cảnh 1 · 0:00–0:30 · Mở đầu
**Hình:** Lala có 7 cái kẹo muốn chia cho 2 bạn. Mỗi bạn được 3,5 cái?! Một cái kẹo bị bẻ đôi, Lala lắc đầu.
**Trên màn hình:** `Bài 12 · Chia lấy nguyên, chia lấy dư`
**Lời đọc:**
> Chào em! Bảy chia hai bằng ba chấm năm, mình đã biết rồi. Nhưng chia kẹo thì không ai bẻ đôi cái kẹo cả. Mình muốn biết mỗi bạn được mấy cái nguyên vẹn, và còn thừa mấy cái. Python có hai phép chia đặc biệt cho việc này.

## Cảnh 2 · 0:30–1:05 · `//` và `%`
**Hình:** 7 cái kẹo chia vào 2 cái giỏ: mỗi giỏ 3 cái (số 3 sáng lên cạnh `//`), 1 cái nằm lại trên bàn (số 1 sáng lên cạnh `%`).
**Trên màn hình:**
```python
print(7 // 2)   # 3 — chia lấy phần nguyên
print(7 % 2)    # 1 — chia lấy phần dư
```
**Lời đọc:**
> Hai dấu gạch chéo là chia lấy phần nguyên. Bảy chia hai, lấy nguyên, được ba. Mỗi bạn ba cái. Dấu phần trăm là chia lấy phần dư. Bảy chia hai dư một. Còn thừa một cái kẹo. Em nhớ hình ảnh chia kẹo này là không bao giờ nhầm hai phép.

## Cảnh 3 · 1:05–1:40 · Chẵn hay lẻ? Chia hết?
**Hình:** Các số 4, 7, 10, 13 lần lượt đi qua máy `% 2`: dư 0 → nhãn "chẵn" xanh lá; dư 1 → "lẻ". Sau đó máy `% 3`, số 9 dư 0 → "chia hết cho 3".
**Trên màn hình:**
```python
so % 2 == 0   # True → số chẵn
so % 3 == 0   # True → chia hết cho 3
```
**Lời đọc:**
> Phép chia lấy dư giải được nhiều bài rất hay. Một số chia hai mà dư không, đó là số chẵn. Dư một là số lẻ. Tương tự, số nào chia ba dư không thì chia hết cho ba. Ghép với if, em có ngay chương trình kiểm tra chẵn lẻ.

## Cảnh 4 · 1:40–2:10 · Đổi giây sang phút
**Hình:** Một đồng hồ đếm 135 giây. 135 giây được gom thành từng túi 60: 2 túi đầy (2 phút), còn lẻ 15 giây.
**Trên màn hình:**
```python
giay = 135
print(f"{giay // 60} phút {giay % 60} giây")
```
Kết quả: `2 phút 15 giây`
**Lời đọc:**
> Một phút có sáu mươi giây. Muốn đổi một trăm ba mươi lăm giây ra phút, em chia lấy nguyên cho sáu mươi: được hai phút. Rồi chia lấy dư cho sáu mươi: còn mười lăm giây lẻ. Hai phép đi cùng nhau, đẹp như đôi bạn thân.

## Cảnh 5 · 2:10–2:35 · Làm tròn bằng `round`
**Hình:** Số 8.6 lăn trên một ngọn đồi, rơi về số 9. Số 8.25 với một "cái kính" giữ 1 chữ số sau dấu chấm → 8.2.
**Trên màn hình:**
```python
print(round(8.6))      # 9
print(round(8.25, 1))  # 8.2
```
**Lời đọc:**
> Còn muốn làm tròn số lẻ, em dùng "rao". Round tám chấm sáu ra chín. Nếu thêm số một sau dấu phẩy, máy giữ lại một chữ số sau dấu chấm. Rất tiện để làm tròn điểm trung bình.

## Cảnh 6 · 2:35–3:15 · Lala thử ngay: xếp ghế vào hàng
**Hình:** 23 cái ghế xếp thành các hàng 5 ghế; hàng cuối thiếu chỗ, các ghế lẻ được tô màu khác.
**Trên màn hình:**
```python
so_ghe = 23
print(f"{so_ghe // 5} hàng đủ")
print(f"Thừa {so_ghe % 5} ghế")
```
**Lời đọc:**
> Lớp Lala có hai mươi ba cái ghế, xếp mỗi hàng năm ghế. Được mấy hàng đủ, và thừa mấy ghế? Chia lấy nguyên cho năm: bốn hàng. Chia lấy dư cho năm: thừa ba ghế. Bài toán chia kẹo, đổi giây sang phút hay xếp ghế đều cùng một ý tưởng: chia thành từng nhóm, rồi xem còn lẻ bao nhiêu.

## Cảnh 7 · 3:15–3:45 · Dừng lại thử nhé!
**Trên màn hình:**
```python
print(17 // 5)
print(17 % 5)
```
**Lời đọc:**
> Đố em: mười bảy cái kẹo chia cho năm bạn. Tạm dừng nhé. … Mỗi bạn được ba cái, vì năm nhân ba là mười lăm. Còn thừa hai cái.

## Cảnh 8 · 3:45–4:10 · Tóm tắt và bài tập
**Trên màn hình:** ① `//` phần nguyên · ② `%` phần dư · ③ `% 2 == 0` là chẵn · ④ `round` làm tròn
**Lời đọc:**
> Tóm lại: hai gạch chéo lấy phần nguyên, dấu phần trăm lấy phần dư, và round để làm tròn. Giờ em chia kẹo, đổi giây sang phút trong bài tập nhé. Hẹn gặp em ở bài sau!

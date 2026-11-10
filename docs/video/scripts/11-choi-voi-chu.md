# Video 11 — Chơi với chữ

**Khái niệm:** chuỗi, `len`, `.upper()`, `.lower()`, cộng chuỗi, lấy ký tự `ten[0]` · **Thời lượng:** ~4 phút 15 · **Bài tập đi kèm:** Đếm chữ, Hô to lên, Chữ cái đầu, Thẻ tên

**Sau video, em biết:** đếm ký tự bằng `len` (có cả dấu cách); đổi in hoa/in thường; dấu chấm đọc là "của"; nối chuỗi bằng `+`; lấy ký tự theo số thứ tự; các lệnh không đổi chuỗi gốc.

---

## Cảnh 1 · 0:00–0:30 · Mở đầu
**Hình:** Lala làm thẻ tên cho cả lớp, chữ thì lúc to lúc nhỏ, lộn xộn. Các chữ cái hoạt hình nhảy ra khỏi thẻ, xếp hàng ngay ngắn.
**Trên màn hình:** `Bài 11 · Chơi với chữ`
**Lời đọc:**
> Chào em! Em đã biết chữ trong Python gọi là chuỗi. Hôm nay mình sẽ chơi với chuỗi: đếm chữ, đổi chữ hoa chữ thường, ghép chữ, và lấy ra từng chữ cái. Lala đang cần làm thẻ tên cho cả lớp, mình giúp bạn ấy nhé.

## Cảnh 2 · 0:30–1:00 · Đếm ký tự
**Hình:** Chuỗi "lan anh" tách thành 7 ô, mỗi ô một ký tự; ô dấu cách được tô viền đứt nét và đếm như mọi ô khác.
**Trên màn hình:**
```python
ten = "lan anh"
print(len(ten))   # 7
```
**Lời đọc:**
> Lệnh len, em đã dùng với danh sách, cũng dùng được với chuỗi. Nó đếm có bao nhiêu ký tự. Lan anh có sáu chữ cái, nhưng len lại ra bảy. Vì sao? Vì dấu cách cũng là một ký tự! Máy đếm cả nó.

## Cảnh 3 · 1:00–1:30 · Chữ hoa, chữ thường
**Hình:** Chuỗi đi qua chiếc "máy phóng to" `.upper()` → LAN ANH; qua "máy thu nhỏ" `.lower()` → lan anh. Dấu chấm phóng to với chữ "của".
**Trên màn hình:**
```python
print(ten.upper())   # LAN ANH
print(ten.lower())   # lan anh
```
**Lời đọc:**
> Chấm "ắp-pơ" cho bản chữ in hoa, chấm "lâu-ơ" cho bản chữ thường. Dấu chấm ở đây em đọc là "của". Ten chấm upper nghĩa là bản in hoa của ten. Cách viết này hơi khác print hay len, vì lệnh đứng sau tên chuỗi, nối bằng dấu chấm.

## Cảnh 4 · 1:30–2:00 · Ghép chuỗi và lấy chữ cái
**Hình:** Ba mảnh "Xin", " ", "chào" dính vào nhau như nam châm. Sau đó chuỗi "lan anh" có số 0–6 dưới mỗi ô; ô số 0 bật lên chữ "l".
**Trên màn hình:**
```python
print("Xin" + " " + "chào")   # Xin chào
print(ten[0])                 # l
```
**Lời đọc:**
> Hai chuỗi cộng với nhau thì dính liền vào nhau. Muốn có khoảng trống ở giữa, em phải cộng thêm một dấu cách. Còn muốn lấy một chữ cái, em dùng số thứ tự trong ngoặc vuông, giống danh sách. Và vẫn đếm từ không: ten không là chữ l.

## Cảnh 5 · 2:00–2:30 · Chuỗi gốc không đổi
**Hình:** Hộp `ten` chứa "lan anh". Gọi `.upper()` tạo ra một bản sao in hoa bay ra ngoài; hộp gốc vẫn y nguyên. Muốn giữ bản in hoa thì cất vào hộp mới `ten_hoa`.
**Trên màn hình:**
```python
ten_hoa = ten.upper()
print(ten)       # lan anh
print(ten_hoa)   # LAN ANH
```
**Lời đọc:**
> Chú ý điều này: upper không làm thay đổi chuỗi gốc. Nó tạo ra một chuỗi mới. Sau khi gọi ten chấm upper, ten vẫn là lan anh viết thường. Muốn giữ bản in hoa, em cất nó vào một cái hộp mới.

## Cảnh 6 · 2:30–3:10 · Lala thử ngay: biệt danh ngộ nghĩnh
**Hình:** Chữ cái đầu của tên và họ bay ra, phóng to, ghép với nhau thành biệt danh in hoa.
**Trên màn hình:**
```python
ho = "trần"
ten = "lan"
biet_danh = ho[0].upper() + ten[0].upper()
print(biet_danh)   # TL
```
**Lời đọc:**
> Lala muốn làm biệt danh từ chữ cái đầu của họ và tên. Lấy chữ đầu của họ bằng ngoặc vuông số không, rồi chấm upper để viết hoa. Làm tương tự với tên. Cộng hai chữ lại, được TL. Em để ý, mình nối được các lệnh liền nhau: lấy chữ đầu xong, viết hoa luôn. Em thử làm biệt danh của em xem!

## Cảnh 7 · 3:10–3:40 · Dừng lại thử nhé!
**Trên màn hình:**
```python
ho = "nguyễn"
ten = "lan"
print(ho.upper() + " " + ten.upper())
```
**Lời đọc:**
> Đố em: dòng này in ra gì? Tạm dừng nhé. … NGUYỄN LAN, viết hoa cả hai, cách nhau một dấu cách. Python viết hoa được cả chữ có dấu tiếng Việt đấy!

## Cảnh 8 · 3:40–4:15 · Tóm tắt và bài tập
**Trên màn hình:** ① `len` đếm cả dấu cách · ② `.upper()` `.lower()` — chấm đọc là "của" · ③ `+` ghép chuỗi · ④ `ten[0]` chữ cái đầu · ⑤ Chuỗi gốc không đổi
**Lời đọc:**
> Tóm lại: len đếm ký tự, kể cả dấu cách. Upper và lower đổi chữ hoa, chữ thường. Dấu cộng ghép chuỗi, ngoặc vuông lấy từng chữ cái. Và chuỗi gốc luôn giữ nguyên. Giờ em giúp Lala làm thẻ tên trong bài tập nhé. Hẹn gặp em ở bài sau!

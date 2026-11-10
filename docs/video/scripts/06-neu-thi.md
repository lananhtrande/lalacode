# Video 06 — Nếu… thì…

**Khái niệm:** `if`, `else`, `elif`, phép so sánh · **Thời lượng:** ~4 phút 40 · **Bài tập đi kèm:** Đạt hay chưa đạt, Chẵn hay lẻ, Đủ tiền chưa, Số nào lớn hơn

**Sau video, em biết:** cho chương trình chọn giữa hai đường; ba quy tắc: dấu hai chấm, thụt vào 4 dấu cách, `==` khi so sánh bằng; các phép so sánh; thêm `elif` khi có hơn hai trường hợp.

---

## Cảnh 1 · 0:00–0:30 · Mở đầu
**Hình:** Lala đứng trước ngã ba đường có biển chỉ đường "Đạt ←" và "→ Chưa đạt". Trời bắt đầu mưa: Lala quyết định mở ô.
**Trên màn hình:** `Bài 6 · Nếu… thì…`
**Lời đọc:**
> Chào em! Mỗi ngày em đưa ra rất nhiều quyết định. Nếu trời mưa thì mang ô. Nếu đói thì ăn. Chương trình của mình tới giờ chỉ chạy một mạch từ trên xuống, chưa biết chọn gì cả. Hôm nay, mình dạy máy biết chọn.

## Cảnh 2 · 0:30–1:05 · `if` và `else`
**Hình:** Code hiện ra cạnh ngã ba. Điểm 8 chạy tới, gặp câu hỏi `diem >= 5?`, đèn xanh "Đúng", đi vào nhánh "Đạt". Sau đó đổi thành điểm 3, đèn đỏ "Sai", đi nhánh `else`.
**Trên màn hình:**
```python
diem = 8

if diem >= 5:
    print("Đạt")
else:
    print("Chưa đạt")
```
**Lời đọc:**
> Em đọc đoạn code này như tiếng Việt nhé: nếu điểm lớn hơn hoặc bằng năm, thì in Đạt. Không thì, in Chưa đạt. Chữ "íp" nghĩa là nếu. Chữ "en-xờ" nghĩa là không thì. Máy kiểm tra điều kiện: đúng thì đi đường thứ nhất, sai thì đi đường thứ hai. Không bao giờ đi cả hai đường cùng lúc.

## Cảnh 3 · 1:05–1:45 · Ba điều phải nhớ
**Hình:** Ba thẻ lật lần lượt, mỗi thẻ phóng to đúng chỗ trong code: dấu `:` nháy sáng; khoảng thụt vào được tô một dải màu với chữ "4 dấu cách"; hai dấu `==` cạnh một dấu `=` (hộp cất đồ) để so sánh.
**Trên màn hình:** ① Cuối dòng `if`, `else` có dấu `:` · ② Dòng bên trong thụt vào 4 dấu cách · ③ So sánh bằng: `==` (hai dấu)
**Lời đọc:**
> Có ba điều em phải nhớ thật kỹ. Một: cuối dòng if và dòng else luôn có dấu hai chấm. Hai: dòng bên trong phải thụt vào bốn dấu cách. Thụt vào là cách mình nói với máy: dòng này thuộc về if. Ba: muốn hỏi hai thứ có bằng nhau không, em viết hai dấu bằng. Vì một dấu bằng là để cất đồ vào hộp, em nhớ bài biến không?

## Cảnh 4 · 1:45–2:20 · Các phép so sánh
**Hình:** Một bảng sáu ô; mỗi ô có ký hiệu và một ví dụ nhỏ với hai cái cân hoặc hai cột cao thấp.
**Trên màn hình:** `>` lớn hơn · `<` nhỏ hơn · `>=` lớn hơn hoặc bằng · `<=` nhỏ hơn hoặc bằng · `==` bằng · `!=` khác
**Lời đọc:**
> Đây là các phép so sánh em sẽ dùng. Lớn hơn, nhỏ hơn. Lớn hơn hoặc bằng, nhỏ hơn hoặc bằng. Hai dấu bằng là bằng nhau. Còn dấu chấm than đi với dấu bằng là khác nhau. Mỗi phép so sánh chỉ có hai câu trả lời: đúng hoặc sai.

## Cảnh 5 · 2:20–2:55 · Hơn hai đường: `elif`
**Hình:** Ngã ba biến thành ngã tư với ba biển: Giỏi, Đạt, Chưa đạt. Điểm 6 đi qua cổng kiểm tra thứ nhất (sai), sang cổng thứ hai (đúng), vào "Đạt".
**Trên màn hình:**
```python
if diem >= 8:
    print("Giỏi")
elif diem >= 5:
    print("Đạt")
else:
    print("Chưa đạt")
```
**Lời đọc:**
> Có hơn hai trường hợp thì sao? Em thêm "e-líp" vào giữa if và else. Elif đọc là: nếu không phải vậy, nhưng nếu… Máy kiểm tra từ trên xuống. Gặp điều kiện đúng đầu tiên thì vào đó và bỏ qua phần còn lại. Điểm sáu không đủ giỏi, nhưng đủ đạt.

## Cảnh 6 · 2:55–3:30 · Lala thử ngay: trời mưa hay nắng
**Hình:** Một cửa sổ có bầu trời; khi chữ người dùng gõ là mưa, mây đen kéo tới, Lala mở ô; khi khác, mặt trời ló ra, Lala đội mũ.
**Trên màn hình:**
```python
troi = input()
if troi == "mưa":
    print("Nhớ mang ô nhé!")
else:
    print("Nhớ đội mũ nhé!")
```
**Lời đọc:**
> Lala viết một chương trình nhắc nhở mỗi sáng. Máy hỏi: trời hôm nay thế nào? Nếu người dùng gõ chữ mưa, máy nhắc mang ô. Không thì máy nhắc đội mũ. Để ý hai dấu bằng: mình đang hỏi chữ gõ vào có bằng chữ mưa không. Và chữ mưa nằm trong ngoặc kép, vì đó là một chuỗi.

## Cảnh 7 · 3:30–4:05 · Dừng lại thử nhé!
**Trên màn hình:**
```python
tien = 20000
gia = 25000
if gia <= tien:
    print("Mua được")
else:
    print("Để dành thêm")
```
**Lời đọc:**
> Đố em: Lala có hai mươi nghìn, món đồ giá hai mươi lăm nghìn. Máy in gì? Tạm dừng nhé. … Hai mươi lăm nghìn không nhỏ hơn hai mươi nghìn, điều kiện sai, nên máy in Để dành thêm.

## Cảnh 8 · 4:05–4:40 · Tóm tắt và bài tập
**Trên màn hình:** ① `if` … `else` để chọn · ② `:` + thụt vào 4 dấu cách · ③ `==` để so sánh bằng · ④ `elif` khi có nhiều trường hợp
**Lời đọc:**
> Tóm lại: if và else giúp máy chọn đường. Nhớ dấu hai chấm, thụt vào bốn dấu cách, và hai dấu bằng khi so sánh. Nhiều trường hợp thì thêm elif. Giờ em cho máy ra quyết định trong bài tập nhé: đạt hay chưa đạt, chẵn hay lẻ, đủ tiền mua chưa. Hẹn gặp em ở bài sau!

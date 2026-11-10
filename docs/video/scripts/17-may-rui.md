# Video 17 — May rủi

**Khái niệm:** `import random`, `random.randint`, `random.choice` · **Thời lượng:** ~4 phút 25 · **Bài tập đi kèm:** Tung xúc xắc, Chọn đại một môn, Hai con xúc xắc, Máy nghĩ một số

**Sau video, em biết:** lấy số ngẫu nhiên trong khoảng (tính cả hai đầu); chọn ngẫu nhiên một phần tử trong danh sách; vì sao bài tập kiểm tra khoảng chứ không kiểm tra một số cụ thể.

---

## Cảnh 1 · 0:00–0:30 · Mở đầu
**Hình:** Lala chơi cá ngựa, tung xúc xắc, mặt xúc xắc quay tít rồi dừng ở 5.
**Trên màn hình:** `Bài 17 · May rủi`
**Lời đọc:**
> Chào em! Trò chơi nào cũng cần một chút may rủi: tung xúc xắc, bốc thăm, rút bài. Chương trình của mình tới giờ chạy lần nào cũng ra một kết quả. Hôm nay, mình cho máy biết… bất ngờ!

## Cảnh 2 · 0:30–1:10 · Tung xúc xắc
**Hình:** Code hiện. Mỗi lần bấm Chạy, một con xúc xắc 3D lăn ra số khác nhau: 2, 6, 1, 4. Thước số 1–6 với hai đầu 1 và 6 có viền sáng "tính cả".
**Trên màn hình:**
```python
import random

so = random.randint(1, 6)
print(so)
```
**Lời đọc:**
> Đầu tiên, em gọi thư viện ngẫu nhiên bằng import random, giống như gọi chú rùa ra vậy. Rồi random chấm randint, mở ngoặc một, sáu. Lệnh này cho một số nguyên bất kỳ từ một đến sáu. Tính cả một, và tính cả sáu nhé. Mỗi lần chạy lại, em sẽ được một số khác. Chú ý: khác với range, ở đây số cuối được tính.

## Cảnh 3 · 1:10–1:40 · Bốc thăm
**Hình:** Ba tờ giấy "Toán", "Văn", "Anh" gấp lại thả vào một cái mũ. Một bàn tay bốc ra một tờ: "Văn". Bấm chạy lần nữa, bốc ra "Toán".
**Trên màn hình:**
```python
mon = ["Toán", "Văn", "Anh"]
print(random.choice(mon))
```
**Lời đọc:**
> Random chấm choice chọn đại một phần tử trong danh sách, giống như bốc thăm trong mũ. Em đưa vào danh sách môn học, máy bốc ra một môn. Dùng để chọn bạn trả bài, chọn món ăn trưa, hay chọn câu đố ngẫu nhiên đều được.

## Cảnh 4 · 1:40–2:10 · Máy nghĩ một số
**Hình:** Một bong bóng suy nghĩ trên đầu máy tính chứa số bí mật bị che. Lala đoán 4 → máy lắc đầu, lật mở số 8: "Sai rồi, số đó là 8".
**Trên màn hình:**
```python
bi_mat = random.randint(1, 10)
doan = int(input())
if doan == bi_mat:
    print("Đúng rồi!")
else:
    print("Sai rồi, số đó là", bi_mat)
```
**Lời đọc:**
> Ghép random với input và if, em đã có trò máy nghĩ một số rồi! Máy nghĩ một số từ một đến mười, cất vào hộp bí mật. Em đoán. Trúng thì máy khen, trật thì máy nói cho em biết số bí mật là mấy.

## Cảnh 5 · 2:10–2:45 · Bài tập kiểm tra thế nào?
**Hình:** Ba lần chạy cho ba số khác nhau; bộ chấm bài không so với một số cụ thể mà soi xem số có nằm trong vùng 1–6 được tô xanh không.
**Trên màn hình:** Bài tập kiểm tra: số có nằm trong khoảng đúng không?
**Lời đọc:**
> Vì kết quả mỗi lần chạy một khác, nên bài tập trên LaLaKode sẽ không kiểm tra một con số cụ thể. Nó kiểm tra xem số của em có nằm trong khoảng đúng không. Ví dụ tung hai con xúc xắc, tổng phải nằm trong khoảng từ hai đến mười hai.

## Cảnh 6 · 2:45–3:20 · Lala thử ngay: bốc thăm trả bài
**Hình:** Tên các bạn trong lớp quay như vòng quay may mắn, dừng ở một bạn; một ngôi sao rơi xuống tên bạn đó.
**Trên màn hình:**
```python
import random

lop = ["An", "Bình", "Chi", "Dũng"]
ten = random.choice(lop)
print(f"Mời bạn {ten} lên bảng!")
```
**Lời đọc:**
> Cô giáo của Lala muốn bốc thăm bạn trả bài thật công bằng. Lala viết giúp cô: một danh sách tên cả lớp, random chấm choice chọn ra một bạn, cất vào biến ten, rồi in lời mời bằng f-string. Mỗi lần chạy là một bạn khác, không ai biết trước. Hồi hộp lắm đấy!

## Cảnh 7 · 3:20–3:55 · Dừng lại thử nhé!
**Trên màn hình:**
```python
a = random.randint(1, 6)
b = random.randint(1, 6)
print(a + b)
```
**Lời đọc:**
> Đố em: tổng này nhỏ nhất là bao nhiêu, lớn nhất là bao nhiêu? Tạm dừng nhé. … Nhỏ nhất là hai, khi cả hai con đều ra một. Lớn nhất là mười hai, khi cả hai đều ra sáu.

## Cảnh 8 · 3:55–4:25 · Tóm tắt và bài tập
**Trên màn hình:** ① `import random` · ② `randint(1, 6)` tính cả 1 và 6 · ③ `choice(danh_sach)` bốc thăm
**Lời đọc:**
> Tóm lại: import random để dùng may rủi. Randint cho số ngẫu nhiên, tính cả hai đầu. Choice bốc thăm trong danh sách. Giờ em tung xúc xắc và làm trò máy nghĩ số nhé. Hẹn gặp em ở bài sau!

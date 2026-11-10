# Video 20 — Dự án cuối: trò chơi của em

**Khái niệm:** ghép `random`, `input`, `int`, `while`, `if/else`, biến đếm, f-string, hàm · **Thời lượng:** ~5 phút 55 · **Bài tập đi kèm:** Gợi ý lớn hơn hay nhỏ hơn, Đếm số lần đoán, Hàm nhận xét, Trò chơi hoàn chỉnh

**Sau video, em biết:** chia một chương trình lớn thành từng mảnh nhỏ; ghép các kiến thức đã học thành trò đoán số có gợi ý và đếm lượt; tự cải tiến trò chơi của mình.

---

## Cảnh 1 · 0:00–0:45 · Mở đầu
**Hình:** Một chiếc hộp đồ nghề mở ra; từng món bay lên kèm nhãn: `print`/`input`, `if`, `while`, danh sách, hàm, `random`. Lala đội mũ kỹ sư.
**Trên màn hình:** `Bài 20 · Dự án cuối: trò chơi của em`
**Lời đọc:**
> Chào em! Đây là bài cuối của khoá Python khởi động. Nhìn xem, em đã có cả một hộp đồ nghề: input để hỏi, print để trả lời, if để quyết định, while để lặp, danh sách và từ điển để cất đồ, hàm để gom việc, và random để mỗi lần chơi một khác. Hôm nay, mình dùng tất cả để làm một trò chơi thật sự: trò đoán số có gợi ý.

## Cảnh 2 · 0:45–1:25 · Chia nhỏ bài toán
**Hình:** Một bức tranh ghép bốn mảnh: ① Máy nghĩ số ② Người chơi đoán + gợi ý ③ Lặp đến khi đúng + đếm lượt ④ Thông báo kết quả. Mỗi mảnh sáng lên khi được nhắc.
**Trên màn hình:** ① Máy nghĩ số · ② Gợi ý lớn hơn/nhỏ hơn · ③ Lặp đến khi trúng, đếm lượt · ④ Chúc mừng + số lần
**Lời đọc:**
> Người viết code giỏi không bao giờ viết cả chương trình một lúc. Họ chia nhỏ ra. Trò chơi của mình có bốn mảnh. Một: máy nghĩ một số bí mật. Hai: người chơi đoán, máy gợi ý lớn hơn hay nhỏ hơn. Ba: lặp lại cho đến khi đoán trúng, vừa lặp vừa đếm số lần. Bốn: chúc mừng và báo số lần đã đoán. Mình làm từng mảnh nhé.

## Cảnh 3 · 1:25–2:00 · Mảnh 1 và 2: nghĩ số, gợi ý
**Hình:** Máy tính có bong bóng suy nghĩ chứa "?". Lala đoán 5 → mũi tên đi lên "Lớn hơn nhé"; đoán 15 → mũi tên đi xuống "Nhỏ hơn nhé".
**Trên màn hình:**
```python
import random

bi_mat = random.randint(1, 20)
doan = int(input())
if doan < bi_mat:
    print("Lớn hơn nhé")
else:
    print("Nhỏ hơn nhé")
```
**Lời đọc:**
> Mảnh một: import random, rồi cho máy nghĩ một số từ một đến hai mươi. Mảnh hai: nhận số người chơi đoán, nhớ bọc int. Nếu đoán nhỏ hơn số bí mật, máy nói lớn hơn nhé, để người chơi đoán số to hơn. Không thì máy nói nhỏ hơn nhé.

## Cảnh 4 · 2:00–3:05 · Mảnh 3: lặp đến khi trúng, đếm lượt
**Hình:** Toàn bộ code hiện ra, vòng `while` được bao bằng một đường viền xoay. Một bộ đếm `so_lan` cạnh đó nhảy 1, 2, 3 mỗi lần đoán sai. Dòng `doan = int(input())` cuối vòng nháy sáng với chú thích "dòng làm vòng lặp có thể dừng".
**Trên màn hình:**
```python
import random

bi_mat = random.randint(1, 20)
so_lan = 0
doan = int(input())

while doan != bi_mat:
    so_lan = so_lan + 1
    if doan < bi_mat:
        print("Lớn hơn nhé")
    else:
        print("Nhỏ hơn nhé")
    doan = int(input())

print(f"Đúng rồi! Em đoán {so_lan + 1} lần.")
```
**Lời đọc:**
> Mảnh ba: mình không biết người chơi đoán bao nhiêu lần, chỉ biết dừng khi đoán trúng. Vậy dùng while: chừng nào đoán còn khác số bí mật, thì còn lặp. Mỗi lượt sai, cộng thêm một vào biến số lần, đưa ra gợi ý, rồi hỏi tiếp. Em nhớ câu hỏi ở bài chín không: cái gì làm vòng lặp này dừng lại? Chính là dòng input ở cuối, vì nó thay đổi số đoán. Mảnh bốn: khi ra khỏi vòng lặp, nghĩa là đã trúng. Máy chúc mừng và báo số lần. Vì sao lại cộng thêm một? Vì biến số lần chỉ đếm những lần sai, còn lần đoán trúng cuối cùng chưa được đếm.

## Cảnh 5 · 3:05–3:35 · Thêm một chút gia vị: hàm nhận xét
**Hình:** Ba huy hiệu "Siêu quá!", "Giỏi lắm!", "Lần sau nhanh hơn nhé" xếp hàng; số lần đoán quyết định huy hiệu nào được trao.
**Trên màn hình:**
```python
def nhan_xet(so_lan):
    if so_lan < 3:
        return "Siêu quá!"
    elif so_lan < 6:
        return "Giỏi lắm!"
    return "Lần sau nhanh hơn nhé"
```
**Lời đọc:**
> Muốn trò chơi vui hơn? Thêm một hàm nhận xét. Đoán dưới ba lần thì Siêu quá. Dưới sáu lần thì Giỏi lắm. Còn lại thì Lần sau nhanh hơn nhé. Hàm này dùng if, elif, và return, những thứ em đã học cả rồi.

## Cảnh 6 · 3:35–4:15 · Lala thử ngay: chạy thử trò chơi
**Hình:** Màn hình chơi thử: số bí mật 13 (che), Lala đoán 10 → 'Lớn hơn nhé', 16 → 'Nhỏ hơn nhé', 13 → pháo giấy 'Đúng rồi! Em đoán 3 lần.'
**Trên màn hình:**
Lượt 1: `10` → `Lớn hơn nhé`
Lượt 2: `16` → `Nhỏ hơn nhé`
Lượt 3: `13` → `Đúng rồi! Em đoán 3 lần.`
**Lời đọc:**
> Mình chạy thử trò chơi nhé. Máy nghĩ một số, Lala chưa biết. Lala đoán mười, máy nói lớn hơn nhé. Đoán mười sáu, máy nói nhỏ hơn nhé. Vậy số bí mật nằm giữa mười và mười sáu. Lala đoán mười ba, trúng rồi! Máy báo đoán ba lần. Mẹo hay là luôn đoán số ở giữa khoảng còn lại, em sẽ tìm ra rất nhanh.

## Cảnh 7 · 4:15–5:10 · Dừng lại thử nhé! (và cải tiến)
**Hình:** Một bảng ý tưởng có các thẻ: "Giới hạn 5 lượt", "Hỏi chơi lại không?", "Đổi khoảng 1–100", "In tên người chơi". Lala bật bóng đèn ý tưởng.
**Trên màn hình:** Số bí mật là 12. Em đoán 6 → máy nói gì? Rồi em đoán 15 → máy nói gì?
**Lời đọc:**
> Đố em: số bí mật là mười hai. Em đoán sáu, máy nói gì? Rồi em đoán mười lăm, máy nói gì? Tạm dừng nhé. … Sáu nhỏ hơn mười hai, máy nói lớn hơn nhé. Mười lăm lớn hơn mười hai, máy nói nhỏ hơn nhé. Làm xong trò chơi, em hãy thử tự cải tiến: giới hạn số lượt, đổi khoảng số thành một đến một trăm, hay hỏi tên người chơi để chào. Trò chơi là của em mà!

## Cảnh 8 · 5:10–5:55 · Lời kết khoá học
**Hình:** Một tấm bản đồ nhiệm vụ với 20 cột mốc lần lượt sáng lên, Lala chạy dọc theo đường. Cuối đường là cờ "Hoàn thành". Pháo giấy. Logo LaLaKode và khẩu hiệu "Nền tảng học lập trình cho người Việt".
**Trên màn hình:** `20 bài học · 1 trò chơi của em`
**Lời đọc:**
> Em đã đi hết hai mươi bài học. Từ một dòng print đầu tiên, giờ em đã viết được cả một trò chơi. Đó là chương trình thật sự đầu tiên của em, và mình rất tự hào về em. Em hãy làm bốn bài tập cuối để ghép trò chơi hoàn chỉnh, rồi khoe với bố mẹ và bạn bè nhé. Cảm ơn em đã học cùng Lala và LaLaKode. Hẹn gặp lại em ở những khoá học tiếp theo!

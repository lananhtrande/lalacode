# Video 09 — Lặp đến khi nào

**Khái niệm:** `while`, điều kiện dừng, vòng lặp vô hạn, `+=` · **Thời lượng:** ~4 phút 35 · **Bài tập đi kèm:** Đếm ngược, Cộng dồn, Trò đoán số, Xoắn ốc của rùa

**Sau video, em biết:** khác nhau giữa `for` (biết số lần) và `while` (biết khi nào dừng); phải có dòng làm thay đổi điều kiện; vòng lặp vô hạn là gì; viết tắt `dem += 1`.

---

## Cảnh 1 · 0:00–0:35 · Mở đầu
**Hình:** Lala ăn bánh quy từ một hũ. Mỗi lần ăn, hũ vơi đi. Lala tự nhủ: "ăn đến khi nào hết thì thôi".
**Trên màn hình:** `Bài 9 · Lặp đến khi nào`
**Lời đọc:**
> Chào em! Bài trước, vòng lặp for lặp đúng số lần mình đã biết trước. Nhưng có lúc mình chưa biết phải lặp bao nhiêu lần, chỉ biết khi nào thì dừng. Như Lala ăn bánh: ăn cho đến khi hết hũ thì thôi. Lúc đó, mình dùng vòng lặp "quai".

## Cảnh 2 · 0:35–1:10 · `while` từng bước
**Hình:** Code hiện cạnh một "cổng kiểm tra" có đèn. Hộp `dem` = 1 đi tới cổng: `dem <= 3?` đèn xanh → vào trong, in 1, cộng thêm 1. Quay lại cổng với 2 … Khi `dem` = 4, đèn đỏ, cổng đóng, vòng lặp kết thúc.
**Trên màn hình:**
```python
dem = 1

while dem <= 3:
    print(dem)
    dem = dem + 1
```
**Lời đọc:**
> Đọc như tiếng Việt: chừng nào đếm còn nhỏ hơn hoặc bằng ba, thì còn lặp. Mỗi lượt, máy kiểm tra điều kiện trước. Đúng thì làm phần bên trong: in số, rồi cộng thêm một. Sau đó quay lại kiểm tra tiếp. Khi đếm thành bốn, điều kiện sai, vòng lặp dừng lại.

## Cảnh 3 · 1:10–1:50 · Dòng quan trọng nhất
**Hình:** Dòng `dem = dem + 1` bị xoá. Hộp `dem` đứng mãi ở số 1, đi vòng vòng như con quay, khung kết quả in "1 1 1 1 1…" tràn màn hình. Một chiếc đồng hồ đếm vài giây, rồi LaLaKode hiện thông báo "Code chạy lâu quá, có thể có vòng lặp vô hạn", nút Dừng.
**Trên màn hình:** ⚠ Thiếu `dem = dem + 1` → vòng lặp vô hạn
**Lời đọc:**
> Dòng đếm bằng đếm cộng một cực kỳ quan trọng. Nếu thiếu nó, đếm mãi mãi bằng một. Điều kiện mãi mãi đúng. Và chương trình chạy không bao giờ dừng. Người ta gọi đó là vòng lặp vô hạn. Nếu em lỡ viết như vậy, đừng lo: LaLaKode sẽ tự dừng sau vài giây và báo cho em biết. Em chỉ cần tìm xem mình quên dòng nào.

## Cảnh 4 · 1:50–2:10 · Viết tắt
**Hình:** `dem = dem + 1` co lại thành `dem += 1` với hiệu ứng nén.
**Trên màn hình:** `dem = dem + 1` ⟶ `dem += 1`
**Lời đọc:**
> Một mẹo nhỏ: đếm cộng bằng một là cách viết ngắn của đếm bằng đếm cộng một. Hai cách giống hệt nhau, em dùng cách nào cũng được.

## Cảnh 5 · 2:10–2:45 · `while` với `input`: trò đoán số
**Hình:** Một chiếc hộp bí mật có dấu "?" chứa số 7. Lala đoán 3 → "Chưa đúng", đoán 9 → "Chưa đúng", đoán 7 → hộp mở, pháo giấy "Chính xác!".
**Trên màn hình:**
```python
doan = int(input())
while doan != 7:
    print("Chưa đúng")
    doan = int(input())
print("Chính xác!")
```
**Lời đọc:**
> While rất hợp với trò chơi đoán số. Mình không biết người chơi sẽ đoán bao nhiêu lần. Chỉ biết: chừng nào đoán còn khác bảy thì còn hỏi tiếp. Để ý dòng input ở cuối vòng lặp: chính nó làm thay đổi số đoán, nên vòng lặp mới có cơ hội dừng.

## Cảnh 6 · 2:45–3:25 · Lala thử ngay: tiết kiệm mua xe đạp
**Hình:** Một con heo đất; mỗi tuần một đồng xu rơi vào, thanh tiến độ tới chiếc xe đạp dài dần.
**Trên màn hình:**
```python
tiet_kiem = 0
tuan = 0
while tiet_kiem < 50000:
    tiet_kiem = tiet_kiem + 10000
    tuan = tuan + 1
print(f"Sau {tuan} tuần là đủ tiền")
```
**Lời đọc:**
> Lala muốn mua chiếc xe đạp đồ chơi giá năm mươi nghìn. Mỗi tuần bạn ấy bỏ heo mười nghìn. Hỏi mấy tuần thì đủ? Mình không biết trước, nên dùng while. Chừng nào tiền còn chưa đủ, thì bỏ thêm mười nghìn và đếm thêm một tuần. Dòng cộng tiền chính là dòng làm vòng lặp dừng lại. Kết quả: sau năm tuần là đủ tiền.

## Cảnh 7 · 3:25–4:00 · Dừng lại thử nhé!
**Trên màn hình:**
```python
so = 3
while so > 0:
    print(so)
    so -= 1
```
**Lời đọc:**
> Đố em: đoạn này in ra gì? Tạm dừng nhé. … Ba, hai, một. Khi số bằng không, điều kiện số lớn hơn không bị sai, nên vòng lặp dừng. Một màn đếm ngược!

## Cảnh 8 · 4:00–4:35 · Tóm tắt và bài tập
**Trên màn hình:** ① `for`: biết số lần · `while`: biết khi nào dừng · ② Luôn có dòng làm điều kiện thay đổi · ③ Lỡ lặp vô hạn? LaLaKode tự dừng
**Lời đọc:**
> Tóm lại: for khi biết số lần, while khi biết lúc nào dừng. Mỗi lần viết while, em luôn tự hỏi: cái gì làm vòng lặp này dừng lại? Giờ em thử đếm ngược, cộng dồn, làm trò đoán số và vẽ xoắn ốc cho rùa nhé. Hẹn gặp em ở bài sau!

# Video 05 — Số và phép tính

**Khái niệm:** `+ - * /`, `int()`, số trong f-string · **Thời lượng:** ~4 phút 40 · **Bài tập đi kèm:** Cộng hai số, Tiền tiêu vặt, Tuổi sang năm, Điểm trung bình

**Sau video, em biết:** viết phép tính trong Python; `*` là nhân, `/` là chia ra số thập phân; `input()` luôn trả về chữ nên phải đổi bằng `int()`; đặt phép tính trong f-string.

---

## Cảnh 1 · 0:00–0:30 · Mở đầu
**Hình:** Lala ôm chiếc máy tính bỏ túi khổng lồ, bấm loạn xạ. Python hiện ra như một chiếc máy tính siêu tốc.
**Trên màn hình:** `Bài 5 · Số và phép tính`
**Lời đọc:**
> Chào em! Em có biết máy tính được tạo ra đầu tiên để làm gì không? Để tính toán! Hôm nay mình biến Python thành một chiếc máy tính siêu nhanh, tính tiền tiêu vặt, tính tuổi, tính điểm trung bình.

## Cảnh 2 · 0:30–1:10 · Bốn phép tính
**Hình:** Bốn dòng code hiện lần lượt, mỗi dòng có biểu tượng phép tính phóng to bên cạnh. Ở dòng nhân, dấu `*` biến hình thành dấu `×`. Ở dòng chia, dấu `/` biến thành `÷` và kết quả 3.5 có dấu chấm tô sáng.
**Trên màn hình:**
```python
print(7 + 3)
print(7 - 3)
print(7 * 3)
print(7 / 2)
```
Kết quả: `10` `4` `21` `3.5`
**Lời đọc:**
> Em viết phép tính vào trong print, máy tính ra kết quả ngay. Cộng, trừ thì giống hệt toán. Nhưng trên bàn phím không có dấu nhân, nên Python dùng dấu sao. Và chia thì dùng dấu gạch chéo. Chia xong, Python cho ra số thập phân: bảy chia hai được ba chấm năm. Chú ý, Python dùng dấu chấm cho số thập phân, không phải dấu phẩy như mình hay viết.

## Cảnh 3 · 1:10–1:40 · Tính với biến
**Hình:** Hộp `moi_ngay` chứa 5000. Bảy hộp tiền xếp hàng, nhân lên, tổng hiện 35000 với đồng xu lấp lánh.
**Trên màn hình:**
```python
moi_ngay = 5000
print(moi_ngay * 7)
```
Kết quả: `35000`
**Lời đọc:**
> Phép tính dùng được cả biến. Mỗi ngày em để dành năm nghìn đồng, cất vào hộp moi ngày. Một tuần bảy ngày, mình lấy moi ngày nhân bảy. Máy tính ra ba mươi lăm nghìn. Sau này em đổi số tiền mỗi ngày, kết quả tự đổi theo.

## Cảnh 4 · 1:40–2:25 · Cái bẫy của `input()`
**Hình:** Người dùng gõ 12. Số 12 bay vào hộp, nhưng mang trang phục "chữ" (có ngoặc kép bao quanh). Khi cộng với 1, khung lỗi ⚠ rung lên. Sau đó `int()` hiện như một chiếc máy biến hình: chữ "12" chui vào, số 12 chui ra. Phép cộng chạy được, ra 13.
**Trên màn hình:**
```python
tuoi = int(input())
print(tuoi + 1)
```
Chú thích: `input()` luôn cho **chữ** · `int()` đổi chữ thành **số**
**Lời đọc:**
> Bây giờ đến một chỗ rất hay nhầm. Thứ input nhận về luôn luôn là chữ, kể cả khi người ta gõ số. Mười hai mà người dùng gõ vào thực ra là chữ mười hai, không phải số mười hai. Python không biết cộng chữ với số, nên nó báo lỗi ngay. Cách sửa: bọc input vào trong int. Int giống như chiếc máy biến chữ thành số. Giờ thì cộng một được rồi: mười ba.

## Cảnh 5 · 2:25–2:50 · Số trong câu chữ
**Hình:** Câu "Sang năm em ___ tuổi" có chỗ trống; phép tính `tuoi + 1` rơi vào ngoặc nhọn, máy tự tính rồi điền 13.
**Trên màn hình:**
```python
print(f"Sang năm em {tuoi + 1} tuổi")
```
Kết quả: `Sang năm em 13 tuổi`
**Lời đọc:**
> Còn chiều ngược lại, muốn ghép số vào câu chữ, em không cần đổi gì cả. F-string lo hết. Em còn đặt được cả phép tính trong ngoặc nhọn, máy sẽ tính trước rồi mới điền vào câu.

## Cảnh 6 · 2:50–3:30 · Lala thử ngay: tiền mua kem
**Hình:** Ba que kem hoạt hình, mỗi que có nhãn giá; phép tính hiện dần, đồng xu rơi vào ví.
**Trên màn hình:**
```python
gia_kem = 8000
so_que = 3
tong = gia_kem * so_que
print(f"Hết {tong} đồng")
```
**Lời đọc:**
> Lala muốn mua ba que kem, mỗi que tám nghìn đồng. Bạn ấy cất giá vào một biến, số que vào một biến, rồi nhân lên và cất vào biến tong. Cuối cùng in ra bằng f-string: Hết hai mươi bốn nghìn đồng. Em thấy không, mình đặt tên biến rõ ràng thì đọc code như đọc một bài toán có lời văn vậy.

## Cảnh 7 · 3:30–4:10 · Dừng lại thử nhé!
**Trên màn hình:**
```python
a = 8
b = 6
print((a + b) / 2)
```
**Lời đọc:**
> Đố em: đoạn này in ra gì? Gợi ý: đây là cách tính điểm trung bình. Tạm dừng nhé. … Tám cộng sáu là mười bốn, chia hai là bảy. Nhưng vì phép chia luôn cho số thập phân, máy in bảy chấm không. Và nhớ dấu ngoặc tròn: cộng trước, chia sau.

## Cảnh 8 · 4:10–4:40 · Tóm tắt và bài tập
**Trên màn hình:** ① `* ` nhân, `/` chia → số thập phân · ② `input()` cho chữ → bọc `int()` để tính · ③ f-string ghép được số và phép tính
**Lời đọc:**
> Tóm lại: dấu sao là nhân, gạch chéo là chia. Input cho chữ, muốn tính phải bọc int. F-string ghép được cả số lẫn phép tính. Giờ em tính tiền tiêu vặt và điểm trung bình trong bài tập nhé. Bài sau, mình sẽ dạy máy biết chọn lựa!

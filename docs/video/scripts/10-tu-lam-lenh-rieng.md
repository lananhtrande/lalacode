# Video 10 — Tự làm lệnh riêng

**Khái niệm:** `def`, gọi hàm, tham số, `return` · **Thời lượng:** ~4 phút 35 · **Bài tập đi kèm:** Lời chào riêng, Chào kèm tên, Hàm cộng hai số, Diện tích hình chữ nhật, Hàm vẽ hình vuông

**Sau video, em biết:** định nghĩa hàm bằng `def` và gọi hàm; truyền tham số; `return` trả giá trị về; khác nhau giữa `print` và `return`.

> Ghi chú nội dung: `lesson.md` của bài này còn câu "Bài cuối của khoá rồi đấy" — khoá nay có 20 bài, cần sửa. Kịch bản không dùng câu này.

---

## Cảnh 1 · 0:00–0:35 · Mở đầu
**Hình:** Lala làm bánh. Mỗi lần làm phải đọc lại cả tờ công thức dài. Lala đặt tên công thức là "lam_banh", từ đó chỉ cần hô "lam_banh!" là bánh ra lò.
**Trên màn hình:** `Bài 10 · Tự làm lệnh riêng`
**Lời đọc:**
> Chào em! Từ đầu khoá, em đã dùng nhiều lệnh Python cho sẵn: print, len, input. Hôm nay, em sẽ tự tạo ra lệnh của riêng mình! Giống như đặt tên cho một công thức làm bánh: lần sau chỉ cần gọi tên, khỏi phải đọc lại từng bước. Trong Python, lệnh tự tạo ấy gọi là hàm.

## Cảnh 2 · 0:35–1:15 · `def` và gọi hàm
**Hình:** Code hiện. Phần `def chao():` được đóng thành một "tấm thẻ công thức" có nhãn `chao`. Dòng `chao()` ở dưới: tấm thẻ bay lên, chạy, khung kết quả in "Xin chào!". Gọi thêm lần nữa → in thêm lần nữa.
**Trên màn hình:**
```python
def chao():
    print("Xin chào!")

chao()
```
**Lời đọc:**
> "Đép" là viết tắt của define, nghĩa là định nghĩa. Em viết def, tên hàm, cặp ngoặc tròn, và dấu hai chấm. Phần việc của hàm thụt vào bên dưới. Nhưng viết xong, hàm chưa chạy đâu nhé, mình mới chỉ cất công thức đi thôi. Muốn chạy, em phải gọi tên nó kèm cặp ngoặc tròn. Gọi bao nhiêu lần, chạy bấy nhiêu lần.

## Cảnh 3 · 1:15–1:45 · Tham số
**Hình:** Tấm thẻ công thức có thêm một "khe" ghi `ten`. Chữ "Lan" được nhét vào khe → "Xin chào Lan!". Rồi "Minh" → "Xin chào Minh!".
**Trên màn hình:**
```python
def chao(ten):
    print(f"Xin chào {ten}!")

chao("Lan")
chao("Minh")
```
**Lời đọc:**
> Hàm còn nhận thêm thông tin, gọi là tham số. Em đặt tên tham số trong ngoặc tròn khi định nghĩa. Mỗi lần gọi, em đưa vào một giá trị khác nhau. Một hàm viết một lần, chào được bao nhiêu người cũng được.

## Cảnh 4 · 1:45–2:15 · `return` trả kết quả về
**Hình:** Hàm `cong` là một chiếc máy có hai phễu `a`, `b`. Số 3 và 4 rơi vào, máy chạy, đẩy ra một quả bóng số 7 theo băng chuyền chữ `return` quay về chỗ gọi; `print` ngoài kia nhận quả bóng và in ra.
**Trên màn hình:**
```python
def cong(a, b):
    return a + b

print(cong(3, 4))
```
**Lời đọc:**
> Hàm cũng có thể trả kết quả về, bằng chữ "rì-tơn". Hàm cộng nhận hai số a và b, rồi trả về tổng của chúng. Kết quả được đưa ngược về đúng chỗ đã gọi hàm. Ở đây, print nhận số bảy và in ra.

## Cảnh 5 · 2:15–2:45 · `print` khác `return` thế nào?
**Hình:** Hai chiếc máy cạnh nhau. Máy A dùng `print`: số bay lên màn hình rồi biến mất, cái hộp `kq` bên dưới vẫn trống. Máy B dùng `return`: số rơi vào hộp `kq`, rồi còn được nhân đôi tiếp.
**Trên màn hình:** `print` → chỉ hiện ra màn hình · `return` → đưa giá trị về để cất vào biến, tính tiếp
**Lời đọc:**
> Chỗ này nhiều bạn hay nhầm. Print chỉ hiện ra màn hình cho mình nhìn, rồi thôi. Return thì đưa giá trị về cho chỗ gọi, để em cất vào biến hay tính tiếp. Trong bài tập hàm cộng, em nhớ dùng return, đừng print trong hàm nhé.

## Cảnh 6 · 2:45–3:25 · Lala thử ngay: hàm đổi tiền
**Hình:** Chiếc máy đổi tiền: số nghìn rơi vào một đầu, số đồng đầy đủ chạy ra đầu kia.
**Trên màn hình:**
```python
def doi_ra_nghin(so_nghin):
    return so_nghin * 1000

print(doi_ra_nghin(5))
```
**Lời đọc:**
> Lala hay viết tiền theo nghìn: năm nghìn, mười nghìn. Bạn ấy làm một hàm đổi sang số đồng đầy đủ. Hàm nhận số nghìn, nhân với một nghìn, và trả về bằng return. Gọi với năm, hàm trả về năm nghìn. Vì có return, Lala còn dùng kết quả để tính tiếp được, ví dụ cộng với giá một món đồ khác.

## Cảnh 7 · 3:25–4:00 · Dừng lại thử nhé!
**Trên màn hình:**
```python
def dien_tich(dai, rong):
    return dai * rong

print(dien_tich(8, 3) + 1)
```
**Lời đọc:**
> Đố em: máy in ra số mấy? Tạm dừng nhé. … Diện tích tám nhân ba là hai mươi bốn. Hàm trả về hai mươi bốn, cộng thêm một là hai mươi lăm. Thấy chưa, nhờ return mà mình tính tiếp được.

## Cảnh 8 · 4:00–4:35 · Tóm tắt và bài tập
**Trên màn hình:** ① `def ten_ham():` định nghĩa · ② Gọi: `ten_ham()` · ③ Tham số đưa thông tin vào · ④ `return` đưa kết quả ra
**Lời đọc:**
> Tóm lại: def để định nghĩa hàm, gọi tên kèm ngoặc tròn để chạy. Tham số đưa thông tin vào, return đưa kết quả ra. Giờ em tự làm lệnh chào, lệnh cộng, lệnh tính diện tích, và cả lệnh vẽ hình vuông cho rùa nhé. Hẹn gặp em ở bài sau!

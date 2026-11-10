# Video 08 — Danh sách của em

**Khái niệm:** list, chỉ số từ 0, `len`, `append`, `sum`, `for` qua danh sách · **Thời lượng:** ~4 phút 10 · **Bài tập đi kèm:** Danh sách điểm, Phần tử đầu tiên, Thêm một bạn, Tổng và trung bình

**Sau video, em biết:** tạo danh sách bằng ngoặc vuông; lấy phần tử bằng số thứ tự đếm từ 0; dùng `len`, `append`, `sum`; đi qua từng phần tử bằng `for`.

---

## Cảnh 1 · 0:00–0:30 · Mở đầu
**Hình:** Lala có bốn điểm 8, 9, 7, 10 mà chỉ có một cái hộp — nhét mãi không vừa. Một chiếc tàu hoả nhiều toa chạy vào.
**Trên màn hình:** `Bài 8 · Danh sách của em`
**Lời đọc:**
> Chào em! Lala có điểm của bốn môn, nhưng một cái hộp chỉ đựng được một thứ thôi. Chẳng lẽ phải tạo bốn cái hộp? Hôm nay mình có một thứ hay hơn: danh sách. Hãy tưởng tượng một đoàn tàu, mỗi toa chở một thứ.

## Cảnh 2 · 0:30–0:55 · Tạo danh sách
**Hình:** Code hiện; bốn số bay vào bốn toa tàu nối nhau, đầu tàu ghi nhãn `diem`. Ngoặc vuông tô sáng, dấu phẩy nháy giữa các toa.
**Trên màn hình:**
```python
diem = [8, 9, 7, 10]
print(diem)
```
Kết quả: `[8, 9, 7, 10]`
**Lời đọc:**
> Danh sách viết trong cặp ngoặc vuông. Các phần tử cách nhau bằng dấu phẩy. Cả đoàn tàu mang một cái tên chung là diem. In ra, em thấy cả bốn số, vẫn nằm trong ngoặc vuông.

## Cảnh 3 · 0:55–1:25 · Lấy toa số mấy?
**Hình:** Các toa được đánh số 0, 1, 2, 3 trên bánh xe. Một bàn tay chọn toa 0 → số 8 bật lên; chọn toa 2 → số 7. Lala nhắc "đếm từ 0, giống range!".
**Trên màn hình:**
```python
print(diem[0])   # 8
print(diem[2])   # 7
```
**Lời đọc:**
> Muốn lấy một phần tử, em viết tên danh sách, rồi số thứ tự trong ngoặc vuông. Nhớ không, Python đếm từ không! Toa đầu tiên là toa số không, nên diem không là tám. Diem hai là toa thứ ba, số bảy.

## Cảnh 4 · 1:25–2:00 · Ba lệnh hay dùng
**Hình:** Ba hiệu ứng: `len` đếm số toa (1-2-3-4); `append(6)` nối thêm một toa mới ở cuối; `sum` gộp hết các số vào một cái bao, ra tổng.
**Trên màn hình:**
```python
print(len(diem))   # 4
diem.append(6)
print(diem)        # [8, 9, 7, 10, 6]
print(sum(diem))   # 40
```
**Lời đọc:**
> Có ba lệnh em sẽ dùng rất nhiều. Len cho biết danh sách có bao nhiêu phần tử. Diem chấm append, mở ngoặc sáu, nối thêm số sáu vào cuối đoàn tàu. Còn sum cộng hết tất cả các số lại. Muốn tính điểm trung bình? Lấy sum chia cho len là xong.

## Cảnh 5 · 2:00–2:30 · Đi qua từng toa
**Hình:** Một người soát vé hoạt hình đi dọc đoàn tàu; mỗi toa đi qua, giá trị trong toa bay vào hộp `d` rồi in ra.
**Trên màn hình:**
```python
for d in diem:
    print(d)
```
**Lời đọc:**
> Vòng lặp for đi qua từng phần tử rất gọn. Đọc là: với mỗi d trong danh sách diem, in d ra. Lần này, d không phải số thứ tự đâu nhé, mà là chính giá trị trong từng toa: tám, rồi chín, rồi bảy.

## Cảnh 6 · 2:30–3:05 · Lala thử ngay: danh sách đi chợ
**Hình:** Một tờ giấy đi chợ; mỗi lần `append`, một món đồ hoạt hình (trứng, rau) nhảy vào giỏ.
**Trên màn hình:**
```python
mua = ["trứng", "rau"]
mua.append("sữa")
print(f"Cần mua {len(mua)} món")
for mon in mua:
    print(mon)
```
**Lời đọc:**
> Lala đi chợ giúp mẹ. Danh sách lúc đầu có trứng và rau. Mẹ dặn thêm sữa, nên Lala dùng append thêm vào cuối. Rồi in xem cần mua mấy món, bằng len. Cuối cùng, đi qua từng món trong danh sách và in ra. Một danh sách, ba lệnh quen thuộc, và một vòng lặp for.

## Cảnh 7 · 3:05–3:35 · Dừng lại thử nhé!
**Trên màn hình:**
```python
ban = ["Lan", "Minh", "Hoa"]
print(ban[1])
print(len(ban))
```
**Lời đọc:**
> Đố em: hai dòng in ra gì? Tạm dừng nhé. … Ban một là toa thứ hai, Minh. Và danh sách có ba bạn, nên len là ba.

## Cảnh 8 · 3:35–4:10 · Tóm tắt và bài tập
**Trên màn hình:** ① `[ ... ]` danh sách · ② `diem[0]` là phần tử đầu · ③ `len`, `append`, `sum` · ④ `for d in diem:` đi qua từng giá trị
**Lời đọc:**
> Tóm lại: danh sách như đoàn tàu, viết trong ngoặc vuông. Toa đầu là số không. Len để đếm, append để thêm, sum để cộng. Và for đi qua từng toa. Giờ em làm danh sách điểm và danh sách bạn bè trong bài tập nhé. Hẹn gặp em ở bài sau!

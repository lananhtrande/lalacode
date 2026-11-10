# Video 15 — Hàm có nhiều việc

**Khái niệm:** nhiều tham số, thứ tự tham số, giá trị mặc định, `return` dừng hàm · **Thời lượng:** ~4 phút 05 · **Bài tập đi kèm:** Giới thiệu bản thân, Xếp loại học lực, Lời chào mặc định, Tính tiền mua vở

**Sau video, em biết:** viết hàm nhận nhiều tham số; thứ tự khi gọi phải đúng; đặt giá trị mặc định (đứng sau tham số thường); gặp `return` là hàm kết thúc.

---

## Cảnh 1 · 0:00–0:25 · Mở đầu
**Hình:** Chiếc máy làm bánh của Lala ở bài 10 được nâng cấp: thêm nhiều phễu, thêm núm vặn "mặc định".
**Trên màn hình:** `Bài 15 · Hàm có nhiều việc`
**Lời đọc:**
> Chào em! Ở bài mười, em đã tự làm được lệnh riêng. Hôm nay, mình nâng cấp hàm: nhận nhiều thông tin cùng lúc, có sẵn giá trị mặc định, và biết dừng đúng lúc.

## Cảnh 2 · 0:25–1:00 · Nhiều tham số và thứ tự
**Hình:** Hàm có hai phễu theo thứ tự `ten`, `tuoi`. "Lan" vào phễu 1, 12 vào phễu 2 → "Lan, 12 tuổi". Sau đó gọi ngược: 12 rơi vào phễu `ten`, "Lan" vào phễu `tuoi` → "12, Lan tuổi"; Lala bật cười.
**Trên màn hình:**
```python
def gioi_thieu(ten, tuoi):
    print(f"{ten}, {tuoi} tuổi")

gioi_thieu("Lan", 12)    # Lan, 12 tuổi
gioi_thieu(12, "Lan")    # 12, Lan tuổi  ✗
```
**Lời đọc:**
> Hàm nhận được nhiều tham số, cách nhau bằng dấu phẩy. Khi gọi, Python đưa giá trị vào theo đúng thứ tự: cái đầu vào tham số đầu, cái thứ hai vào tham số thứ hai. Nếu em đảo thứ tự, mười hai sẽ chui vào chỗ tên, và câu in ra nghe rất lạ. Thứ tự rất quan trọng nhé.

## Cảnh 3 · 1:00–1:35 · Giá trị mặc định
**Hình:** Phễu `loi` có sẵn một nút vặn ghi "Xin chào". Gọi chỉ với tên → dùng "Xin chào". Gọi kèm "Chúc ngủ ngon" → nút vặn bị đổi.
**Trên màn hình:**
```python
def chao(ten, loi="Xin chào"):
    print(f"{loi} {ten}!")

chao("Lan")                     # Xin chào Lan!
chao("Minh", "Chúc ngủ ngon")   # Chúc ngủ ngon Minh!
```
Chú thích: tham số có mặc định đứng **sau** tham số thường
**Lời đọc:**
> Tham số còn có thể có giá trị mặc định. Em viết dấu bằng ngay trong ngoặc khi định nghĩa. Nếu lúc gọi em không đưa lời chào, hàm tự dùng Xin chào. Nếu em đưa vào, hàm dùng lời của em. Một quy tắc: tham số có mặc định phải đứng sau các tham số thường.

## Cảnh 4 · 1:35–2:10 · `return` dừng hàm ngay
**Hình:** Hàm `xep_loai` là một con đường có hai cánh cửa `return`. Điểm 9 đi tới cửa đầu (`diem >= 8`) → bước ra ngoài với chữ "Giỏi", phần đường phía sau mờ đi. Điểm 7 đi qua cửa đầu, ra ở cửa thứ hai với "Khá".
**Trên màn hình:**
```python
def xep_loai(diem):
    if diem >= 8:
        return "Giỏi"
    return "Khá"
```
**Lời đọc:**
> Gặp return là hàm kết thúc ngay lập tức. Những dòng phía sau không chạy nữa. Nhờ vậy, em viết được hàm xếp loại rất gọn: nếu điểm từ tám, trả về Giỏi và dừng luôn. Không thì đi tiếp xuống dưới, trả về Khá. Trong bài tập, em sẽ thêm một mức nữa: Cần cố gắng.

## Cảnh 5 · 2:10–2:30 · Hàm gọi hàm
**Hình:** Hàm `nhan_xet` gọi `xep_loai` bên trong, hai chiếc máy nối bằng băng chuyền.
**Trên màn hình:**
```python
def nhan_xet(ten, diem):
    print(f"{ten}: {xep_loai(diem)}")
```
**Lời đọc:**
> Hàm còn gọi được hàm khác. Hàm nhận xét dùng kết quả của hàm xếp loại. Giống như ghép các chiếc máy nhỏ thành một dây chuyền lớn.

## Cảnh 6 · 2:30–3:05 · Lala thử ngay: hoá đơn căng tin
**Hình:** Một tờ hoá đơn hoạt hình, mỗi lần gọi hàm thêm một dòng món ăn và giá.
**Trên màn hình:**
```python
def dong_hoa_don(mon, so_luong, gia=5000):
    print(f"{mon} x{so_luong}: {so_luong * gia} đồng")

dong_hoa_don("Bánh mì", 2, 15000)
dong_hoa_don("Nước", 1)
```
**Lời đọc:**
> Lala viết một hàm in từng dòng hoá đơn ở căng tin. Hàm nhận tên món, số lượng, và giá, giá mặc định là năm nghìn. Bánh mì có giá riêng nên Lala đưa vào. Nước thì dùng giá mặc định nên không cần ghi. Để ý thứ tự: tên món trước, số lượng sau, giá cuối cùng.

## Cảnh 7 · 3:05–3:35 · Dừng lại thử nhé!
**Trên màn hình:**
```python
def tinh_tien(so_quyen, gia=7000):
    return so_quyen * gia

print(tinh_tien(3))
```
**Lời đọc:**
> Đố em: mua ba quyển vở giá mặc định thì hết bao nhiêu? Tạm dừng nhé. … Ba nhân bảy nghìn là hai mươi mốt nghìn.

## Cảnh 8 · 3:35–4:05 · Tóm tắt và bài tập
**Trên màn hình:** ① Nhiều tham số: đúng thứ tự · ② Mặc định: `loi="Xin chào"`, đứng sau · ③ Gặp `return` là dừng
**Lời đọc:**
> Tóm lại: nhiều tham số thì nhớ đúng thứ tự. Giá trị mặc định đứng sau tham số thường. Gặp return là hàm dừng. Giờ em viết hàm giới thiệu, xếp loại và tính tiền vở trong bài tập nhé. Hẹn gặp em ở bài sau, rùa sẽ quay lại!

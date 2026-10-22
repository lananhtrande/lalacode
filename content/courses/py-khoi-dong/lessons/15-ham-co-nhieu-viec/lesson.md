# Hàm có nhiều việc

Hàm nhận được **nhiều tham số**, cách nhau bằng dấu phẩy:

```python
def gioi_thieu(ten, tuoi):
    print(f"{ten}, {tuoi} tuổi")

gioi_thieu("Lan", 12)
```

Thứ tự rất quan trọng: `gioi_thieu(12, "Lan")` sẽ in sai, vì Python đưa 12 vào chỗ `ten`.

Tham số cũng đặt được **giá trị mặc định**:

```python
def chao(ten, loi="Xin chào"):
    print(f"{loi} {ten}!")

chao("Lan")                 # Xin chào Lan!
chao("Minh", "Chúc ngủ ngon")  # Chúc ngủ ngon Minh!
```

Tham số có mặc định phải đứng **sau** các tham số thường.

Hàm cũng gọi được hàm khác, và `return` dừng hàm ngay tại đó:

```python
def xep_loai(diem):
    if diem >= 8:
        return "Giỏi"
    return "Khá"
```

Gặp `return` là hàm kết thúc, những dòng sau không chạy nữa.

# Danh sách thông minh hơn

Em đã biết `len` và `sum`. Python còn cho sẵn mấy lệnh rất tiện:

```python
diem = [8, 5, 10, 7]

print(max(diem))      # 10 — số lớn nhất
print(min(diem))      # 5  — số nhỏ nhất
print(sorted(diem))   # [5, 7, 8, 10] — xếp từ bé tới lớn
```

`sorted` tạo ra danh sách **mới** đã xếp, danh sách cũ vẫn nguyên.

Muốn chọn ra những phần tử thoả điều kiện, em ghép `for` với `if`:

```python
cao = []
for d in diem:
    if d >= 8:
        cao.append(d)
print(cao)            # [8, 10]
```

Đọc là: *với mỗi điểm trong danh sách, nếu điểm từ 8 trở lên thì thêm vào danh sách `cao`*.

Nhớ tạo danh sách rỗng `[]` trước khi thêm vào nhé.

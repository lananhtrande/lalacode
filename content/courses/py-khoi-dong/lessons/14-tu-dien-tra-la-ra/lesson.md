# Từ điển: tra là ra

Danh sách tìm theo **số thứ tự**. Nhưng đôi khi em muốn tìm theo **tên**: điểm môn Toán là mấy? Lúc đó dùng **từ điển**.

```python
diem = {"Toán": 9, "Văn": 7}

print(diem["Toán"])    # 9
```

Từ điển viết trong dấu ngoặc nhọn. Mỗi mục có hai phần: **khoá** đứng trước dấu hai chấm, **giá trị** đứng sau. Tra bằng khoá, giống tra từ điển giấy.

Thêm hoặc sửa một mục:

```python
diem["Anh"] = 8      # thêm mới
diem["Văn"] = 8      # sửa lại
```

Đi qua từng mục bằng `for`:

```python
for mon in diem:
    print(mon, diem[mon])
```

Biến `mon` lần lượt nhận từng **khoá**, còn `diem[mon]` là giá trị của khoá đó.

Chú ý: khoá phải viết đúng y hệt, `"Toán"` khác `"toán"`.

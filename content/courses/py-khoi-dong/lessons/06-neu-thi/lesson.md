# Nếu… thì…

Chương trình của em tới giờ chạy một mạch từ trên xuống. Bây giờ mình dạy nó **chọn**.

```python
diem = 8

if diem >= 5:
    print("Đạt")
else:
    print("Chưa đạt")
```

Đọc như tiếng Việt: *nếu* `diem` lớn hơn hoặc bằng 5 *thì* in "Đạt", *không thì* in "Chưa đạt".

Ba điều phải nhớ:

1. Cuối dòng `if` và `else` luôn có dấu hai chấm `:`.
2. Dòng bên trong phải **thụt vào** 4 dấu cách. Thụt vào cho máy biết dòng nào thuộc về `if`.
3. So sánh bằng nhau viết **hai** dấu bằng `==`, vì một dấu `=` là để cất giá trị vào hộp.

Các phép so sánh: `>` lớn hơn, `<` nhỏ hơn, `>=` lớn hơn hoặc bằng, `<=`, `==` bằng, `!=` khác.

Có hơn hai trường hợp thì thêm `elif` vào giữa `if` và `else`. Đọc là *nếu không phải vậy, nhưng nếu…*:

```python
if diem >= 8:
    print("Giỏi")
elif diem >= 5:
    print("Đạt")
else:
    print("Chưa đạt")
```

Em thử cho máy ra quyết định nhé!

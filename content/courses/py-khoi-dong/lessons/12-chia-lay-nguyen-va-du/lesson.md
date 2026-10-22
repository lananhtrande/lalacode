# Chia lấy nguyên, chia lấy dư

Phép chia thường cho số lẻ: `7 / 2` ra `3.5`. Nhưng nhiều khi em cần số nguyên.

```python
print(7 // 2)    # 3  — chia lấy phần nguyên
print(7 % 2)     # 1  — chia lấy phần dư
```

Nghĩ thế này: chia 7 cái kẹo cho 2 bạn thì mỗi bạn được **3** cái, thừa **1** cái.

Hai phép này giải được nhiều bài hay:

- Số chẵn hay lẻ: `so % 2 == 0` là chẵn.
- Đổi giây sang phút: `giay // 60` ra phút, `giay % 60` ra số giây lẻ.

Còn muốn làm tròn số lẻ thì dùng `round`:

```python
print(round(8.6))      # 9
print(round(8.25, 1))  # 8.2 — giữ một chữ số sau dấu phẩy
```

Em thử mấy bài tính toán nhé.

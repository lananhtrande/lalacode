# Chơi với chữ

Chữ trong Python gọi là **chuỗi**. Em làm được nhiều thứ với chuỗi:

```python
ten = "lan anh"

print(len(ten))        # 7 — đếm cả dấu cách
print(ten.upper())     # LAN ANH
print(ten.lower())     # lan anh
```

`len` đếm số ký tự. `.upper()` cho chữ in hoa, `.lower()` cho chữ thường. Dấu chấm đọc là *của*: `ten.upper()` là "bản in hoa **của** ten".

Hai chuỗi cộng lại thì dính liền nhau:

```python
print("Xin" + " " + "chào")   # Xin chào
```

Lấy một ký tự bằng số thứ tự, vẫn đếm từ 0:

```python
print(ten[0])    # l
```

Chú ý: các lệnh này **không** đổi chuỗi gốc, chúng tạo ra chuỗi mới. Sau `ten.upper()` thì `ten` vẫn là `lan anh`.

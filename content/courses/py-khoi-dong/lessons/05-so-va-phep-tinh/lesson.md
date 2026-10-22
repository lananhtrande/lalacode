# Số và phép tính

Python tính toán rất nhanh. Em viết phép tính, nó trả ra kết quả:

```python
print(7 + 3)
print(7 - 3)
print(7 * 3)
print(7 / 2)
```

Dấu `*` là nhân, dấu `/` là chia. Chia xong Python cho số thập phân: `7 / 2` ra `3.5`.

Có một chỗ hay nhầm: thứ `input()` nhận về **luôn là chữ**, dù người ta gõ số. Muốn tính thì phải đổi sang số bằng `int()`:

```python
tuoi = int(input())
print(tuoi + 1)
```

Thiếu `int()` là Python kêu ngay, vì nó không biết cộng chữ với số.

Ngược lại, muốn ghép số vào câu chữ thì f-string lo hết, em không cần đổi gì:

```python
print(f"Sang năm em {tuoi + 1} tuổi")
```

Em thử tính vài bài nhé!

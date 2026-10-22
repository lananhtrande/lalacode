# Trò đoán chữ

Em kiểm tra được một chữ cái có nằm trong từ hay không bằng từ khoá `in`:

```python
tu = "con mèo"

print("m" in tu)     # True
print("z" in tu)     # False
```

`True` nghĩa là đúng, `False` là sai. Hai giá trị này dùng thẳng trong `if`:

```python
if "m" in tu:
    print("Có chữ m")
```

`in` cũng chạy với danh sách: `if "Lan" in ban:`.

Đi qua từng chữ cái của một từ bằng `for`:

```python
for chu in "mèo":
    print(chu)
```

In ra `m`, `è`, `o` — mỗi chữ một dòng.

Ghép hai thứ đó lại là em làm được trò đoán chữ rồi đấy.

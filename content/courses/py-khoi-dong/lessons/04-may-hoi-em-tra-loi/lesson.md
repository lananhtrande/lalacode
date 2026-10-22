# Máy hỏi, em trả lời

Tới giờ chương trình của em luôn chạy giống hệt nhau. Bây giờ mình cho nó **hỏi người dùng** một câu.

```python
ten = input()
print(ten)
```

`input()` dừng lại chờ người ta gõ gì đó rồi nhấn Enter. Chữ gõ vào được cất ngay vào biến `ten`.

Muốn ghép chữ với biến, em dùng **f-string**: thêm chữ `f` trước dấu nháy, rồi đặt tên biến trong dấu ngoặc nhọn.

```python
ten = input()
print(f"Xin chào {ten}!")
```

Nếu người dùng gõ `Lan`, màn hình hiện `Xin chào Lan!`.

Nhớ hai điều: chữ `f` nằm sát trước dấu nháy. Tên biến nằm trong `{ }`, không phải trong dấu nháy riêng.

Trong bài tập, phần "người dùng gõ" đã được chuẩn bị sẵn, em không phải gõ tay.

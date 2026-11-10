# Tự làm lệnh riêng

`print`, `len`, `input` là những lệnh Python cho sẵn. Em cũng tự đặt được lệnh riêng, gọi là **hàm**.

```python
def chao():
    print("Xin chào!")

chao()
```

`def` là *định nghĩa*. Viết xong hàm, muốn chạy thì **gọi tên nó** kèm cặp ngoặc.

Hàm nhận thêm thông tin, gọi là **tham số**:

```python
def chao(ten):
    print(f"Xin chào {ten}!")

chao("Lan")
chao("Minh")
```

Một hàm viết xong dùng được bao nhiêu lần tuỳ thích.

Hàm cũng **trả về** kết quả bằng `return`:

```python
def cong(a, b):
    return a + b

print(cong(3, 4))
```

Khác nhau chỗ này: `print` chỉ hiện ra màn hình. `return` **đưa giá trị về** cho chỗ gọi, để em cất vào biến hay tính tiếp.

Em đã đi được nửa khoá rồi đấy. Từ bài sau, mình sẽ dùng hàm cho nhiều trò vui hơn. Cố lên nhé!

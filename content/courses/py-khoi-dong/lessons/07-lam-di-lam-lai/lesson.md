# Làm đi làm lại

Ở bài rùa, muốn vẽ hình vuông em phải viết bốn lần hai dòng giống nhau. Mệt tay quá! Python có cách bảo máy *làm lại nhiều lần*:

```python
for i in range(3):
    print("Xin chào")
```

Câu này in `Xin chào` ba lần. Đọc là: *với mỗi lần `i` chạy trong dãy 3 số, hãy in…*

`range(3)` cho ba số: 0, 1, 2 — Python đếm từ 0. Biến `i` giữ số của lượt đang chạy:

```python
for i in range(3):
    print(i)
```

In ra 0, rồi 1, rồi 2.

Muốn đếm từ 1 tới 5 thì viết `range(1, 6)`: bắt đầu từ 1, dừng **trước** 6.

Giống `if`, dòng `for` kết thúc bằng dấu hai chấm và phần việc lặp lại phải thụt vào.

Giờ hình vuông chỉ còn ba dòng thôi!

Một điều hay nữa: vòng lặp đặt được **bên trong** vòng lặp khác, để lặp lại cả một hình nhiều lần. Bài cuối em sẽ thử.

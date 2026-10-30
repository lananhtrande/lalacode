# Lặp đến khi nào

`for` lặp **đúng số lần đã biết**. Nhưng có lúc em chưa biết phải lặp bao nhiêu lần — chỉ biết *khi nào thì dừng*. Lúc đó dùng `while`:

```python
dem = 1

while dem <= 3:
    print(dem)
    dem = dem + 1
```

Đọc là: *chừng nào `dem` còn nhỏ hơn hoặc bằng 3 thì còn lặp*. Mỗi lượt in số rồi cộng thêm 1.

Dòng `dem = dem + 1` **cực kỳ quan trọng**. Thiếu nó, `dem` mãi mãi bằng 1, điều kiện mãi mãi đúng, và chương trình chạy không bao giờ dừng. Người ta gọi đó là *vòng lặp vô hạn*.

Nếu lỡ viết vòng lặp vô hạn, đừng lo: lalakode tự dừng sau vài giây và báo cho em.

Mẹo nhỏ: `dem += 1` là cách viết ngắn của `dem = dem + 1`.

Em thử nhé — nhớ luôn tự hỏi *"cái gì làm vòng lặp này dừng lại?"*

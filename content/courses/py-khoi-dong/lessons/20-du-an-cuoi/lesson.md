# Dự án cuối: trò chơi của em

Bài cuối rồi! Em đã có đủ đồ nghề:

- `input` để hỏi, `print` để trả lời
- `if` để quyết định, `while` để lặp
- danh sách và từ điển để cất nhiều thứ
- hàm để gom việc lại một chỗ
- `random` để mỗi lần chơi một khác

Giờ mình ghép tất cả thành một trò chơi nhỏ. Ví dụ trò đoán số có đếm lượt:

```python
import random

bi_mat = random.randint(1, 20)
so_lan = 0
doan = int(input())

while doan != bi_mat:
    so_lan = so_lan + 1
    if doan < bi_mat:
        print("Lớn hơn nhé")
    else:
        print("Nhỏ hơn nhé")
    doan = int(input())

print(f"Đúng rồi! Em đoán {so_lan + 1} lần.")
```

Mỗi bài tập dưới đây là một mảnh của trò chơi. Làm xong cả bốn là em có một trò chơi hoàn chỉnh — và đó là chương trình thật sự đầu tiên của em.

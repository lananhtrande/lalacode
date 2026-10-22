# May rủi

Muốn chương trình bất ngờ như tung xúc xắc? Python có sẵn:

```python
import random

so = random.randint(1, 6)
print(so)
```

`random.randint(1, 6)` cho một số nguyên ngẫu nhiên từ 1 đến 6, **tính cả 1 và 6**. Chạy lại là ra số khác.

Chọn đại một phần tử trong danh sách:

```python
mon = ["Toán", "Văn", "Anh"]
print(random.choice(mon))
```

Nhớ `import random` ở đầu chương trình, giống như gọi chú rùa ra vậy.

Một lưu ý khi làm bài: kết quả mỗi lần chạy một khác, nên bài tập sẽ kiểm tra *số có nằm trong khoảng đúng không*, chứ không kiểm tra một con số cụ thể.

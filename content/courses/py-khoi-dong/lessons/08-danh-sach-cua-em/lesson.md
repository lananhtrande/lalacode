# Danh sách của em

Một cái hộp chỉ đựng một thứ. Muốn cất cả điểm của bốn môn thì sao? Dùng **danh sách**:

```python
diem = [8, 9, 7, 10]
print(diem)
```

Danh sách nằm trong dấu ngoặc vuông, các phần tử cách nhau bằng dấu phẩy.

Lấy ra một phần tử bằng số thứ tự, **đếm từ 0**:

```python
print(diem[0])   # 8, phần tử đầu tiên
print(diem[2])   # 7
```

Vài lệnh hay dùng:

- `len(diem)` cho biết có bao nhiêu phần tử.
- `diem.append(6)` thêm số 6 vào cuối danh sách.
- `sum(diem)` cộng hết các số lại.

Vòng lặp `for` đi qua từng phần tử rất gọn:

```python
for d in diem:
    print(d)
```

Lần này `d` không phải số thứ tự mà là **chính giá trị** trong danh sách.

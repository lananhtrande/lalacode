# Rùa vẽ tranh

Biết vẽ hình rồi, giờ mình ghép nhiều hình thành một bức tranh.

Rùa đứng ở đâu trên màn hình là do **toạ độ**: `turtle.goto(x, y)`. Điểm `(0, 0)` ở giữa màn hình, x tăng sang phải, y tăng lên trên.

```python
turtle.penup()
turtle.goto(-100, 50)
turtle.pendown()
```

Chấm một chấm tròn tại chỗ đang đứng:

```python
turtle.dot(20, "red")
```

Số 20 là độ to của chấm.

Vẽ đường tròn:

```python
turtle.circle(40)
```

Ghép lại: hai chấm làm mắt, một đường tròn làm mặt, vài nét thẳng làm tay chân — em có cả một nhân vật.

Mẹo: vẽ xong một phần thì nhấc bút, dời sang chỗ mới, rồi đặt bút xuống vẽ tiếp.

# Rùa và hàm

Viết hàm xong, em ra lệnh cho rùa gọn hơn hẳn:

```python
import turtle

def ve_vuong(canh):
    for i in range(4):
        turtle.forward(canh)
        turtle.left(90)

ve_vuong(50)
ve_vuong(80)
```

Một hàm, gọi bao nhiêu lần tuỳ thích, mỗi lần một kích thước.

Muốn **tô màu** bên trong hình:

```python
turtle.fillcolor("orange")
turtle.begin_fill()
ve_vuong(60)
turtle.end_fill()
```

`begin_fill()` nói "bắt đầu tô từ đây", `end_fill()` nói "tô xong rồi". Hình phải khép kín thì mới tô đẹp.

Muốn dời rùa mà không vẽ đường kẻ:

```python
turtle.penup()
turtle.goto(100, 0)
turtle.pendown()
```

`penup` là nhấc bút lên, `pendown` là đặt bút xuống. Quên `pendown` thì rùa đi mà không để lại nét nào.

# Rùa vẽ hình

Python có một chú rùa cầm bút. Em ra lệnh, rùa bò tới đâu thì vẽ tới đó.

```python
import turtle

turtle.forward(100)
turtle.left(90)
turtle.forward(100)
```

- `import turtle` gọi chú rùa ra.
- `turtle.forward(100)` đi thẳng 100 bước.
- `turtle.left(90)` quay trái 90 độ, `turtle.right(90)` quay phải.

Rùa luôn bắt đầu ở giữa màn hình, đầu quay sang **phải**.

Góc 90 độ là góc vuông, giống góc tờ giấy. Quay trái bốn lần 90 độ là rùa quay đủ một vòng về chỗ cũ.

Muốn đổi màu bút thì dùng `turtle.pencolor("red")`. Vài màu dùng được: `red`, `blue`, `green`, `orange`.

Nhớ nhé: đi rồi mới quay, hay quay rồi mới đi, hình vẽ ra sẽ khác nhau.

Em vẽ thử mấy hình dưới đây nhé!

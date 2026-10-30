"""Rùa vẽ hình cho lalakode — bản tự viết, không cần tkinter.

Pyodide không có `turtle` thật (nó cần tkinter), còn CPython khi chạy
`content:verify` thì không có màn hình. Nên module này ghi lại **lệnh vẽ** thay
vì vẽ trực tiếp; phần vẽ lên canvas do `turtle-canvas.ts` làm.

Toạ độ giống turtle thật: gốc ở giữa, trục y hướng lên, góc 0 độ là hướng đông
và tăng ngược chiều kim đồng hồ.

Chỉ có những lệnh dùng trong bài học. Thiếu lệnh nào thì thêm vào đây, đừng để
bài học tự chế.
"""

from __future__ import annotations

import json
import math
from typing import Any

_commands: list[dict[str, Any]] = []


def _record(command: dict[str, Any]) -> None:
    # Chặn code lặp vô hạn làm phình bộ nhớ; 20k nét là quá đủ cho bài học.
    if len(_commands) < 20_000:
        _commands.append(command)


def drain_commands() -> str:
    """Lấy hết lệnh vẽ dưới dạng JSON rồi xoá (worker gọi sau mỗi lần chạy)."""
    global _commands
    data = json.dumps(_commands, ensure_ascii=False)
    _commands = []
    return data


class Turtle:
    """Một con rùa. Lệnh ở cấp module dùng chung một con rùa mặc định."""

    def __init__(self) -> None:
        self._x = 0.0
        self._y = 0.0
        self._heading = 0.0
        self._pen_down = True
        self._color = "black"
        self._width = 2.0
        self._visible = True
        self._fill_color = "black"
        self._filling = False
        self._fill_points: list[list[float]] = []
        self._mark()

    # --- di chuyển ---------------------------------------------------------

    def forward(self, distance: float) -> None:
        radians = math.radians(self._heading)
        self._move_to(
            self._x + distance * math.cos(radians),
            self._y + distance * math.sin(radians),
        )

    def backward(self, distance: float) -> None:
        self.forward(-distance)

    def right(self, angle: float) -> None:
        self._heading = (self._heading - angle) % 360
        self._mark()

    def left(self, angle: float) -> None:
        self._heading = (self._heading + angle) % 360
        self._mark()

    def goto(self, x: float, y: float = 0.0) -> None:
        self._move_to(float(x), float(y))

    def setx(self, x: float) -> None:
        self._move_to(float(x), self._y)

    def sety(self, y: float) -> None:
        self._move_to(self._x, float(y))

    def setheading(self, angle: float) -> None:
        self._heading = float(angle) % 360
        self._mark()

    def home(self) -> None:
        self._move_to(0.0, 0.0)
        self.setheading(0)

    def circle(self, radius: float, extent: float = 360.0, steps: int | None = None) -> None:
        """Vẽ cung tròn bằng nhiều đoạn thẳng nhỏ, như turtle thật."""
        if steps is None:
            steps = max(6, min(120, int(abs(extent) / 6) + 6))
        step_angle = extent / steps
        step_length = 2 * radius * math.sin(math.radians(abs(step_angle) / 2))
        if radius < 0:
            step_angle = -step_angle
        self.left(step_angle / 2)
        for _ in range(steps):
            self.forward(step_length if extent >= 0 else -step_length)
            self.left(step_angle)
        self.right(step_angle / 2)

    def dot(self, size: float | None = None, color: str | None = None) -> None:
        _record(
            {
                "op": "dot",
                "x": self._x,
                "y": self._y,
                "size": float(size) if size else max(4.0, self._width * 2),
                "color": color or self._color,
            }
        )

    # --- bút ---------------------------------------------------------------

    def penup(self) -> None:
        self._pen_down = False

    def pendown(self) -> None:
        self._pen_down = True

    def pensize(self, width: float | None = None) -> float:
        if width is None:
            return self._width
        self._width = float(width)
        return self._width

    def pencolor(self, color: str | None = None) -> str:
        if color is None:
            return self._color
        self._color = str(color)
        return self._color

    def color(self, color: str | None = None, fill: str | None = None) -> str:
        if color is None:
            return self._color
        self._color = str(color)
        self._fill_color = str(fill) if fill else str(color)
        return self._color

    def fillcolor(self, color: str | None = None) -> str:
        if color is None:
            return self._fill_color
        self._fill_color = str(color)
        return self._fill_color

    def begin_fill(self) -> None:
        self._filling = True
        self._fill_points = [[self._x, self._y]]

    def end_fill(self) -> None:
        if self._filling and len(self._fill_points) > 2:
            _record({"op": "fill", "points": self._fill_points, "color": self._fill_color})
        self._filling = False
        self._fill_points = []

    # --- hiển thị ----------------------------------------------------------

    def hideturtle(self) -> None:
        self._visible = False
        self._mark()

    def showturtle(self) -> None:
        self._visible = True
        self._mark()

    def speed(self, value: Any = None) -> int:
        """Giữ cho tương thích; tốc độ vẽ do trình duyệt quyết định."""
        return 0

    def clear(self) -> None:
        _record({"op": "clear"})

    def reset(self) -> None:
        self.clear()
        self.__init__()  # noqa: PLC2801 - cố ý đặt lại trạng thái

    def done(self) -> None:
        """Không cần làm gì: hình đã vẽ xong rồi."""

    # --- đọc trạng thái ----------------------------------------------------

    def position(self) -> tuple[float, float]:
        return (self._x, self._y)

    def xcor(self) -> float:
        return self._x

    def ycor(self) -> float:
        return self._y

    def heading(self) -> float:
        return self._heading

    def isdown(self) -> bool:
        return self._pen_down

    # --- bên trong ---------------------------------------------------------

    def _move_to(self, x: float, y: float) -> None:
        if self._pen_down:
            _record(
                {
                    "op": "line",
                    "x1": self._x,
                    "y1": self._y,
                    "x2": x,
                    "y2": y,
                    "color": self._color,
                    "width": self._width,
                }
            )
        self._x, self._y = x, y
        if self._filling:
            self._fill_points.append([x, y])
        self._mark()

    def _mark(self) -> None:
        """Ghi vị trí hiện tại của rùa để vẽ hình mũi tên lúc cuối."""
        _record(
            {
                "op": "turtle",
                "x": self._x,
                "y": self._y,
                "heading": self._heading,
                "visible": self._visible,
            }
        )


# Tên gọi tắt quen thuộc của turtle
Turtle.fd = Turtle.forward
Turtle.bk = Turtle.backward
Turtle.back = Turtle.backward
Turtle.rt = Turtle.right
Turtle.lt = Turtle.left
Turtle.setpos = Turtle.goto
Turtle.setposition = Turtle.goto
Turtle.seth = Turtle.setheading
Turtle.pu = Turtle.penup
Turtle.up = Turtle.penup
Turtle.pd = Turtle.pendown
Turtle.down = Turtle.pendown
Turtle.width = Turtle.pensize
Turtle.pos = Turtle.position
Turtle.ht = Turtle.hideturtle
Turtle.st = Turtle.showturtle

Pen = Turtle

_default: Turtle | None = None


def _turtle() -> Turtle:
    global _default
    if _default is None:
        _default = Turtle()
    return _default


def _export(name: str):
    def wrapper(*args: Any, **kwargs: Any):
        return getattr(_turtle(), name)(*args, **kwargs)

    wrapper.__name__ = name
    return wrapper


# Lệnh ở cấp module: `import turtle` rồi `turtle.forward(100)`.
for _name in (
    "forward fd backward bk back right rt left lt goto setpos setposition setx sety "
    "setheading seth home circle dot penup pu up pendown pd down pensize width pencolor "
    "color fillcolor begin_fill end_fill hideturtle ht showturtle st speed clear reset done "
    "position pos xcor ycor heading isdown"
).split():
    globals()[_name] = _export(_name)


def _reset_for_grading() -> None:
    """Xoá sạch lệnh vẽ và cho rùa về giữa màn hình.

    Bộ chấm gọi hàm này trước mỗi test: cùng một module rùa chạy nhiều test
    liên tiếp, không đặt lại thì test sau thấy trạng thái của test trước.
    """
    global _commands, _default
    _commands = []
    _default = None


def exitonclick() -> None:
    """Không cần làm gì trên web; để bài học chép từ sách vẫn chạy được."""


bye = exitonclick
mainloop = exitonclick

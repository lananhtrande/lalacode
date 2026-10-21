import type { DrawCommand } from './protocol';

/**
 * Vẽ lệnh của rùa lên canvas. Hàm thuần theo nghĩa: chỉ đọc danh sách lệnh và
 * gọi context — không biết gì về React, nên unit test được bằng context giả.
 *
 * Toạ độ turtle: gốc ở giữa, y hướng **lên**. Canvas: gốc ở góc trên trái, y
 * hướng **xuống**. Nên phải lật trục y.
 */

export interface CanvasSize {
  width: number;
  height: number;
}

/** Phần nhỏ của CanvasRenderingContext2D mà hàm này dùng tới. */
export type DrawingContext = Pick<
  CanvasRenderingContext2D,
  | 'beginPath'
  | 'moveTo'
  | 'lineTo'
  | 'stroke'
  | 'fill'
  | 'closePath'
  | 'arc'
  | 'clearRect'
  | 'save'
  | 'restore'
> & {
  strokeStyle: string | CanvasGradient | CanvasPattern;
  fillStyle: string | CanvasGradient | CanvasPattern;
  lineWidth: number;
  lineCap: CanvasLineCap;
  lineJoin: CanvasLineJoin;
};

/** Mũi tên hình rùa ở vị trí cuối, cho trẻ biết rùa đang đứng đâu, quay hướng nào. */
const TURTLE_SIZE = 10;

export function drawTurtleCommands(
  context: DrawingContext,
  commands: readonly DrawCommand[],
  size: CanvasSize,
): void {
  const toX = (x: number) => size.width / 2 + x;
  const toY = (y: number) => size.height / 2 - y;

  context.clearRect(0, 0, size.width, size.height);
  context.lineCap = 'round';
  context.lineJoin = 'round';

  // Chỉ vẽ hình rùa của lệnh `turtle` cuối cùng, không vẽ hết mọi bước.
  let lastTurtle: Extract<DrawCommand, { op: 'turtle' }> | undefined;

  for (const command of commands) {
    switch (command.op) {
      case 'clear':
        context.clearRect(0, 0, size.width, size.height);
        break;

      case 'line':
        context.strokeStyle = command.color;
        context.lineWidth = command.width;
        context.beginPath();
        context.moveTo(toX(command.x1), toY(command.y1));
        context.lineTo(toX(command.x2), toY(command.y2));
        context.stroke();
        break;

      case 'dot':
        context.fillStyle = command.color;
        context.beginPath();
        context.arc(toX(command.x), toY(command.y), command.size / 2, 0, Math.PI * 2);
        context.fill();
        break;

      case 'fill': {
        const [first, ...rest] = command.points;
        if (!first) break;
        context.fillStyle = command.color;
        context.beginPath();
        context.moveTo(toX(first[0]), toY(first[1]));
        for (const [x, y] of rest) context.lineTo(toX(x), toY(y));
        context.closePath();
        context.fill();
        break;
      }

      case 'turtle':
        lastTurtle = command;
        break;
    }
  }

  if (lastTurtle?.visible) drawTurtleMarker(context, lastTurtle, toX, toY);
}

function drawTurtleMarker(
  context: DrawingContext,
  turtle: Extract<DrawCommand, { op: 'turtle' }>,
  toX: (x: number) => number,
  toY: (y: number) => number,
): void {
  const radians = (turtle.heading * Math.PI) / 180;
  const point = (distance: number, angleOffset: number): [number, number] => [
    toX(turtle.x + distance * Math.cos(radians + angleOffset)),
    toY(turtle.y + distance * Math.sin(radians + angleOffset)),
  ];

  context.fillStyle = '#1f8a4c';
  context.beginPath();
  const [tipX, tipY] = point(TURTLE_SIZE, 0);
  const [leftX, leftY] = point(TURTLE_SIZE * 0.8, (140 * Math.PI) / 180);
  const [rightX, rightY] = point(TURTLE_SIZE * 0.8, (-140 * Math.PI) / 180);
  context.moveTo(tipX, tipY);
  context.lineTo(leftX, leftY);
  context.lineTo(rightX, rightY);
  context.closePath();
  context.fill();
}

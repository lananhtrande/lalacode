import { describe, expect, it, vi as vitest } from 'vitest';
import { drawTurtleCommands, type DrawingContext } from './turtle-canvas';
import type { DrawCommand } from './protocol';

/** Context giả: ghi lại mọi lệnh gọi để kiểm tra toạ độ đã đổi đúng chưa. */
function fakeContext() {
  const calls: string[] = [];
  const record =
    (name: string) =>
    (...args: unknown[]) => {
      calls.push(
        `${name}(${args.map((a) => (typeof a === 'number' ? Math.round(a) : a)).join(',')})`,
      );
    };
  const context = {
    beginPath: vitest.fn(record('beginPath')),
    moveTo: vitest.fn(record('moveTo')),
    lineTo: vitest.fn(record('lineTo')),
    stroke: vitest.fn(record('stroke')),
    fill: vitest.fn(record('fill')),
    closePath: vitest.fn(record('closePath')),
    arc: vitest.fn(record('arc')),
    clearRect: vitest.fn(record('clearRect')),
    save: vitest.fn(record('save')),
    restore: vitest.fn(record('restore')),
    strokeStyle: '',
    fillStyle: '',
    lineWidth: 0,
    lineCap: 'butt' as CanvasLineCap,
    lineJoin: 'miter' as CanvasLineJoin,
  };
  return { context: context as unknown as DrawingContext, calls, raw: context };
}

const size = { width: 200, height: 100 };

describe('drawTurtleCommands', () => {
  it('đổi toạ độ turtle (gốc giữa, y hướng lên) sang toạ độ canvas', () => {
    const { context, calls } = fakeContext();
    const commands: DrawCommand[] = [
      { op: 'line', x1: 0, y1: 0, x2: 50, y2: 20, color: 'red', width: 3 },
    ];
    drawTurtleCommands(context, commands, size);
    // Gốc (0,0) → giữa canvas (100,50); y = 20 đi lên → 50 - 20 = 30.
    expect(calls).toContain('moveTo(100,50)');
    expect(calls).toContain('lineTo(150,30)');
  });

  it('dùng đúng màu và độ dày của từng nét', () => {
    const { context, raw } = fakeContext();
    drawTurtleCommands(
      context,
      [{ op: 'line', x1: 0, y1: 0, x2: 1, y2: 0, color: 'blue', width: 5 }],
      size,
    );
    expect(raw.strokeStyle).toBe('blue');
    expect(raw.lineWidth).toBe(5);
  });

  it('xoá canvas trước khi vẽ và khi gặp lệnh clear', () => {
    const { context, raw } = fakeContext();
    drawTurtleCommands(context, [{ op: 'clear' }], size);
    expect(raw.clearRect).toHaveBeenCalledTimes(2);
  });

  it('vẽ chấm bằng hình tròn, bán kính bằng nửa kích thước', () => {
    const { context, calls } = fakeContext();
    drawTurtleCommands(context, [{ op: 'dot', x: 0, y: 0, size: 10, color: 'green' }], size);
    expect(calls.some((call) => call.startsWith('arc(100,50,5'))).toBe(true);
  });

  it('tô màu theo danh sách điểm và đóng đường bao', () => {
    const { context, calls, raw } = fakeContext();
    drawTurtleCommands(
      context,
      [
        {
          op: 'fill',
          points: [
            [0, 0],
            [40, 0],
            [40, 40],
          ],
          color: 'yellow',
        },
      ],
      size,
    );
    expect(raw.fillStyle).toBe('yellow');
    expect(calls).toContain('closePath()');
    expect(calls.filter((call) => call.startsWith('lineTo')).length).toBe(2);
  });

  it('chỉ vẽ hình rùa ở vị trí cuối cùng, không vẽ mọi bước', () => {
    const { context, raw } = fakeContext();
    const commands: DrawCommand[] = [
      { op: 'turtle', x: 0, y: 0, heading: 0, visible: true },
      { op: 'turtle', x: 10, y: 0, heading: 90, visible: true },
      { op: 'turtle', x: 20, y: 0, heading: 180, visible: true },
    ];
    drawTurtleCommands(context, commands, size);
    // Một hình rùa = một beginPath + một fill.
    expect(raw.fill).toHaveBeenCalledTimes(1);
  });

  it('rùa ẩn thì không vẽ hình rùa', () => {
    const { context, raw } = fakeContext();
    drawTurtleCommands(context, [{ op: 'turtle', x: 0, y: 0, heading: 0, visible: false }], size);
    expect(raw.fill).not.toHaveBeenCalled();
  });

  it('danh sách rỗng thì chỉ xoá canvas, không vẽ gì', () => {
    const { context, raw } = fakeContext();
    drawTurtleCommands(context, [], size);
    expect(raw.clearRect).toHaveBeenCalledTimes(1);
    expect(raw.stroke).not.toHaveBeenCalled();
  });
});

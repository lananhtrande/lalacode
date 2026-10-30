import { useEffect, useRef, useState } from 'react';
import { drawTurtleCommands } from '../../runner/turtle-canvas';
import type { DrawCommand } from '../../runner/protocol';
import { vi } from '../../shared/i18n/vi';

/** Toạ độ rùa tính trên khung 320×320 (bài học viết theo cỡ này); hiển thị thì phóng theo cột. */
const WORLD = { width: 320, height: 320 };
const MAX_SIZE = 560;

export function TurtleCanvas({ commands }: { commands: readonly DrawCommand[] }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState(WORLD.width);

  // Canvas vuông, rộng theo cột kết quả (có thể lớn hơn 320px ở màn rộng).
  useEffect(() => {
    const box = boxRef.current;
    if (!box || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(([entry]) => {
      const width = entry?.contentRect.width ?? WORLD.width;
      setSize(Math.max(200, Math.min(MAX_SIZE, Math.floor(width))));
    });
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    // Vẽ theo điểm ảnh thật của màn hình (Retina…) để nét không bị nhoè.
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.round(size * ratio);
    canvas.height = Math.round(size * ratio);
    const scale = (size * ratio) / WORLD.width;
    context.setTransform(scale, 0, 0, scale, 0, 0);
    drawTurtleCommands(context, commands, WORLD);
  }, [commands, size]);

  return (
    <section aria-labelledby="hinh-rua" className="rounded-card bg-surface p-4 shadow-card">
      <h2 id="hinh-rua" className="text-card-title">
        {vi.exercise.drawingTitle}
      </h2>
      <div ref={boxRef} className="mt-2 w-full">
        <canvas
          ref={canvasRef}
          data-testid="turtle-canvas"
          aria-label={vi.exercise.drawingTitle}
          style={{ width: size, height: size }}
          className="max-w-full rounded-xl border border-line bg-white"
        />
      </div>
    </section>
  );
}

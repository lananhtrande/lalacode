import { useEffect, useRef } from 'react';
import { drawTurtleCommands } from '../../runner/turtle-canvas';
import type { DrawCommand } from '../../runner/protocol';
import { vi } from '../../shared/i18n/vi';

const SIZE = { width: 320, height: 320 };

export function TurtleCanvas({ commands }: { commands: readonly DrawCommand[] }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const context = canvasRef.current?.getContext('2d');
    if (context) drawTurtleCommands(context, commands, SIZE);
  }, [commands]);

  return (
    <section aria-labelledby="hinh-rua">
      <h2 id="hinh-rua" className="text-lg font-bold">
        {vi.exercise.drawingTitle}
      </h2>
      <canvas
        ref={canvasRef}
        data-testid="turtle-canvas"
        width={SIZE.width}
        height={SIZE.height}
        aria-label={vi.exercise.drawingTitle}
        // Canvas cố định 320px nhưng co lại vừa màn hình điện thoại.
        className="mt-2 h-auto w-full max-w-80 rounded-xl border border-line bg-white"
      />
    </section>
  );
}

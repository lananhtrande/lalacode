import { Play, RotateCcw, Send, Square } from 'lucide-react';
import { Button } from '../../shared/ui/Button';
import { vi } from '../../shared/i18n/vi';

export interface ExerciseToolbarProps {
  phase: 'idle' | 'running' | 'grading';
  onRun: () => void;
  onSubmit: () => void;
  onStop: () => void;
  onReset: () => void;
}

/**
 * Thanh nút dưới editor. Màn rộng: nằm ngay dưới editor, luôn thấy vì cột tự
 * cuộn. Màn hẹp: dính ở đáy màn hình để trẻ không phải cuộn ngược lên.
 */
export function ExerciseToolbar({ phase, onRun, onSubmit, onStop, onReset }: ExerciseToolbarProps) {
  const busy = phase !== 'idle';
  return (
    <div
      data-testid="exercise-toolbar"
      className="fixed inset-x-0 bottom-0 z-10 flex flex-wrap items-center gap-2 border-t border-line bg-surface/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur lg:static lg:z-auto lg:border-0 lg:bg-transparent lg:p-0 lg:pt-3 lg:backdrop-blur-none"
    >
      <Button
        variant="dark"
        onClick={onRun}
        disabled={busy}
        icon={<Play aria-hidden="true" className="size-4" />}
      >
        {phase === 'running' ? vi.exercise.running : vi.exercise.run}
      </Button>
      <Button
        onClick={onSubmit}
        disabled={busy}
        icon={<Send aria-hidden="true" className="size-4" />}
      >
        {phase === 'grading' ? vi.exercise.grading : vi.exercise.submit}
      </Button>
      {busy && (
        <Button variant="outline" onClick={onStop} icon={<Square aria-hidden="true" className="size-4" />}>
          {vi.exercise.stop}
        </Button>
      )}
      <Button
        variant="ghost"
        onClick={onReset}
        disabled={busy}
        icon={<RotateCcw aria-hidden="true" className="size-4" />}
        // Điện thoại: chỉ hiện icon để thanh nút nằm gọn một hàng; tên vẫn đọc được.
        className="max-sm:px-3"
      >
        <span className="max-sm:sr-only">{vi.exercise.reset}</span>
      </Button>
    </div>
  );
}

import { Play, Send, Square } from 'lucide-react';
import { Button } from '../../shared/ui/Button';
import { vi } from '../../shared/i18n/vi';

export interface ExerciseToolbarProps {
  phase: 'idle' | 'running' | 'grading';
  /**
   * `page`: dưới editor (màn rộng) hoặc dính đáy màn hình (màn hẹp).
   * `topbar`: bản gọn lặp lại trên topbar khi thanh dưới editor bị cuộn khuất.
   */
  placement?: 'page' | 'topbar';
  onRun: () => void;
  onSubmit: () => void;
  onStop: () => void;
}

/**
 * Thanh "Chạy thử" (`dark`, chỉ chạy code và hiện output) và "Nộp bài"
 * (`primary`, chạy toàn bộ test). "Làm lại từ đầu" nằm ở header của editor.
 */
export function ExerciseToolbar({
  phase,
  placement = 'page',
  onRun,
  onSubmit,
  onStop,
}: ExerciseToolbarProps) {
  const busy = phase !== 'idle';
  const inTopbar = placement === 'topbar';
  return (
    <div
      data-testid={inTopbar ? 'topbar-toolbar' : 'exercise-toolbar'}
      className={
        inTopbar
          ? 'flex items-center gap-2'
          : 'fixed inset-x-0 bottom-0 z-10 flex flex-wrap items-center gap-2 border-t border-line bg-surface/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur lg:static lg:z-auto lg:border-0 lg:bg-transparent lg:p-0 lg:pt-3 lg:backdrop-blur-none'
      }
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
        <Button
          variant="outline"
          onClick={onStop}
          icon={<Square aria-hidden="true" className="size-4" />}
        >
          {vi.exercise.stop}
        </Button>
      )}
    </div>
  );
}

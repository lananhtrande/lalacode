import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { RichText } from '../../shared/ui/RichText';
import { vi } from '../../shared/i18n/vi';

/** Đề bài dài hơn chừng này thì cho thu gọn, để editor và kết quả có chỗ. */
const LONG_PROMPT = 180;

export function ExercisePrompt({ text }: { text: string }) {
  const long = text.length > LONG_PROMPT;
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="mt-2">
      <p
        id="de-bai"
        className={['whitespace-pre-line', long && collapsed ? 'line-clamp-2' : ''].join(' ')}
      >
        <RichText text={text} />
      </p>
      {long && (
        <button
          type="button"
          aria-expanded={!collapsed}
          aria-controls="de-bai"
          onClick={() => setCollapsed((value) => !value)}
          className="mt-1 inline-flex min-h-tap items-center gap-1 text-small font-semibold text-accent-strong underline"
        >
          {collapsed ? (
            <ChevronDown aria-hidden="true" className="size-4" />
          ) : (
            <ChevronUp aria-hidden="true" className="size-4" />
          )}
          {collapsed ? vi.exercise.promptMore : vi.exercise.promptLess}
        </button>
      )}
    </div>
  );
}

import { useState } from 'react';
import { Trash2, TriangleAlert } from 'lucide-react';
import { deleteAllData, quietly } from '../../progress/db';
import { vi } from '../../shared/i18n/vi';

/**
 * Xoá sạch dữ liệu trên máy (docs/privacy.md §Minh bạch).
 *
 * Hỏi lại một lần bằng chính giao diện, **không dùng `confirm()`** của trình
 * duyệt: hộp thoại đó chặn mọi thứ và nhìn rất doạ. Sau khi xoá, màn hình phải
 * tự dọn theo — nếu không trẻ vẫn thấy mã cũ và tưởng chưa xoá được.
 */
export function DeleteDataPanel({ onDeleted }: { onDeleted: () => void }) {
  const [asking, setAsking] = useState(false);
  const [done, setDone] = useState(false);

  async function remove() {
    await quietly(() => deleteAllData());
    setAsking(false);
    setDone(true);
    onDeleted();
  }

  return (
    <div className="rounded-2xl border border-warn-500/40 p-4">
      <h2 className="flex items-center gap-2 text-lg font-bold">
        <Trash2 aria-hidden="true" className="size-5 text-warn-500" />
        {vi.deleteData.title}
      </h2>
      <p className="mt-1 text-ink-muted">{vi.deleteData.lead}</p>
      <p className="mt-1 flex items-start gap-2 font-medium">
        <TriangleAlert aria-hidden="true" className="mt-1 size-4 shrink-0 text-warn-500" />
        <span>
          {vi.deleteData.warning} {vi.deleteData.saveFirst}
        </span>
      </p>

      {!asking && !done && (
        <button
          type="button"
          onClick={() => setAsking(true)}
          data-testid="delete-start"
          className="mt-3 inline-flex min-h-tap items-center rounded-xl border border-warn-500 px-5 font-semibold text-warn-500"
        >
          {vi.deleteData.button}
        </button>
      )}

      {asking && (
        <div className="mt-3" data-testid="delete-confirm">
          <p className="font-medium">{vi.deleteData.confirmQuestion}</p>
          <div className="mt-2 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void remove()}
              data-testid="delete-yes"
              className="inline-flex min-h-tap items-center rounded-xl bg-warn-500 px-5 font-semibold text-white"
            >
              {vi.deleteData.confirmYes}
            </button>
            <button
              type="button"
              onClick={() => setAsking(false)}
              className="inline-flex min-h-tap items-center rounded-xl border border-line px-5 font-semibold"
            >
              {vi.deleteData.confirmNo}
            </button>
          </div>
        </div>
      )}

      {done && (
        <p role="status" data-testid="delete-done" className="mt-3 font-medium text-ok-500">
          {vi.deleteData.done}
        </p>
      )}
    </div>
  );
}

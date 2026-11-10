import { useState } from 'react';

/**
 * State React nhớ trong `localStorage` (lựa chọn giao diện: cỡ chữ editor,
 * chiều cao khung kết quả — không phải dữ liệu học, không rời khỏi máy).
 * `localStorage` bị chặn (Safari riêng tư…) thì vẫn dùng được, chỉ là không nhớ.
 * Giá trị đọc ra không qua được `accept` thì dùng `fallback`.
 */
export function useStoredState<T>(
  key: string,
  fallback: T,
  accept: (value: unknown) => value is T,
): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) {
        const parsed: unknown = JSON.parse(raw);
        if (accept(parsed)) return parsed;
      }
    } catch {
      /* không đọc được: dùng mặc định */
    }
    return fallback;
  });

  const set = (next: T) => {
    setValue(next);
    try {
      window.localStorage.setItem(key, JSON.stringify(next));
    } catch {
      /* không lưu được: chỉ nhớ tới khi tải lại trang */
    }
  };
  return [value, set];
}

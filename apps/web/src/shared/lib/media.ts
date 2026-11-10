import { useSyncExternalStore } from 'react';

/**
 * Màn có khớp media query không, cập nhật khi xoay máy hay đổi cỡ cửa sổ.
 * Môi trường không có `matchMedia` (jsdom) thì coi như không khớp.
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      if (typeof window.matchMedia !== 'function') return () => {};
      const list = window.matchMedia(query);
      list.addEventListener('change', onChange);
      return () => list.removeEventListener('change', onChange);
    },
    () => typeof window.matchMedia === 'function' && window.matchMedia(query).matches,
    () => false,
  );
}

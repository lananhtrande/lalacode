import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useMatches } from 'react-router';
import { KeyRound, Menu, X } from 'lucide-react';
import { IconButton } from '../shared/ui/IconButton';
import { LearnLayout } from '../features/learn/LearnLayout';
import { vi } from '../shared/i18n/vi';

const navItems = [
  { to: '/', label: vi.nav.home, end: true },
  { to: '/khoa-hoc', label: vi.nav.courses, end: false },
  { to: '/luyen-tap', label: vi.nav.practice, end: false },
  { to: '/huy-hieu', label: vi.nav.badges, end: false },
  { to: '/gioi-thieu', label: vi.nav.about, end: false },
];

const secondaryLinks = [
  { to: '/tien-do', label: vi.pages.progressCode },
  { to: '/quyen-rieng-tu', label: vi.footer.privacy },
];

/**
 * Khung trang (docs/design-system.md):
 * - ≥ 1024px: thanh trắng dính trên cùng — logo trái, menu chữ ở giữa (mục đang
 *   chọn: chữ màu nhấn + vạch dưới), "Mã tiến độ" bên phải.
 * - < 1024px: cùng thanh đó, menu thu vào nút mở ngăn kéo thả xuống. Không dùng
 *   thanh nav ở đáy vì đáy màn hình điện thoại để dành cho thanh Chạy/Nộp.
 * Bài học và bài tập vẫn dùng khung học bài riêng (LearnLayout, mục lục bên trái).
 */
export function RootLayout() {
  // Nhớ menu được mở ở trang nào: chuyển sang trang khác là menu tự đóng.
  const [openedAt, setOpenedAt] = useState<string | null>(null);
  const { pathname } = useLocation();
  const menuOpen = openedAt === pathname;
  const matches = useMatches();
  // Route khai báo `handle: { wide: true }` thì không bọc trong thẻ trắng hẹp.
  const wide = matches.some((match) => isWide(match.handle));
  // Bài học và bài tập dùng khung học bài riêng (S0-38): mục lục khoá thay cho menu.
  const learn = matches.some((match) => isLearn(match.handle));
  const setMenuOpen = (open: boolean) => setOpenedAt(open ? pathname : null);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenedAt(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  if (learn) return <LearnLayout />;

  return (
    <div className="flex min-h-dvh flex-col text-ink">
      <a
        href="#noi-dung"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-30 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-surface"
      >
        {vi.nav.skipToContent}
      </a>

      {/* Thanh menu: cao 64px, nội dung tối đa 1280px, đệm ngang 24px (S0-41). */}
      <header className="sticky top-0 z-20 border-b border-line-soft bg-surface">
        <div className="mx-auto flex min-h-16 w-full max-w-[80rem] items-center gap-4 px-4 sm:px-6 lg:gap-8">
          {/* Logo chữ đã chuyển thành nét (docs/brand/README.md); khai báo kích thước để không nhảy layout. */}
          <Link to="/" className="flex min-h-tap shrink-0 items-center">
            <img src="/brand/lalakode-logo.svg" alt={vi.app.name} width={131} height={30} />
          </Link>

          <nav
            id="menu-chinh"
            aria-label={vi.nav.menu}
            className={[
              // Màn hẹp: ngăn kéo thả xuống ngay dưới thanh trên cùng.
              'absolute inset-x-0 top-full border-b border-line bg-surface px-3 pb-3 shadow-card',
              // Màn rộng: một hàng chữ ở giữa thanh.
              'lg:static lg:flex lg:flex-1 lg:justify-center lg:border-0 lg:p-0 lg:shadow-none',
              menuOpen ? 'block' : 'hidden',
            ].join(' ')}
          >
            <ul className="flex flex-col gap-1 pt-2 lg:flex-row lg:gap-0 lg:pt-0">
              {navItems.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      [
                        'relative flex min-h-tap items-center rounded-lg px-4 text-small lg:min-h-16 lg:rounded-none',
                        // Vạch dưới 2px cho mục đang chọn ở màn rộng; màn hẹp tô nền nhạt.
                        'lg:after:absolute lg:after:inset-x-4 lg:after:bottom-0 lg:after:h-0.5',
                        isActive
                          ? 'bg-accent-soft font-semibold text-accent-strong lg:bg-transparent lg:after:bg-accent'
                          : 'font-medium text-ink-soft hover:bg-surface-muted hover:text-ink lg:hover:bg-transparent',
                      ].join(' ')
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
            <ul className="mt-2 border-t border-line pt-2 text-small lg:hidden">
              {secondaryLinks.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="flex min-h-tap items-center px-4 text-ink-soft underline hover:text-ink"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <Link
              to="/tien-do"
              className="hidden min-h-tap items-center gap-2 rounded-lg px-3 text-small font-semibold text-ink-soft hover:bg-surface-muted hover:text-ink sm:flex"
            >
              <KeyRound aria-hidden="true" className="size-4" />
              {vi.pages.progressCode}
            </Link>
            <IconButton
              label={menuOpen ? vi.nav.closeMenu : vi.nav.openMenu}
              icon={menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
              aria-expanded={menuOpen}
              aria-controls="menu-chinh"
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden"
            />
          </div>
        </div>
      </header>

      <div className="flex min-w-0 flex-1 flex-col">
        <main
          id="noi-dung"
          // Vùng nội dung tối đa 1600px, đệm 32px (16px dưới 640px) — S0-41.
          className="mx-auto w-full max-w-[100rem] flex-1 px-4 py-6 sm:p-8"
        >
          {wide ? (
            <Outlet />
          ) : (
            <div className="mx-auto w-full max-w-5xl rounded-card border border-line bg-surface p-5 sm:p-8">
              <Outlet />
            </div>
          )}
        </main>

        <footer className="text-small text-ink-soft">
          <div className="mx-auto flex w-full max-w-[100rem] flex-wrap items-center justify-between gap-2 px-4 pb-6 sm:px-8">
            <span>{vi.footer.madeFor}</span>
            <span className="flex flex-wrap gap-x-4">
              <Link to="/tien-do" className="flex min-h-tap items-center underline">
                {vi.pages.progressCode}
              </Link>
              <Link to="/gioi-thieu" className="flex min-h-tap items-center underline">
                {vi.nav.about}
              </Link>
              <Link to="/quyen-rieng-tu" className="flex min-h-tap items-center underline">
                {vi.footer.privacy}
              </Link>
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}

function isLearn(handle: unknown): boolean {
  return (
    typeof handle === 'object' && handle !== null && 'layout' in handle && handle.layout === 'learn'
  );
}

function isWide(handle: unknown): boolean {
  return typeof handle === 'object' && handle !== null && 'wide' in handle && handle.wide === true;
}

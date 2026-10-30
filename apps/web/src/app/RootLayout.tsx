import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router';
import { Award, House, Info, Map, Menu, Turtle, X } from 'lucide-react';
import { IconButton } from '../shared/ui/IconButton';
import { vi } from '../shared/i18n/vi';

const navItems = [
  { to: '/', label: vi.nav.home, end: true, icon: House },
  { to: '/ban-do', label: vi.nav.map, end: false, icon: Map },
  { to: '/huy-hieu', label: vi.nav.badges, end: false, icon: Award },
  { to: '/gioi-thieu', label: vi.nav.about, end: false, icon: Info },
];

const secondaryLinks = [
  { to: '/tien-do', label: vi.pages.progressCode },
  { to: '/quyen-rieng-tu', label: vi.footer.privacy },
];

/**
 * Khung trang (S0-31, docs/design-system.md):
 * - ≥ 1024px: sidebar trắng bên trái, nội dung trong thẻ trắng trên nền xám nhạt.
 * - < 1024px: thanh trên cùng + nút menu mở ngăn kéo. Không dùng thanh nav ở
 *   đáy vì đáy màn hình điện thoại để dành cho thanh nút Chạy/Nộp của màn bài tập.
 */
export function RootLayout() {
  // Nhớ menu được mở ở trang nào: chuyển sang trang khác là menu tự đóng.
  const [openedAt, setOpenedAt] = useState<string | null>(null);
  const { pathname } = useLocation();
  const menuOpen = openedAt === pathname;
  const setMenuOpen = (open: boolean) => setOpenedAt(open ? pathname : null);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenedAt(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  return (
    <div className="min-h-dvh text-ink lg:grid lg:grid-cols-[15rem_minmax(0,1fr)]">
      <a
        href="#noi-dung"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-30 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-surface"
      >
        {vi.nav.skipToContent}
      </a>

      <aside className="sticky top-0 z-20 border-b border-line bg-surface lg:flex lg:h-dvh lg:flex-col lg:border-r lg:border-b-0">
        <div className="flex items-center justify-between gap-2 px-4 py-2 lg:px-5 lg:pt-6 lg:pb-4">
          <Link to="/" className="flex min-h-tap items-center gap-2 text-card-title font-bold">
            <Turtle aria-hidden="true" className="size-6 text-accent-strong" />
            {vi.app.name}
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

        <nav
          id="menu-chinh"
          aria-label={vi.nav.menu}
          className={[
            'flex-1 flex-col justify-between px-3 pb-4 lg:flex',
            menuOpen ? 'flex' : 'hidden',
          ].join(' ')}
        >
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    [
                      'flex min-h-tap items-center gap-3 rounded-full px-4 text-label',
                      isActive
                        ? 'bg-ink text-surface'
                        : 'font-medium text-ink-soft hover:bg-surface-muted hover:text-ink',
                    ].join(' ')
                  }
                >
                  <item.icon aria-hidden="true" className="size-5" />
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <ul className="mt-4 border-t border-line pt-3 text-small">
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
      </aside>

      <div className="flex min-w-0 flex-col">
        <main id="noi-dung" className="w-full flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          <div className="mx-auto w-full max-w-5xl rounded-card bg-surface p-5 shadow-card sm:p-8">
            <Outlet />
          </div>
        </main>

        <footer className="text-small text-ink-soft">
          <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-2 px-4 pb-6 sm:px-6 lg:px-10">
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

import { Link, NavLink, Outlet } from 'react-router';
import { vi } from '../shared/i18n/vi';

const navItems = [
  { to: '/', label: vi.nav.home, end: true },
  { to: '/ban-do', label: vi.nav.map, end: false },
  { to: '/huy-hieu', label: vi.nav.badges, end: false },
  { to: '/gioi-thieu', label: vi.nav.about, end: false },
];

export function RootLayout() {
  return (
    <div className="flex min-h-dvh flex-col bg-surface text-ink">
      <a
        href="#noi-dung"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-10 focus:rounded-lg focus:bg-brand-500 focus:px-4 focus:py-2 focus:text-white"
      >
        {vi.nav.skipToContent}
      </a>

      <header className="border-b border-line">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
          <Link to="/" className="text-xl font-bold text-brand-600">
            {vi.app.name}
          </Link>
          <nav aria-label={vi.nav.menu} className="-mx-2">
            <ul className="flex flex-wrap">
              {navItems.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      [
                        'flex min-h-tap items-center rounded-lg px-3 font-medium',
                        isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-muted hover:text-ink',
                      ].join(' ')
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <main id="noi-dung" className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-line text-sm text-ink-muted">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-4">
          <span>{vi.footer.madeFor}</span>
          <Link to="/gioi-thieu" className="flex min-h-tap items-center underline">
            {vi.footer.privacy}
          </Link>
        </div>
      </footer>
    </div>
  );
}

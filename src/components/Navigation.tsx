import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, Sparkles, Coins, Wallet } from 'lucide-react';

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/content', label: 'Content', icon: FileText },
  { to: '/ai', label: 'AI Runner', icon: Sparkles },
  { to: '/tokens', label: 'Tokens', icon: Coins },
  { to: '/admin', label: 'Admin', icon: Wallet },
];

export default function Navigation() {
  return (
    <header className="sticky top-0 z-50 border-b border-paper-300 bg-paper-50/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <NavLink to="/" className="flex items-baseline gap-2">
          <span className="font-serif text-xl font-semibold text-forest-600">Tongston</span>
          <span className="font-sans text-xs font-medium text-ink-400 tracking-wide">T-WORLD</span>
        </NavLink>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-1.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-forest-600'
                    : 'text-ink-500 hover:text-ink-900'
                }`
              }
            >
              <Icon size={15} />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>

      <nav className="flex gap-4 overflow-x-auto border-t border-paper-200 px-5 py-2 md:hidden">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex shrink-0 items-center gap-1.5 text-xs font-medium transition-colors ${
                isActive ? 'text-forest-600' : 'text-ink-400'
              }`
            }
          >
            <Icon size={13} />
            {label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}

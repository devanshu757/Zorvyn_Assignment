import { useState, useRef, useEffect } from 'react';
import {
  LayoutDashboard, ArrowLeftRight, PiggyBank, Target,
  BarChart2, Lightbulb, Settings, Sun, Moon, Menu, X,
  LogOut, ChevronDown, Shield, Eye,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Page } from '../../types';

const navLinks: { label: string; page: Page; icon: React.ReactNode }[] = [
  { label: 'Dashboard', page: 'dashboard', icon: <LayoutDashboard size={15} /> },
  { label: 'Transactions', page: 'transactions', icon: <ArrowLeftRight size={15} /> },
  { label: 'Budgets', page: 'budgets', icon: <PiggyBank size={15} /> },
  { label: 'Goals', page: 'goals', icon: <Target size={15} /> },
  { label: 'Reports', page: 'reports', icon: <BarChart2 size={15} /> },
  { label: 'Insights', page: 'insights', icon: <Lightbulb size={15} /> },
];

// Compact SVG logo mark — upward trend with a coin
function LogoMark({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Coin circle */}
      <circle cx="15" cy="5" r="3.5" fill="white" fillOpacity="0.25" />
      <circle cx="15" cy="5" r="2" fill="white" />
      {/* Trend line */}
      <path d="M2 15L7 9L11 12L15 5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function UserMenu({
  userName,
  role,
  onLogout,
  setPage,
}: {
  userName?: string;
  role: string;
  onLogout?: () => void;
  setPage: (p: Page) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const initials = userName
    ? userName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : role === 'admin' ? 'AD' : 'VW';

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
      >
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0">
          {initials}
        </div>
        <div className="text-left hidden lg:block">
          <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-100 leading-none">{userName || 'User'}</p>
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5 capitalize">{role}</p>
        </div>
        <ChevronDown size={13} className={`text-zinc-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-xl shadow-zinc-200/60 dark:shadow-zinc-950/60 overflow-hidden animate-fade-in z-50">
          {/* User info */}
          <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-700">
            <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{userName || 'User'}</p>
            <div className="flex items-center gap-1.5 mt-1">
              {role === 'admin'
                ? <Shield size={11} className="text-violet-500" />
                : <Eye size={11} className="text-zinc-400" />}
              <p className="text-xs text-zinc-400 dark:text-zinc-500 capitalize">{role} access</p>
            </div>
          </div>

          {/* Links */}
          <div className="py-1">
            <button
              onClick={() => { setPage('profile' as Page); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white text-[8px] font-bold flex-shrink-0">
                {initials.slice(0, 1)}
              </div>
              View Profile
            </button>
            <button
              onClick={() => { setPage('settings'); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <Settings size={14} className="text-zinc-400" />
              Settings
            </button>
          </div>

          <div className="border-t border-zinc-100 dark:border-zinc-700 py-1">
            <button
              onClick={() => { setOpen(false); onLogout?.(); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
            >
              <LogOut size={14} />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Navbar({ onLogout, userName }: { onLogout?: () => void; userName?: string }) {
  const { currentPage, setPage, role, theme, toggleTheme } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-200/80 dark:border-zinc-700/80 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">

          {/* Logo */}
          <button
            onClick={() => setPage('dashboard')}
            className="flex items-center gap-2 flex-shrink-0 mr-4"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 via-violet-500 to-indigo-600 flex items-center justify-center shadow-md shadow-violet-300/40 dark:shadow-violet-900/30">
              <LogoMark size={18} />
            </div>
            <span className="text-base font-bold tracking-tight text-zinc-900 dark:text-white hidden sm:block">
              Fin<span className="bg-gradient-to-r from-violet-600 to-indigo-500 bg-clip-text text-transparent">Track</span>
            </span>
          </button>

          {/* Desktop nav links — centered */}
          <div className="hidden md:flex items-center gap-0.5 flex-1">
            {navLinks.map(({ label, page, icon }) => (
              <button
                key={page}
                onClick={() => setPage(page)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 whitespace-nowrap ${
                  currentPage === page
                    ? 'bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                <span className={currentPage === page ? 'text-violet-600 dark:text-violet-400' : ''}>{icon}</span>
                {label}
              </button>
            ))}
          </div>

          {/* Right: theme + user menu */}
          <div className="hidden md:flex items-center gap-1 ml-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </button>

            <UserMenu userName={userName} role={role} onLogout={onLogout} setPage={setPage} />
          </div>

          {/* Mobile: theme + hamburger */}
          <div className="md:hidden flex items-center gap-1">
            <button onClick={toggleTheme} className="p-2 rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all">
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="md:hidden border-t border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 space-y-1 animate-fade-in">
          {[...navLinks, { label: 'Settings', page: 'settings' as Page, icon: <Settings size={15} /> }].map(({ label, page, icon }) => (
            <button
              key={page}
              onClick={() => { setPage(page); setMenuOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                currentPage === page
                  ? 'bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              {icon}
              {label}
            </button>
          ))}
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-3 px-3 py-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                {userName ? userName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : 'U'}
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{userName || 'User'}</p>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 capitalize">{role}</p>
              </div>
            </div>
            <button
              onClick={() => { setMenuOpen(false); onLogout?.(); }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all"
            >
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

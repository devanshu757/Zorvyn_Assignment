import { useState } from 'react';
import { TrendingUp, LayoutDashboard, ArrowLeftRight, Lightbulb, Sun, Moon, Shield, Eye, Menu, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Page } from '../../types';

const navLinks: { label: string; page: Page; icon: React.ReactNode }[] = [
  { label: 'Dashboard', page: 'dashboard', icon: <LayoutDashboard size={16} /> },
  { label: 'Transactions', page: 'transactions', icon: <ArrowLeftRight size={16} /> },
  { label: 'Insights', page: 'insights', icon: <Lightbulb size={16} /> },
];

export default function Navbar() {
  const { currentPage, setPage, role, setRole, theme, toggleTheme } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-200 dark:border-zinc-700 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center shadow-sm">
              <TrendingUp size={16} className="text-white" />
            </div>
            <span className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">
              Fin<span className="text-brand-600">Track</span>
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ label, page, icon }) => (
              <button
                key={page}
                onClick={() => setPage(page)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                  currentPage === page
                    ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                {icon}
                {label}
              </button>
            ))}
          </div>

          {/* Right Controls */}
          <div className="hidden md:flex items-center gap-2">
            {/* Role Switcher */}
            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
              <button
                onClick={() => setRole('viewer')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  role === 'viewer'
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
              >
                <Eye size={12} />
                Viewer
              </button>
              <button
                onClick={() => setRole('admin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  role === 'admin'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
              >
                <Shield size={12} />
                Admin
              </button>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-xs font-semibold">
              {role === 'admin' ? 'A' : 'V'}
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 space-y-1 animate-fade-in">
          {navLinks.map(({ label, page, icon }) => (
            <button
              key={page}
              onClick={() => { setPage(page); setMenuOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                currentPage === page
                  ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              {icon}
              {label}
            </button>
          ))}
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
              <button
                onClick={() => setRole('viewer')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  role === 'viewer' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500'
                }`}
              >
                <Eye size={11} /> Viewer
              </button>
              <button
                onClick={() => setRole('admin')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  role === 'admin' ? 'bg-brand-600 text-white shadow-sm' : 'text-zinc-500'
                }`}
              >
                <Shield size={11} /> Admin
              </button>
            </div>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

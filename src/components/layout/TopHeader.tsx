import { useState, useRef, useEffect } from 'react';
import {
  Menu, Bell, Search, X, Check, AlertTriangle, Info,
  ChevronRight, LayoutDashboard, ArrowLeftRight, Wallet, Receipt,
  PiggyBank, Target, BarChart3, Lightbulb, TrendingUp,
  Settings as SettingsIcon, User,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Page } from '../../types';

/* ── Page title map ───────────────────────────────────── */
const PAGE_META: Record<Page, { title: string; subtitle: string }> = {
  dashboard:    { title: 'Dashboard',    subtitle: 'Your financial overview' },
  transactions: { title: 'Transactions', subtitle: 'History & spending records' },
  accounts:     { title: 'Accounts',     subtitle: 'Manage your bank & card accounts' },
  bills:        { title: 'Bills & Subscriptions', subtitle: 'Recurring payments tracker' },
  budgets:      { title: 'Budgets',      subtitle: 'Monthly spending limits' },
  goals:        { title: 'Goals',        subtitle: 'Savings targets & milestones' },
  reports:      { title: 'Reports',      subtitle: 'Charts & financial summaries' },
  insights:     { title: 'Insights',     subtitle: 'Smart patterns & predictions' },
  analytics:    { title: 'Analytics',    subtitle: 'Deep-dive financial analysis' },
  settings:     { title: 'Settings',     subtitle: 'Preferences & account options' },
  profile:      { title: 'Profile',      subtitle: 'Your account details' },
};

/* ── Notification types ───────────────────────────────── */
interface AppNotification {
  id: string;
  type: 'warning' | 'success' | 'info';
  title: string;
  message: string;
}

/* ── Notification Panel ───────────────────────────────── */
function NotificationPanel({
  items,
  onClose,
}: {
  items: AppNotification[];
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const icons = {
    warning: <AlertTriangle size={14} className="text-amber-500" />,
    success: <Check size={14} className="text-emerald-500" />,
    info:    <Info size={14} className="text-brand-500" />,
  };

  const bg = {
    warning: 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800/40',
    success: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/40',
    info:    'bg-brand-50 dark:bg-brand-900/20 border-brand-100 dark:border-brand-800/40',
  };

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-navy-900
                 border border-zinc-200 dark:border-navy-700 rounded-2xl
                 shadow-dropdown animate-scale-in z-50 overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-navy-750">
        <div>
          <p className="text-sm font-semibold text-zinc-900 dark:text-white">Notifications</p>
          {items.length > 0 && (
            <p className="text-xs text-zinc-400 mt-0.5">{items.length} alert{items.length !== 1 ? 's' : ''}</p>
          )}
        </div>
        <button onClick={onClose} className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all">
          <X size={14} />
        </button>
      </div>

      <div className="max-h-72 overflow-y-auto">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-3">
              <Bell size={16} className="text-zinc-400" />
            </div>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">All caught up!</p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">No alerts right now.</p>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {items.map(n => (
              <div key={n.id} className={`flex items-start gap-3 p-3 rounded-xl border ${bg[n.type]}`}>
                <div className="mt-0.5 flex-shrink-0">{icons[n.type]}</div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">{n.title}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">{n.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Quick Search Bar ─────────────────────────────────── */
const SEARCH_SECTIONS: { label: string; items: { label: string; page: Page; icon: React.ElementType }[] }[] = [
  {
    label: 'Overview',
    items: [{ label: 'Dashboard', page: 'dashboard', icon: LayoutDashboard }],
  },
  {
    label: 'Finance',
    items: [
      { label: 'Transactions', page: 'transactions', icon: ArrowLeftRight },
      { label: 'Accounts',     page: 'accounts',     icon: Wallet },
      { label: 'Bills',        page: 'bills',        icon: Receipt },
    ],
  },
  {
    label: 'Planning',
    items: [
      { label: 'Budgets', page: 'budgets', icon: PiggyBank },
      { label: 'Goals',   page: 'goals',   icon: Target },
    ],
  },
  {
    label: 'Analytics',
    items: [
      { label: 'Reports',   page: 'reports',   icon: BarChart3 },
      { label: 'Insights',  page: 'insights',  icon: Lightbulb },
      { label: 'Analytics', page: 'analytics', icon: TrendingUp },
    ],
  },
  {
    label: 'Account',
    items: [
      { label: 'Settings', page: 'settings', icon: SettingsIcon },
      { label: 'Profile',  page: 'profile',  icon: User },
    ],
  },
];

function QuickSearch({ onClose }: { onClose: () => void }) {
  const { setPage } = useApp();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const allItems = SEARCH_SECTIONS.flatMap(s => s.items);
  const displaySections = query.trim()
    ? [{ label: 'Results', items: allItems.filter(p => p.label.toLowerCase().includes(query.toLowerCase())) }]
    : SEARCH_SECTIONS;

  useEffect(() => { inputRef.current?.focus(); }, []);
  function go(page: Page) { setPage(page); onClose(); }

  const hasResults = displaySections.some(s => s.items.length > 0);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4 bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-navy-900 rounded-2xl shadow-modal border border-zinc-200/80 dark:border-navy-700 overflow-hidden animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Input row */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-zinc-100 dark:border-navy-750">
          <Search size={16} className="text-zinc-400 flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Navigate to a page…"
            className="flex-1 bg-transparent text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Clear search"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Results list */}
        <div className="max-h-80 overflow-y-auto p-2">
          {!hasResults ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Search size={22} className="text-zinc-300 dark:text-zinc-600 mb-2" />
              <p className="text-sm font-medium text-zinc-500">No results for "{query}"</p>
              <p className="text-xs text-zinc-400 mt-0.5">Try a different page name</p>
            </div>
          ) : (
            displaySections.map(section =>
              section.items.length > 0 && (
                <div key={section.label} className="mb-1 last:mb-0">
                  <p className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                    {section.label}
                  </p>
                  {section.items.map(p => {
                    const Icon = p.icon;
                    return (
                      <button
                        key={p.page}
                        onClick={() => go(p.page)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-50 dark:hover:bg-navy-800 text-left transition-colors group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-navy-750 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-50 dark:group-hover:bg-brand-900/30 transition-colors">
                          <Icon size={14} className="text-zinc-500 dark:text-zinc-400 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors" />
                        </div>
                        <span className="flex-1 text-sm font-medium text-zinc-800 dark:text-zinc-200">{p.label}</span>
                        <ChevronRight size={13} className="text-zinc-300 dark:text-zinc-600 group-hover:text-brand-500 transition-colors flex-shrink-0" />
                      </button>
                    );
                  })}
                </div>
              )
            )
          )}
        </div>

        {/* Footer hints */}
        <div className="flex items-center gap-5 px-4 py-2.5 border-t border-zinc-100 dark:border-navy-750 bg-zinc-50 dark:bg-navy-950/60">
          <div className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 bg-white dark:bg-navy-800 border border-zinc-200 dark:border-navy-700 rounded text-[10px] text-zinc-500 font-mono shadow-sm">↵</kbd>
            <span className="text-[11px] text-zinc-400">to navigate</span>
          </div>
          <div className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 bg-white dark:bg-navy-800 border border-zinc-200 dark:border-navy-700 rounded text-[10px] text-zinc-500 font-mono shadow-sm">Esc</kbd>
            <span className="text-[11px] text-zinc-400">to close</span>
          </div>
          <div className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 bg-white dark:bg-navy-800 border border-zinc-200 dark:border-navy-700 rounded text-[10px] text-zinc-500 font-mono shadow-sm">⌘K</kbd>
            <span className="text-[11px] text-zinc-400">to toggle</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── TopHeader ────────────────────────────────────────── */
interface TopHeaderProps {
  onMenuClick: () => void;
  notifications: AppNotification[];
}

export default function TopHeader({ onMenuClick, notifications }: TopHeaderProps) {
  const { currentPage } = useApp();
  const [bellOpen, setBellOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const meta = PAGE_META[currentPage] ?? PAGE_META.dashboard;
  const unread = notifications.length;

  // Cmd/Ctrl + K → open search
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(v => !v); }
      if (e.key === 'Escape') { setSearchOpen(false); setBellOpen(false); }
    }
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <>
      <header className="h-[52px] flex-shrink-0 flex items-center justify-between px-5
                         bg-white/80 dark:bg-navy-950/80 backdrop-blur-md
                         border-b border-zinc-200/50 dark:border-navy-800/40
                         shadow-sm sticky top-0 z-30">

        {/* Left: mobile menu + page title */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Mobile hamburger */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
          >
            <Menu size={18} />
          </button>

          <div className="min-w-0">
            <h1 className="text-[15px] font-bold text-zinc-900 dark:text-white leading-none truncate">
              {meta.title}
            </h1>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5 hidden sm:block truncate">
              {meta.subtitle}
            </p>
          </div>
        </div>

        {/* Right: search + bell */}
        <div className="flex items-center gap-2">
          {/* Search trigger */}
          <button
            onClick={() => setSearchOpen(true)}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl
                       bg-zinc-100 dark:bg-navy-800 hover:bg-zinc-200 dark:hover:bg-navy-750
                       text-xs text-zinc-400 dark:text-blue-200/50 transition-all"
          >
            <Search size={13} />
            <span>Search</span>
            <kbd className="ml-1 px-1 py-0.5 bg-white dark:bg-navy-700 rounded text-[10px] font-mono border border-zinc-200 dark:border-navy-600">
              ⌘K
            </kbd>
          </button>

          <button
            onClick={() => setSearchOpen(true)}
            className="sm:hidden p-2 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
          >
            <Search size={16} />
          </button>

          {/* Bell */}
          <div className="relative">
            <button
              onClick={() => setBellOpen(v => !v)}
              className="p-2 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all relative"
            >
              <Bell size={16} />
              {unread > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
              )}
            </button>

            {bellOpen && (
              <NotificationPanel
                items={notifications}
                onClose={() => setBellOpen(false)}
              />
            )}
          </div>
        </div>
      </header>

      {/* Quick search overlay */}
      {searchOpen && <QuickSearch onClose={() => setSearchOpen(false)} />}
    </>
  );
}

export type { AppNotification };

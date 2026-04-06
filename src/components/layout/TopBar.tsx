import { Bell, Search } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Page } from '../../types';

const PAGE_META: Record<Page, { title: string; desc: string }> = {
  dashboard:    { title: 'Dashboard',     desc: 'Your financial overview' },
  transactions: { title: 'Transactions',  desc: 'All income & expense records' },
  accounts:     { title: 'Accounts',      desc: 'Linked bank & investment accounts' },
  bills:        { title: 'Bills & Subscriptions', desc: 'Recurring payments & due dates' },
  budgets:      { title: 'Budgets',       desc: 'Monthly spending limits' },
  goals:        { title: 'Savings Goals', desc: 'Track your financial targets' },
  reports:      { title: 'Reports',       desc: 'Detailed financial reports' },
  insights:     { title: 'Insights',      desc: 'Smart spending observations' },
  analytics:    { title: 'Analytics',     desc: 'Advanced data analysis' },
  settings:     { title: 'Settings',      desc: 'Preferences & configuration' },
  profile:      { title: 'Profile',       desc: 'Manage your account' },
};

interface TopBarProps {
  userName?: string;
}

export default function TopBar({ userName }: TopBarProps) {
  const { currentPage, setPage, role } = useApp();
  const meta = PAGE_META[currentPage] ?? PAGE_META.dashboard;

  const initials = userName
    ? userName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : role === 'admin' ? 'AD' : 'VW';

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-700/60 flex-shrink-0">
      {/* Page title */}
      <div>
        <h1 className="text-lg font-bold text-zinc-900 dark:text-white leading-none">{meta.title}</h1>
        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">{meta.desc}</p>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Search shortcut */}
        <button
          onClick={() => setPage('transactions')}
          className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all text-xs"
        >
          <Search size={13} />
          <span>Search...</span>
          <kbd className="hidden md:block ml-1 px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 text-[10px] font-medium text-zinc-400">⌘K</kbd>
        </button>

        {/* Notifications */}
        <button className="relative p-2 rounded-xl text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-200 transition-all">
          <Bell size={17} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-violet-500 ring-2 ring-white dark:ring-zinc-900" />
        </button>

        {/* Avatar (visible on mobile, links to profile) */}
        <button
          onClick={() => setPage('profile')}
          className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-[11px] font-bold shadow-md shadow-violet-400/30 hover:shadow-violet-400/50 transition-shadow lg:hidden"
        >
          {initials}
        </button>
      </div>
    </header>
  );
}

import { useRef, useEffect } from 'react';
import {
  LayoutDashboard, ArrowLeftRight, Receipt,
  PiggyBank, Target, BarChart3, Lightbulb, TrendingUp,
  Settings, LogOut, Shield, Eye,
  ChevronLeft, Wallet,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Page } from '../../types';

/* ── Logo SVG ─────────────────────────────────────────── */
function LogoIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <circle cx="15" cy="5" r="3.5" fill="white" fillOpacity="0.25" />
      <circle cx="15" cy="5" r="2" fill="white" />
      <path d="M2 15L7 9L11 12L15 5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── Moon / Sun inline (avoid re-import issues) ─────────── */
function MoonIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}
function SunIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

/* ── Tooltip ─────────────────────────────────────────────  */
function Tooltip({ text, children }: { text: string; children: React.ReactNode }) {
  return (
    <div className="relative group/tip flex">
      {children}
      <div className="pointer-events-none absolute left-full ml-2.5 top-1/2 -translate-y-1/2 z-[200]
                      opacity-0 group-hover/tip:opacity-100 transition-opacity duration-150">
        <div className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-medium
                        px-2.5 py-1.5 rounded-lg shadow-lg whitespace-nowrap">
          {text}
          <div className="absolute right-full top-1/2 -translate-y-1/2
                          border-4 border-transparent border-r-zinc-900 dark:border-r-zinc-100" />
        </div>
      </div>
    </div>
  );
}

/* ── Nav config ──────────────────────────────────────────── */
interface NavItem { label: string; page: Page; Icon: React.ElementType; badgeKey?: string }
interface NavSection { label?: string; items: NavItem[] }

const NAV: NavSection[] = [
  {
    items: [{ label: 'Dashboard', page: 'dashboard', Icon: LayoutDashboard }],
  },
  {
    label: 'Finance',
    items: [
      { label: 'Transactions', page: 'transactions', Icon: ArrowLeftRight },
      { label: 'Accounts',     page: 'accounts',     Icon: Wallet },
      { label: 'Bills',        page: 'bills',        Icon: Receipt,   badgeKey: 'bills' },
    ],
  },
  {
    label: 'Planning',
    items: [
      { label: 'Budgets', page: 'budgets', Icon: PiggyBank, badgeKey: 'budgets' },
      { label: 'Goals',   page: 'goals',   Icon: Target },
    ],
  },
  {
    label: 'Analytics',
    items: [
      { label: 'Reports',   page: 'reports',   Icon: BarChart3 },
      { label: 'Insights',  page: 'insights',  Icon: Lightbulb },
      { label: 'Analytics', page: 'analytics', Icon: TrendingUp },
    ],
  },
];

/* ── Props ───────────────────────────────────────────────── */
export interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
  userName?: string;
  onLogout?: () => void;
  budgetBadge?: number;
  billsBadge?: number;
}

export default function Sidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onMobileClose,
  userName,
  onLogout,
  budgetBadge = 0,
  billsBadge = 0,
}: SidebarProps) {
  const { currentPage, setPage, role, theme, toggleTheme } = useApp();
  const drawerRef = useRef<HTMLDivElement>(null);

  const badges: Record<string, number> = { budgets: budgetBadge, bills: billsBadge };

  const initials = userName
    ? userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : role === 'admin' ? 'AD' : 'VW';

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape' && mobileOpen) onMobileClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [mobileOpen, onMobileClose]);

  function navigate(page: Page) { setPage(page); onMobileClose(); }

  /* ── Shared inner content ─ used by both desktop & mobile ── */
  const Inner = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="flex flex-col h-full overflow-hidden">

      {/* Logo bar */}
      <div className={`flex items-center flex-shrink-0 border-b border-zinc-100 dark:border-navy-750
                       ${(collapsed && !isMobile) ? 'h-[52px] justify-center px-2' : 'h-[52px] px-4 gap-2.5'}`}>
        <button onClick={() => navigate('dashboard')} className="flex items-center gap-2.5 min-w-0 group/logo">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-700 via-brand-600 to-brand-400
                          flex items-center justify-center flex-shrink-0
                          shadow-md shadow-brand-900/20 group-hover/logo:scale-110 group-hover/logo:shadow-glow-brand transition-all duration-300">
            <LogoIcon size={14} />
          </div>
          {(!collapsed || isMobile) && (
            <span className="text-[15px] font-bold tracking-tight text-zinc-900 dark:text-white whitespace-nowrap">
              Fin<span className="text-gradient-brand">Track</span>
            </span>
          )}
        </button>

        {/* Collapse button — desktop only */}
        {(!collapsed || isMobile) && !isMobile && (
          <button
            onClick={onToggleCollapse}
            title="Collapse sidebar"
            className="ml-auto p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200
                       hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
          >
            <ChevronLeft size={14} />
          </button>
        )}
      </div>

      {/* Expand button when collapsed */}
      {collapsed && !isMobile && (
        <button
          onClick={onToggleCollapse}
          title="Expand sidebar"
          className="mx-auto mt-2 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200
                     hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
        >
          <ChevronLeft size={14} className="rotate-180" />
        </button>
      )}

      {/* Nav links */}
      <nav className="flex-1 overflow-y-auto no-scrollbar py-2 px-2">
        {NAV.map((section, si) => (
          <div key={si} className={si > 0 ? 'mt-0.5' : ''}>
            {/* Section header */}
            {section.label && (!collapsed || isMobile) && (
              <p className="px-3 pt-3 pb-1 text-[10px] font-bold uppercase tracking-[0.09em]
                             text-zinc-400 dark:text-zinc-500">
                {section.label}
              </p>
            )}
            {section.label && collapsed && !isMobile && (
              <div className="my-1.5 mx-2 border-t border-zinc-100 dark:border-zinc-800" />
            )}

            {/* Items */}
            {section.items.map(({ label, page, Icon, badgeKey }) => {
              const active = currentPage === page;
              const badge = badgeKey ? badges[badgeKey] ?? 0 : 0;

              const btn = (
                <button
                  key={page}
                  onClick={() => navigate(page)}
                  className={`
                    nav-item w-full relative
                    ${active ? 'nav-item-active' : ''}
                    ${(collapsed && !isMobile) ? 'justify-center !px-0 h-10 !w-10 mx-auto' : ''}
                  `}
                >
                  {/* Active indicator bar */}
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-brand-600 dark:bg-brand-400 rounded-r-full" />
                  )}

                  <div className="relative flex-shrink-0">
                    <Icon size={16} className={active ? 'text-brand-600 dark:text-brand-400' : ''} />
                    {badge > 0 && (collapsed && !isMobile) && (
                      <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-rose-500 text-white text-[8px]
                                       font-bold rounded-full flex items-center justify-center shadow-sm">
                        {badge > 9 ? '9+' : badge}
                      </span>
                    )}
                  </div>

                  {(!collapsed || isMobile) && (
                    <>
                      <span className="flex-1 text-left">{label}</span>
                      {badge > 0 && (
                        <span className="ml-auto px-1.5 py-0.5 bg-rose-100 dark:bg-rose-900/40
                                         text-rose-600 dark:text-rose-400 text-[9px] font-bold
                                         rounded-full min-w-[18px] text-center">
                          {badge}
                        </span>
                      )}
                    </>
                  )}
                </button>
              );

              return (collapsed && !isMobile) ? (
                <Tooltip key={page} text={label}>{btn}</Tooltip>
              ) : btn;
            })}
          </div>
        ))}
      </nav>

      {/* Bottom bar */}
      <div className="flex-shrink-0 border-t border-zinc-100 dark:border-navy-750 p-2 space-y-0.5">
        {/* Theme */}
        {(collapsed && !isMobile) ? (
          <Tooltip text={theme === 'light' ? 'Dark Mode' : 'Light Mode'}>
            <button onClick={toggleTheme} className="nav-item w-10 h-10 mx-auto justify-center !px-0">
              {theme === 'light' ? <MoonIcon size={16} /> : <SunIcon size={16} />}
            </button>
          </Tooltip>
        ) : (
          <button onClick={toggleTheme} className="nav-item w-full">
            {theme === 'light' ? <MoonIcon size={16} /> : <SunIcon size={16} />}
            <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
          </button>
        )}

        {/* Settings */}
        {(collapsed && !isMobile) ? (
          <Tooltip text="Settings">
            <button onClick={() => navigate('settings')}
              className={`nav-item w-10 h-10 mx-auto justify-center !px-0 ${currentPage === 'settings' ? 'nav-item-active' : ''}`}>
              <Settings size={16} className={currentPage === 'settings' ? 'text-brand-600 dark:text-brand-400' : ''} />
            </button>
          </Tooltip>
        ) : (
          <button onClick={() => navigate('settings')}
            className={`nav-item w-full ${currentPage === 'settings' ? 'nav-item-active' : ''}`}>
            <Settings size={16} className={currentPage === 'settings' ? 'text-brand-600 dark:text-brand-400' : ''} />
            <span>Settings</span>
          </button>
        )}

        {/* User profile row */}
        <div className={`pt-1.5 mt-0.5 border-t border-zinc-100 dark:border-navy-750 ${(collapsed && !isMobile) ? 'flex flex-col items-center gap-1' : ''}`}>
          {(collapsed && !isMobile) ? (
            <>
              <Tooltip text={`${userName || 'Profile'} · ${role}`}>
                <button onClick={() => navigate('profile')}
                  className="w-9 h-9 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-400 flex items-center justify-center text-white text-xs font-bold shadow-md hover:scale-110 hover:shadow-glow-brand transition-all duration-300">
                  {initials}
                </button>
              </Tooltip>
              <Tooltip text="Sign out">
                <button onClick={onLogout}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all">
                  <LogOut size={14} />
                </button>
              </Tooltip>
            </>
          ) : (
            <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl group">
              <button onClick={() => navigate('profile')} className="flex items-center gap-2.5 flex-1 min-w-0 hover:opacity-80 transition-opacity group/prof">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-600 to-brand-400 flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0 shadow-md group-hover/prof:scale-110 transition-transform duration-300">
                  {initials}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate leading-none">{userName || 'User'}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    {role === 'admin'
                      ? <Shield size={9} className="text-brand-500 flex-shrink-0" />
                      : <Eye size={9} className="text-zinc-400 flex-shrink-0" />}
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 capitalize">{role}</p>
                  </div>
                </div>
              </button>
              <button
                onClick={onLogout}
                title="Sign out"
                className="p-1.5 rounded-lg text-zinc-300 dark:text-zinc-600 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all flex-shrink-0">
                <LogOut size={13} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={onMobileClose}
        />
      )}

      {/* Mobile drawer */}
      <div
        ref={drawerRef}
        className={`
          fixed top-0 left-0 h-screen z-50 w-[240px]
          bg-white dark:bg-navy-900
          border-r border-zinc-200/80 dark:border-navy-750/60
          shadow-sidebar transform transition-transform duration-300 ease-in-out
          lg:hidden
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <Inner isMobile />
      </div>

      {/* Desktop sidebar */}
      <aside
        className={`
          hidden lg:flex flex-col flex-shrink-0
          bg-white dark:bg-navy-900
          border-r border-zinc-200/80 dark:border-navy-750/60
          h-screen sticky top-0 overflow-hidden
          transition-all duration-300 ease-in-out
          shadow-sidebar
          ${collapsed ? 'w-16' : 'w-[240px]'}
        `}
      >
        <Inner />
      </aside>
    </>
  );
}

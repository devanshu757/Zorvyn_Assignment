import { useEffect, useState, useMemo } from 'react';
import { useApp } from './context/AppContext';
import Sidebar from './components/layout/Sidebar';
import TopHeader, { AppNotification } from './components/layout/TopHeader';

import Dashboard    from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Accounts     from './pages/Accounts';
import Bills        from './pages/Bills';
import Budgets      from './pages/Budgets';
import Goals        from './pages/Goals';
import Reports      from './pages/Reports';
import Insights     from './pages/Insights';
import Analytics    from './pages/Analytics';
import Settings     from './pages/Settings';
import Profile      from './pages/Profile';
import Login        from './pages/Login';

function AppContent() {
  const { theme, currentPage, transactions, budgets, bills } = useApp();

  const [loggedIn, setLoggedIn] = useState(() => localStorage.getItem('ft_session') === 'active');
  const [userName, setUserName] = useState(() => localStorage.getItem('ft_session_name') ?? '');

  /* sidebar state */
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem('ft_sidebar_collapsed') === 'true';
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  /* theme class */
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
  }, [theme]);

  /* persist collapsed */
  useEffect(() => {
    localStorage.setItem('ft_sidebar_collapsed', String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  /* ── Compute notification badges & alerts ─────────────── */
  const { budgetBadge, billsBadge, notifications } = useMemo(() => {
    const today = new Date();
    const currentMonth = today.toISOString().slice(0, 7);

    // Budget alerts: categories > 80% of limit
    const monthSpend: Record<string, number> = {};
    transactions
      .filter(t => t.type === 'expense' && t.date.startsWith(currentMonth))
      .forEach(t => { monthSpend[t.category] = (monthSpend[t.category] ?? 0) + t.amount; });

    const overBudgetItems = budgets.filter(b => {
      const spent = monthSpend[b.category] ?? 0;
      return spent >= b.limit * 0.8;
    });
    const budgetBadge = overBudgetItems.length;

    // Bills due in ≤ 5 days
    const todayDay = today.getDate();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const dueSoonBills = bills.filter(b => {
      if (!b.isActive || b.isPaid) return false;
      const daysUntilDue = b.dueDay >= todayDay
        ? b.dueDay - todayDay
        : (daysInMonth - todayDay) + b.dueDay;
      return daysUntilDue <= 5;
    });
    const billsBadge = dueSoonBills.length;

    // Build notification list
    const notifs: AppNotification[] = [];

    overBudgetItems.forEach(b => {
      const spent = monthSpend[b.category] ?? 0;
      const pct = Math.round((spent / b.limit) * 100);
      const isOver = spent > b.limit;
      notifs.push({
        id: `budget-${b.category}`,
        type: isOver ? 'warning' : 'info',
        title: isOver ? `Budget exceeded: ${b.category}` : `Budget alert: ${b.category}`,
        message: isOver
          ? `You've spent $${spent.toFixed(0)} — $${(spent - b.limit).toFixed(0)} over your $${b.limit} limit.`
          : `You've used ${pct}% of your $${b.limit} ${b.category} budget this month.`,
      });
    });

    dueSoonBills.forEach(b => {
      const daysUntilDue = b.dueDay >= todayDay
        ? b.dueDay - todayDay
        : (daysInMonth - todayDay) + b.dueDay;
      notifs.push({
        id: `bill-${b.id}`,
        type: daysUntilDue === 0 ? 'warning' : 'info',
        title: daysUntilDue === 0 ? `${b.name} due today` : `${b.name} due in ${daysUntilDue}d`,
        message: `$${b.amount} for ${b.name} is due ${daysUntilDue === 0 ? 'today' : `in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}`}.`,
      });
    });

    return { budgetBadge, billsBadge, notifications: notifs };
  }, [transactions, budgets, bills]);

  function handleLogin(name: string) {
    localStorage.setItem('ft_session', 'active');
    localStorage.setItem('ft_session_name', name);
    setUserName(name);
    setLoggedIn(true);
  }

  function handleLogout() {
    localStorage.removeItem('ft_session');
    localStorage.removeItem('ft_session_name');
    setLoggedIn(false);
    setUserName('');
  }

  if (!loggedIn) return <Login onLogin={handleLogin} />;

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-navy-950 transition-colors duration-250">

      {/* ── Sidebar ─────────────────────────────────────── */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(v => !v)}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
        userName={userName}
        onLogout={handleLogout}
        budgetBadge={budgetBadge}
        billsBadge={billsBadge}
      />

      {/* ── Main area ───────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top header */}
        <TopHeader
          onMenuClick={() => setMobileMenuOpen(true)}
          notifications={notifications}
        />

        {/* Scrollable page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {currentPage === 'dashboard'    && <Dashboard />}
            {currentPage === 'transactions' && <Transactions />}
            {currentPage === 'accounts'     && <Accounts />}
            {currentPage === 'bills'        && <Bills />}
            {currentPage === 'budgets'      && <Budgets />}
            {currentPage === 'goals'        && <Goals />}
            {currentPage === 'reports'      && <Reports />}
            {currentPage === 'insights'     && <Insights />}
            {currentPage === 'analytics'    && <Analytics />}
            {currentPage === 'settings'     && <Settings />}
            {currentPage === 'profile'      && <Profile userName={userName} />}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return <AppContent />;
}

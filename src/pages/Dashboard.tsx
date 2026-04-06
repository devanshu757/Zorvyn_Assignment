import { useMemo } from 'react';
import {
  ArrowRight, ShieldCheck,
  Wallet, Target, AlertTriangle, Calendar, ArrowUpRight, ArrowDownRight,
  DollarSign, Activity, CreditCard, Zap,
} from 'lucide-react';
import {
  AreaChart, Area, ResponsiveContainer,
} from 'recharts';
import { useApp } from '../context/AppContext';
import { useMockApi } from '../hooks/useMockApi';
import { DashboardSkeleton } from '../components/common/Skeleton';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import {
  formatCurrency, formatShortDate, computeMonthlyData, computeCategoryStats,
} from '../utils/helpers';

/* ── Helpers ──────────────────────────────────────────── */
function pctChange(curr: number, prev: number) {
  if (prev === 0) return null;
  return ((curr - prev) / Math.abs(prev)) * 100;
}

/* ── Sparkline ────────────────────────────────────────── */
function Sparkline({
  data,
  color,
  positive,
}: { data: number[]; color: string; positive?: boolean }) {
  const chartData = data.map((v, i) => ({ i, v }));
  const safeId = `spark-${color.replace('#', '')}`;
  const fillColor = positive !== false ? '#10b981' : '#f43f5e';
  return (
    <ResponsiveContainer width="100%" height={40}>
      <AreaChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={safeId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={fillColor} stopOpacity={0.3} />
            <stop offset="95%" stopColor={fillColor} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={1.5}
          fill={`url(#${safeId})`}
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/* ── KPI Card ─────────────────────────────────────────── */
interface KpiCardProps {
  label: string;
  value: string;
  change?: number | null;
  changeLabel?: string;
  icon: React.ReactNode;
  iconBg: string;
  sparkData?: number[];
  sparkPositive?: boolean;
  sparkColor?: string;
  accent?: string;
}
function KpiCard({ label, value, change, changeLabel, icon, iconBg, sparkData, sparkPositive, sparkColor, accent }: KpiCardProps) {
  const isPos = change !== null && change !== undefined ? change >= 0 : null;
  return (
    <Card className="p-6 flex flex-col gap-5 overflow-hidden relative group hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300">
      {/* Top accent line */}
      {accent && <div className={`absolute top-0 left-0 right-0 h-1 ${accent} opacity-80 group-hover:opacity-100 transition-opacity`} />}

      <div className="flex items-start justify-between relative z-10">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">{label}</p>
          <p className="text-3xl font-black text-zinc-900 dark:text-white mt-2 tabular tracking-tight">{value}</p>
          {change !== null && change !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-bold ${
              isPos ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            }`}>
              {isPos ? <ArrowUpRight size={13} strokeWidth={2.5} /> : <ArrowDownRight size={13} strokeWidth={2.5} />}
              {Math.abs(change).toFixed(1)}%
              {changeLabel && <span className="text-zinc-400 dark:text-zinc-500 font-medium ml-1">{changeLabel}</span>}
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300 ${iconBg}`}>
          {icon}
        </div>
      </div>

      {sparkData && sparkData.length > 1 && (
        <div className="-mx-2 -mb-2 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
          <Sparkline data={sparkData} color={sparkColor ?? '#3b82f6'} positive={sparkPositive} />
        </div>
      )}
    </Card>
  );
}

/* ── Financial Health Arc ─────────────────────────────── */
function HealthArc({ score, grade, label }: { score: number; grade: string; label: string }) {
  const color =
    score >= 80 ? '#10b981' :
    score >= 60 ? '#8b5cf6' :
    score >= 40 ? '#f59e0b' : '#f43f5e';

  const r = 52;
  const circ = 2 * Math.PI * r;
  const dash = (Math.min(score, 100) / 100) * circ;

  const textColor =
    score >= 80 ? 'text-emerald-600 dark:text-emerald-400' :
    score >= 60 ? 'text-brand-600 dark:text-brand-400' :
    score >= 40 ? 'text-amber-500' : 'text-rose-500';

  return (
    <div className="flex items-center gap-6 group/health">
      <div className="relative w-[124px] h-[124px] flex-shrink-0 transition-transform duration-500 group-hover/health:scale-105">
        <svg className="w-full h-full -rotate-90 drop-shadow-sm" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={r} fill="none" strokeWidth="10" className="stroke-zinc-100 dark:stroke-navy-800" />
          <circle
            cx="60" cy="60" r={r} fill="none" strokeWidth="10"
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            stroke={color}
            style={{ transition: 'stroke-dasharray 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-black leading-none tracking-tight ${textColor}`}>{grade}</span>
          <span className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1 font-bold">{score}/100</span>
        </div>
      </div>
      <div>
        <p className="text-base font-black text-zinc-900 dark:text-white tracking-tight">Financial Health</p>
        <p className={`text-xs font-bold mt-0.5 px-2 py-0.5 rounded-full inline-block ${textColor.replace('text-', 'bg-').replace('dark:', '')}/10`}>{label}</p>
        <div className="mt-3 space-y-1.5">
          {[
            { label: 'Savings Rate',       w: 40 },
            { label: 'Budget Adherence',   w: 30 },
            { label: 'Spending Diversity', w: 30 },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-2">
              <div className="h-1 flex-1 bg-zinc-100 dark:bg-zinc-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${item.w}%`, backgroundColor: color }}
                />
              </div>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 w-28 leading-none">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Upcoming Bills Widget ────────────────────────────── */
function UpcomingBills() {
  const { bills, setPage } = useApp();
  const today = new Date();
  const todayDay = today.getDate();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

  const sorted = [...bills]
    .filter(b => b.isActive)
    .map(b => {
      const days = b.dueDay >= todayDay
        ? b.dueDay - todayDay
        : (daysInMonth - todayDay) + b.dueDay;
      return { ...b, daysUntil: days };
    })
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, 4);

  const monthlyTotal = bills.filter(b => b.isActive).reduce((s, b) => s + b.amount, 0);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Upcoming Bills</h3>
          <p className="text-xs text-zinc-400 mt-0.5">{formatCurrency(monthlyTotal)}/mo total</p>
        </div>
        <button onClick={() => setPage('bills')}
          className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 flex items-center gap-0.5 transition-colors">
          All <ArrowRight size={11} />
        </button>
      </div>

      <div className="space-y-2.5 flex-1">
        {sorted.map(bill => (
          <div key={bill.id} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-sm"
                 style={{ backgroundColor: bill.color + '20' }}>
              {bill.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">{bill.name}</p>
              <p className={`text-[10px] font-medium ${bill.daysUntil === 0 ? 'text-rose-500' : bill.daysUntil <= 2 ? 'text-amber-500' : 'text-zinc-400'}`}>
                {bill.daysUntil === 0 ? 'Due today' : `Due in ${bill.daysUntil}d`}
                {bill.isPaid && ' · Paid'}
              </p>
            </div>
            <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 tabular">${bill.amount}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Goals Progress Widget ────────────────────────────── */
function GoalsSummary() {
  const { goals, setPage } = useApp();
  if (goals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center py-4">
        <Target size={24} className="text-zinc-300 dark:text-zinc-600 mb-2" />
        <p className="text-xs text-zinc-400">No goals yet</p>
        <button onClick={() => setPage('goals')}
          className="mt-2 text-xs text-brand-600 dark:text-brand-400 font-medium hover:underline">
          Create a goal
        </button>
      </div>
    );
  }

  const top = goals.slice(0, 3);
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Savings Goals</h3>
        <button onClick={() => setPage('goals')}
          className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 flex items-center gap-0.5 transition-colors">
          All <ArrowRight size={11} />
        </button>
      </div>
      <div className="space-y-3">
        {top.map(g => {
          const pct = Math.min(100, g.targetAmount > 0 ? (g.savedAmount / g.targetAmount) * 100 : 0);
          const daysLeft = Math.max(0, Math.ceil((new Date(g.deadline).getTime() - Date.now()) / 86400000));
          return (
            <div key={g.id}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-sm">{g.icon}</span>
                  <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">{g.name}</span>
                </div>
                <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400 tabular ml-2">{pct.toFixed(0)}%</span>
              </div>
              <div className="h-1.5 bg-zinc-100 dark:bg-zinc-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, backgroundColor: g.color }}
                />
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[10px] text-zinc-400 tabular">{formatCurrency(g.savedAmount)} / {formatCurrency(g.targetAmount)}</span>
                <span className="text-[10px] text-zinc-400">{daysLeft}d left</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Budget Overview Bar ──────────────────────────────── */
function BudgetOverview() {
  const { budgets, transactions, setPage } = useApp();
  const currentMonth = new Date().toISOString().slice(0, 7);

  const monthSpend = useMemo(() => {
    const m: Record<string, number> = {};
    transactions
      .filter(t => t.type === 'expense' && t.date.startsWith(currentMonth))
      .forEach(t => { m[t.category] = (m[t.category] ?? 0) + t.amount; });
    return m;
  }, [transactions, currentMonth]);

  if (budgets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-24 text-center">
        <p className="text-xs text-zinc-400">No budgets configured</p>
        <button onClick={() => setPage('budgets')}
          className="mt-1.5 text-xs text-brand-600 dark:text-brand-400 font-medium hover:underline">
          Set up budgets
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {budgets.slice(0, 5).map(b => {
        const spent = monthSpend[b.category] ?? 0;
        const pct = Math.min(100, (spent / b.limit) * 100);
        const over = spent > b.limit;
        const warn = pct >= 75;
        const barColor = over ? 'bg-rose-500' : warn ? 'bg-amber-400' : 'bg-brand-500';
        return (
          <div key={b.category}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{b.category}</span>
              <div className="flex items-center gap-1.5">
                {over && <AlertTriangle size={11} className="text-rose-500" />}
                <span className={`text-xs font-semibold tabular ${over ? 'text-rose-500' : warn ? 'text-amber-500' : 'text-zinc-500 dark:text-zinc-400'}`}>
                  {formatCurrency(spent)} / {formatCurrency(b.limit)}
                </span>
              </div>
            </div>
            <div className="h-1.5 bg-zinc-100 dark:bg-zinc-700 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-700 ${barColor}`} style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Recent Transactions ──────────────────────────────── */
function RecentTransactions() {
  const { transactions, setPage } = useApp();
  const recent = useMemo(
    () => [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 7),
    [transactions]
  );

  const CATEGORY_ICONS: Record<string, string> = {
    'Food & Dining': '🍔', Housing: '🏠', Transportation: '🚗', Entertainment: '🎬',
    Healthcare: '🏥', Shopping: '🛍️', Utilities: '⚡', Travel: '✈️',
    Education: '📚', Subscriptions: '📱', Salary: '💼', Freelance: '💻',
    Investment: '📈', Bonus: '🎁', 'Other Income': '💰',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-bold text-zinc-900 dark:text-white">Recent Transactions</h2>
          <p className="text-xs text-zinc-400 mt-0.5">Last 7 entries</p>
        </div>
        <button
          onClick={() => setPage('transactions')}
          className="flex items-center gap-1 text-xs font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 transition-colors"
        >
          View all <ArrowRight size={12} />
        </button>
      </div>
      <div className="space-y-1">
        {recent.map((t, i) => (
          <div
            key={t.id}
            className="flex items-center gap-3 px-1 py-2.5 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-base ${
              t.type === 'income' ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-rose-50 dark:bg-rose-900/20'
            }`}>
              {CATEGORY_ICONS[t.category] ?? '💳'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate leading-tight">{t.description}</p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5 truncate">{t.merchant} · {formatShortDate(t.date)}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className={`text-sm font-bold tabular ${
                t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-800 dark:text-zinc-200'
              }`}>
                {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
              </p>
              <Badge label={t.category} variant="neutral" size="sm" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Quick Actions ────────────────────────────────────── */
function QuickActions() {
  const { setPage } = useApp();
  const ACTIONS = [
    { icon: <DollarSign size={16} />, label: 'Add Transaction', page: 'transactions' as const, cls: 'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 border-brand-200 dark:border-brand-800/40' },
    { icon: <CreditCard size={16} />, label: 'View Accounts',   page: 'accounts'     as const, cls: 'bg-zinc-50 dark:bg-navy-750 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-navy-700' },
    { icon: <Zap size={16} />,        label: 'Check Insights',  page: 'insights'     as const, cls: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/40' },
    { icon: <Target size={16} />,     label: 'Manage Goals',    page: 'goals'        as const, cls: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40' },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {ACTIONS.map(a => (
        <button key={a.page} onClick={() => setPage(a.page)}
          className={`flex items-center gap-3 px-5 py-4 rounded-2xl border font-bold text-xs transition-all hover:shadow-lg hover:-translate-y-1 active:scale-95 ${a.cls}`}>
          <div className="p-2 rounded-lg bg-white/50 dark:bg-black/10 shadow-inner-sm">
            {a.icon}
          </div>
          {a.label}
        </button>
      ))}
    </div>
  );
}

/* ── Budget + Transactions Row ─────────────────────────── */
function BudgetAndTransactions() {
  const { setPage } = useApp();
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
      <Card className="p-5 lg:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white">Budget Status</h2>
            <p className="text-xs text-zinc-400 mt-0.5">This month's spending</p>
          </div>
          <button onClick={() => setPage('budgets')}
            className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 flex items-center gap-0.5">
            Manage <ArrowRight size={11} />
          </button>
        </div>
        <BudgetOverview />
      </Card>
      <Card className="p-5 lg:col-span-3">
        <RecentTransactions />
      </Card>
    </div>
  );
}

/* ── Main Dashboard ───────────────────────────────────── */
export default function Dashboard() {
  const { transactions, budgets } = useApp();
  const { loading } = useMockApi(true, 600);

  const { kpis, healthScore } = useMemo(() => {
    const now = new Date();
    const thisMonth = now.toISOString().slice(0, 7);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 7);

    const thisMonthTxns = transactions.filter(t => t.date.startsWith(thisMonth));
    const lastMonthTxns = transactions.filter(t => t.date.startsWith(lastMonth));

    const income     = thisMonthTxns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expenses   = thisMonthTxns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const prevInc    = lastMonthTxns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const prevExp    = lastMonthTxns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const totalBal   = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
                     - transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;

    // Monthly data for sparklines
    const monthly = computeMonthlyData(transactions);
    const incSparkData  = monthly.map(m => m.income);
    const expSparkData  = monthly.map(m => m.expenses);
    const balSparkData  = monthly.map(m => m.balance);

    // Financial health
    const savingsScore = Math.min(savingsRate / 50, 1) * 40;
    let budgetScore = 30;
    if (budgets.length > 0) {
      const monthSpend: Record<string, number> = {};
      thisMonthTxns.filter(t => t.type === 'expense').forEach(t => {
        monthSpend[t.category] = (monthSpend[t.category] ?? 0) + t.amount;
      });
      const onTrack = budgets.filter(b => (monthSpend[b.category] ?? 0) <= b.limit).length;
      budgetScore = (onTrack / budgets.length) * 30;
    }
    const cats = computeCategoryStats(transactions);
    const topCatVal = cats[0]?.value ?? 0;
    const totalExp = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const diversityScore = totalExp > 0 ? Math.max(0, 1 - topCatVal / totalExp) * 30 : 30;
    const score = Math.round(savingsScore + budgetScore + diversityScore);
    const grade = score >= 80 ? 'A' : score >= 60 ? 'B' : score >= 40 ? 'C' : score >= 20 ? 'D' : 'F';
    const label = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Needs Work';

    return {
      kpis: {
        income, expenses, totalBal, savingsRate,
        incChange: pctChange(income, prevInc),
        expChange: pctChange(expenses, prevExp),
        incSparkData, expSparkData, balSparkData,
      },
      healthScore: { score, grade, label },
    };
  }, [transactions, budgets]);

  if (loading) return <DashboardSkeleton />;

  const greetingHour = new Date().getHours();
  const greeting = greetingHour < 12 ? 'Good morning' : greetingHour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Page greeting ───────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">{greeting} 👋</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium mt-1">
            Your financial overview for <span className="text-brand-600 dark:text-brand-400 font-bold">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-navy-800 border border-zinc-200 dark:border-navy-700 shadow-card">
          <Calendar size={13} className="text-zinc-400" />
          <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* ── KPI Cards ───────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Net Balance"
          value={formatCurrency(kpis.totalBal)}
          icon={<Wallet size={18} className="text-brand-600 dark:text-brand-400" />}
          iconBg="bg-brand-50 dark:bg-brand-900/30"
          sparkData={kpis.balSparkData}
          sparkColor="#3b82f6"
          sparkPositive={kpis.totalBal >= 0}
          accent="bg-gradient-to-r from-brand-500 to-sky-400"
        />
        <KpiCard
          label="Monthly Income"
          value={formatCurrency(kpis.income)}
          change={kpis.incChange}
          changeLabel="vs last month"
          icon={<ArrowUpRight size={18} className="text-emerald-600 dark:text-emerald-400" />}
          iconBg="bg-emerald-50 dark:bg-emerald-900/30"
          sparkData={kpis.incSparkData}
          sparkColor="#10b981"
          sparkPositive
          accent="bg-gradient-to-r from-emerald-500 to-teal-500"
        />
        <KpiCard
          label="Monthly Expenses"
          value={formatCurrency(kpis.expenses)}
          change={kpis.expChange !== null ? -kpis.expChange! : null}
          changeLabel="vs last month"
          icon={<ArrowDownRight size={18} className="text-rose-600 dark:text-rose-400" />}
          iconBg="bg-rose-50 dark:bg-rose-900/30"
          sparkData={kpis.expSparkData}
          sparkColor="#f43f5e"
          sparkPositive={false}
          accent="bg-gradient-to-r from-rose-500 to-pink-500"
        />
        <KpiCard
          label="Savings Rate"
          value={`${kpis.savingsRate.toFixed(1)}%`}
          icon={<Activity size={18} className="text-amber-600 dark:text-amber-400" />}
          iconBg="bg-amber-50 dark:bg-amber-900/30"
          accent="bg-gradient-to-r from-amber-400 to-orange-500"
        />
      </div>

      {/* ── Health + Bills + Goals ───────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 col-span-1">
          <HealthArc score={healthScore.score} grade={healthScore.grade} label={healthScore.label} />
          <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
            <ShieldCheck size={13} className="text-zinc-300 dark:text-zinc-600 flex-shrink-0" />
            <p className="text-[10px] text-zinc-400 leading-relaxed">
              Composite score from savings rate, budget adherence & spending diversity
            </p>
          </div>
        </Card>

        <Card className="p-5 col-span-1">
          <UpcomingBills />
        </Card>

        <Card className="p-5 col-span-1">
          <GoalsSummary />
        </Card>
      </div>

      {/* ── Quick Actions Row ───────────────────────── */}
      <QuickActions />

      {/* ── Budget Overview + Recent Transactions ───── */}
      <BudgetAndTransactions />
    </div>
  );
}

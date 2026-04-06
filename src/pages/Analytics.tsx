import { useMemo, useState } from 'react';
import {
  BarChart, Bar, AreaChart, Area, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, PieChart, Pie, Cell,
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, DollarSign, Activity, BarChart3 } from 'lucide-react';
import Card from '../components/common/Card';
import { useApp } from '../context/AppContext';
import { formatCurrency, computeMonthlyData, computeCategoryStats } from '../utils/helpers';

/* ── Custom tooltip ───────────────────────────────────── */
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-navy-800 border border-zinc-200 dark:border-navy-700
                    rounded-xl shadow-dropdown p-3 text-xs">
      <p className="font-semibold text-zinc-700 dark:text-zinc-300 mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 mt-1">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
          <span className="text-zinc-500 dark:text-zinc-400">{p.name}:</span>
          <span className="font-bold text-zinc-800 dark:text-zinc-200">{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Range selector ───────────────────────────────────── */
type Range = '3m' | '6m' | '12m' | 'all';
const RANGES: { value: Range; label: string }[] = [
  { value: '3m',  label: '3M' },
  { value: '6m',  label: '6M' },
  { value: '12m', label: '1Y' },
  { value: 'all', label: 'All' },
];

/* ── Stat card ────────────────────────────────────────── */
function StatCard({ label, value, sub, trend }: { label: string; value: string; sub?: string; trend?: 'up' | 'down' | 'flat' }) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-emerald-500' : trend === 'down' ? 'text-rose-500' : 'text-zinc-400';
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">{label}</p>
          <p className="text-xl font-bold text-zinc-900 dark:text-white mt-1 tabular">{value}</p>
          {sub && <p className="text-xs text-zinc-400 mt-0.5">{sub}</p>}
        </div>
        {trend && <TrendIcon size={16} className={trendColor} />}
      </div>
    </Card>
  );
}

/* ── Main Page ────────────────────────────────────────── */
export default function Analytics() {
  const { transactions } = useApp();
  const [range, setRange] = useState<Range>('6m');

  const { monthlyData, filteredMonthly, categoryData, stats } = useMemo(() => {
    const all = computeMonthlyData(transactions);
    const now  = new Date();

    const cutoff = range === 'all' ? null : (() => {
      const months = range === '3m' ? 3 : range === '6m' ? 6 : 12;
      const d = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);
      return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    })();

    const filtered = cutoff
      ? all.slice(all.findIndex(m => m.month === cutoff) >= 0 ? all.findIndex(m => m.month === cutoff) : 0)
      : all;

    // Category stats for pie chart
    const catStats = computeCategoryStats(transactions);

    // Summary stats
    const totalIncome   = filtered.reduce((s, m) => s + m.income,   0);
    const totalExpenses = filtered.reduce((s, m) => s + m.expenses, 0);
    const netSavings    = totalIncome - totalExpenses;
    const savingsRate   = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;
    const avgMonthlyInc = filtered.length > 0 ? totalIncome   / filtered.length : 0;
    const avgMonthlyExp = filtered.length > 0 ? totalExpenses / filtered.length : 0;

    // Month-over-month change
    const last   = filtered[filtered.length - 1];
    const second = filtered[filtered.length - 2];
    const momExpChange = last && second ? ((last.expenses - second.expenses) / (second.expenses || 1)) * 100 : 0;

    return {
      monthlyData: all,
      filteredMonthly: filtered,
      categoryData: catStats.slice(0, 8),
      stats: { totalIncome, totalExpenses, netSavings, savingsRate, avgMonthlyInc, avgMonthlyExp, momExpChange },
    };
  }, [transactions, range]);

  /* Category pie colors */
  const PIE_COLORS = ['#8b5cf6','#f43f5e','#10b981','#f59e0b','#3b82f6','#ec4899','#14b8a6','#84cc16'];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Range selector */}
      <div className="flex justify-end">
        <div className="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
          {RANGES.map(r => (
            <button key={r.value} onClick={() => setRange(r.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                range === r.value
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
              }`}>{r.label}</button>
          ))}
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Income"    value={formatCurrency(stats.totalIncome)}   trend="up"   sub={`Avg ${formatCurrency(stats.avgMonthlyInc)}/mo`} />
        <StatCard label="Total Expenses"  value={formatCurrency(stats.totalExpenses)} trend="down" sub={`Avg ${formatCurrency(stats.avgMonthlyExp)}/mo`} />
        <StatCard label="Net Savings"     value={formatCurrency(stats.netSavings)}    trend={stats.netSavings >= 0 ? 'up' : 'down'} />
        <StatCard label="Savings Rate"    value={`${stats.savingsRate.toFixed(1)}%`}  trend={stats.savingsRate >= 20 ? 'up' : 'flat'} sub="of total income" />
      </div>

      {/* Income vs Expenses bar chart */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white">Income vs Expenses</h2>
            <p className="text-xs text-zinc-400 mt-0.5">Monthly comparison</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 flex-shrink-0" /><span className="text-zinc-500">Income</span></div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-rose-500 flex-shrink-0" /><span className="text-zinc-500">Expenses</span></div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={filteredMonthly} margin={{ top: 0, right: 0, left: 0, bottom: 0 }} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-100 dark:stroke-zinc-700" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={55} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: 'transparent' }} />
            <Bar dataKey="income"   name="Income"   fill="#10b981" radius={[4,4,0,0]} />
            <Bar dataKey="expenses" name="Expenses" fill="#f43f5e" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Net worth trend + category breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Cumulative balance area */}
        <Card className="p-5 lg:col-span-3">
          <div className="mb-5">
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white">Cumulative Balance</h2>
            <p className="text-xs text-zinc-400 mt-0.5">Running net savings over time</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={filteredMonthly} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="balGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-100 dark:stroke-zinc-700" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={55} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="balance" name="Balance" stroke="#8b5cf6" strokeWidth={2} fill="url(#balGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Category breakdown pie */}
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4">
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white">Expense Categories</h2>
            <p className="text-xs text-zinc-400 mt-0.5">Top spending areas</p>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                   paddingAngle={3} dataKey="value">
                {categoryData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} strokeWidth={0} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-3 space-y-1.5">
            {categoryData.slice(0, 5).map((c, i) => (
              <div key={c.name} className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                <span className="text-xs text-zinc-600 dark:text-zinc-400 flex-1 truncate">{c.name}</span>
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 tabular">{formatCurrency(c.value)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Month-over-month line chart */}
      <Card className="p-5">
        <div className="mb-5">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-white">Spending Trend</h2>
          <p className="text-xs text-zinc-400 mt-0.5">Monthly expense trajectory</p>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={filteredMonthly} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-100 dark:stroke-zinc-700" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={55} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
            <Tooltip content={<ChartTooltip />} />
            <Line type="monotone" dataKey="expenses" name="Expenses" stroke="#f43f5e" strokeWidth={2} dot={{ fill: '#f43f5e', r: 3 }} />
            <Line type="monotone" dataKey="income"   name="Income"   stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Key ratios */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: 'Expense Ratio',
            value: stats.totalIncome > 0 ? `${((stats.totalExpenses / stats.totalIncome) * 100).toFixed(1)}%` : 'N/A',
            desc: 'Expenses as % of income. Target: <80%',
            good: stats.totalIncome > 0 && (stats.totalExpenses / stats.totalIncome) < 0.8,
            icon: <Activity size={16} />,
          },
          {
            label: 'Savings Rate',
            value: `${stats.savingsRate.toFixed(1)}%`,
            desc: 'Net savings as % of income. Target: >20%',
            good: stats.savingsRate >= 20,
            icon: <DollarSign size={16} />,
          },
          {
            label: 'MoM Expense Change',
            value: `${stats.momExpChange >= 0 ? '+' : ''}${stats.momExpChange.toFixed(1)}%`,
            desc: 'Last vs previous month expenses.',
            good: stats.momExpChange <= 0,
            icon: <BarChart3 size={16} />,
          },
        ].map(r => (
          <Card key={r.label} className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${r.good ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600'}`}>
                {r.icon}
              </div>
              <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{r.label}</p>
            </div>
            <p className={`text-2xl font-black tabular ${r.good ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'}`}>{r.value}</p>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{r.desc}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

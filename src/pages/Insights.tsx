import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { TrendingUp, TrendingDown, Award, AlertCircle, Sparkles, RefreshCw, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { computeMonthlyData, computeCategoryStats, formatCurrency } from '../utils/helpers';
import Card from '../components/common/Card';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-navy-800 border border-zinc-200 dark:border-navy-700 rounded-xl p-3 shadow-lg text-xs">
      <p className="font-semibold text-zinc-700 dark:text-zinc-300 mb-2">{label}</p>
      {payload.map((e: { color: string; name: string; value: number }) => (
        <div key={e.name} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: e.color }} />
          <span className="text-zinc-500 dark:text-zinc-400 capitalize">{e.name}:</span>
          <span className="font-medium text-zinc-900 dark:text-white">{formatCurrency(e.value)}</span>
        </div>
      ))}
    </div>
  );
}

export default function Insights() {
  const { transactions, theme } = useApp();

  const monthly = useMemo(() => computeMonthlyData(transactions), [transactions]);
  const categories = useMemo(() => computeCategoryStats(transactions), [transactions]);

  const gridColor = theme === 'dark' ? '#3f3f46' : '#f4f4f5';
  const axisColor = theme === 'dark' ? '#71717a' : '#a1a1aa';

  const topCategory = categories[0];
  const totalExpenses = categories.reduce((s, c) => s + c.value, 0);
  const totalIncome = useMemo(() => transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0), [transactions]);
  const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 100) : 0;

  const lastTwo = monthly.slice(-2);
  const monthOverMonth = lastTwo.length === 2
    ? {
        incomeChange: lastTwo[1].income - lastTwo[0].income,
        expenseChange: lastTwo[1].expenses - lastTwo[0].expenses,
        label: lastTwo[1].month,
        prev: lastTwo[0].month,
      }
    : null;

  const avgMonthlyExpense = monthly.length > 0
    ? Math.round(monthly.reduce((s, m) => s + m.expenses, 0) / monthly.length)
    : 0;

  const avgMonthlyIncome = monthly.length > 0
    ? Math.round(monthly.reduce((s, m) => s + m.income, 0) / monthly.length)
    : 0;

  // Cash flow forecast: average of last 3 full months
  const forecast = useMemo(() => {
    if (monthly.length < 2) return null;
    const recent = monthly.slice(-3);
    const avgIncome = Math.round(recent.reduce((s, m) => s + m.income, 0) / recent.length);
    const avgExpenses = Math.round(recent.reduce((s, m) => s + m.expenses, 0) / recent.length);
    const projected = avgIncome - avgExpenses;
    const trend = monthly.length >= 2
      ? monthly[monthly.length - 1].expenses - monthly[monthly.length - 2].expenses
      : 0;
    return { avgIncome, avgExpenses, projected, trend, months: recent.length };
  }, [monthly]);

  // Recurring transactions: merchants appearing in 3+ distinct months
  const recurring = useMemo(() => {
    const merchantMonths: Record<string, Set<string>> = {};
    const merchantTotal: Record<string, number> = {};
    const merchantCount: Record<string, number> = {};
    const merchantCategory: Record<string, string> = {};

    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        const m = t.date.slice(0, 7);
        if (!merchantMonths[t.merchant]) merchantMonths[t.merchant] = new Set();
        merchantMonths[t.merchant].add(m);
        merchantTotal[t.merchant] = (merchantTotal[t.merchant] ?? 0) + t.amount;
        merchantCount[t.merchant] = (merchantCount[t.merchant] ?? 0) + 1;
        merchantCategory[t.merchant] = t.category;
      });

    return Object.entries(merchantMonths)
      .filter(([, months]) => months.size >= 3)
      .map(([merchant, months]) => ({
        merchant,
        months: months.size,
        avgAmount: Math.round(merchantTotal[merchant] / merchantCount[merchant]),
        category: merchantCategory[merchant],
      }))
      .sort((a, b) => b.months - a.months);
  }, [transactions]);

  const observations = useMemo(() => {
    const obs: { icon: React.ReactNode; text: string; variant: 'positive' | 'negative' | 'neutral' }[] = [];

    if (savingsRate > 30) obs.push({ icon: <Award size={14} />, text: `Great savings rate of ${savingsRate}% — you're saving more than 30% of income.`, variant: 'positive' });
    else if (savingsRate < 10) obs.push({ icon: <AlertCircle size={14} />, text: `Low savings rate of ${savingsRate}%. Consider reducing discretionary spending.`, variant: 'negative' });

    if (topCategory) obs.push({ icon: <TrendingUp size={14} />, text: `"${topCategory.name}" is your highest spending category at ${formatCurrency(topCategory.value)}.`, variant: 'neutral' });

    if (monthOverMonth) {
      if (monthOverMonth.expenseChange > 0) {
        obs.push({ icon: <TrendingDown size={14} />, text: `Expenses increased by ${formatCurrency(monthOverMonth.expenseChange)} in ${monthOverMonth.label} vs ${monthOverMonth.prev}.`, variant: 'negative' });
      } else if (monthOverMonth.expenseChange < 0) {
        obs.push({ icon: <TrendingDown size={14} />, text: `Expenses decreased by ${formatCurrency(Math.abs(monthOverMonth.expenseChange))} in ${monthOverMonth.label} — good control!`, variant: 'positive' });
      }
    }

    obs.push({ icon: <Sparkles size={14} />, text: `Average monthly income: ${formatCurrency(avgMonthlyIncome)} | Average monthly spend: ${formatCurrency(avgMonthlyExpense)}.`, variant: 'neutral' });

    return obs;
  }, [savingsRate, topCategory, monthOverMonth, avgMonthlyExpense, avgMonthlyIncome]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Savings Rate', value: `${savingsRate}%`, sub: 'All time', color: savingsRate >= 20 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400' },
          { label: 'Top Category', value: topCategory?.name ?? '—', sub: topCategory ? formatCurrency(topCategory.value) : '', color: 'text-zinc-900 dark:text-white' },
          { label: 'Avg Monthly Income', value: formatCurrency(avgMonthlyIncome), sub: `over ${monthly.length} months`, color: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'Avg Monthly Spend', value: formatCurrency(avgMonthlyExpense), sub: `over ${monthly.length} months`, color: 'text-rose-600 dark:text-rose-400' },
        ].map((stat) => (
          <Card key={stat.label} className="p-4">
            <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wide mb-2">{stat.label}</p>
            <p className={`text-xl font-bold leading-tight ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">{stat.sub}</p>
          </Card>
        ))}
      </div>

      {/* Monthly comparison bar chart */}
      <Card className="p-5">
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">Monthly Comparison</h2>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">Income vs expenses month by month</p>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={monthly} margin={{ top: 4, right: 4, left: -10, bottom: 0 }} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: axisColor }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: axisColor }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} />
            <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
            <Bar dataKey="expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Category breakdown */}
        <Card className="p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">Category Breakdown</h2>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">Top spending categories</p>
          </div>
          <div className="space-y-3">
            {categories.slice(0, 8).map((cat) => {
              const pct = totalExpenses > 0 ? (cat.value / totalExpenses) * 100 : 0;
              return (
                <div key={cat.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                      {cat.name}
                      <span className="text-zinc-400">({cat.count})</span>
                    </span>
                    <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">{formatCurrency(cat.value)}</span>
                  </div>
                  <div className="h-1.5 bg-zinc-100 dark:bg-zinc-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: cat.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Smart observations */}
        <Card className="p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">Smart Observations</h2>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">Patterns detected from your data</p>
          </div>
          <div className="space-y-3">
            {observations.map((obs, i) => (
              <div
                key={i}
                className={`flex gap-3 p-3 rounded-xl text-sm ${
                  obs.variant === 'positive'
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
                    : obs.variant === 'negative'
                    ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300'
                    : 'bg-zinc-50 dark:bg-zinc-700/50 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                <span className="flex-shrink-0 mt-0.5">{obs.icon}</span>
                <span className="leading-relaxed">{obs.text}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Month over month delta */}
      {monthOverMonth && (
        <Card className="p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">Month-over-Month</h2>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">{monthOverMonth.prev} → {monthOverMonth.label}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-zinc-50 dark:bg-zinc-700/40 rounded-xl">
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-1">Income Change</p>
              <p className={`text-2xl font-bold ${monthOverMonth.incomeChange >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {monthOverMonth.incomeChange >= 0 ? '+' : ''}{formatCurrency(monthOverMonth.incomeChange)}
              </p>
            </div>
            <div className="text-center p-4 bg-zinc-50 dark:bg-zinc-700/40 rounded-xl">
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-1">Expense Change</p>
              <p className={`text-2xl font-bold ${monthOverMonth.expenseChange <= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {monthOverMonth.expenseChange >= 0 ? '+' : ''}{formatCurrency(monthOverMonth.expenseChange)}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Cash Flow Forecast */}
      {forecast && (
        <Card className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">Cash Flow Forecast</h2>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">Projected next month based on last {forecast.months}-month average</p>
            </div>
            <Zap size={15} className="text-amber-400 flex-shrink-0 mt-0.5" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-zinc-50 dark:bg-zinc-700/40 rounded-xl text-center">
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-1">Est. Income</p>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(forecast.avgIncome)}</p>
            </div>
            <div className="p-4 bg-zinc-50 dark:bg-zinc-700/40 rounded-xl text-center">
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-1">Est. Expenses</p>
              <p className="text-xl font-bold text-rose-600 dark:text-rose-400">{formatCurrency(forecast.avgExpenses)}</p>
            </div>
            <div className="p-4 bg-zinc-50 dark:bg-zinc-700/40 rounded-xl text-center">
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-1">Projected Net</p>
              <p className={`text-xl font-bold ${forecast.projected >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {forecast.projected >= 0 ? '+' : ''}{formatCurrency(forecast.projected)}
              </p>
            </div>
          </div>
          {forecast.trend !== 0 && (
            <div className={`mt-4 flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${forecast.trend > 0 ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400' : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'}`}>
              {forecast.trend > 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
              Expenses are trending {forecast.trend > 0 ? 'up' : 'down'} — last month changed by {forecast.trend > 0 ? '+' : ''}{formatCurrency(forecast.trend)} vs the month before.
            </div>
          )}
        </Card>
      )}

      {/* Recurring Transactions */}
      {recurring.length > 0 && (
        <Card className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">Recurring Transactions</h2>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">Merchants appearing consistently across months</p>
            </div>
            <RefreshCw size={14} className="text-zinc-300 dark:text-zinc-600 flex-shrink-0 mt-0.5" />
          </div>
          <div className="space-y-2">
            {recurring.map((r) => (
              <div key={r.merchant} className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-700/40 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center flex-shrink-0">
                    <RefreshCw size={12} className="text-zinc-500 dark:text-zinc-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{r.merchant}</p>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500">{r.category} · seen {r.months} months</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">~{formatCurrency(r.avgAmount)}/mo</p>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500">avg per transaction</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-navy-700">
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              Estimated monthly recurring spend: <span className="font-semibold text-zinc-700 dark:text-zinc-300">{formatCurrency(recurring.reduce((s, r) => s + r.avgAmount, 0))}</span>
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}

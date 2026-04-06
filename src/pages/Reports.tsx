import { useMemo, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { Download, Calendar } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { computeMonthlyData, computeCategoryStats, formatCurrency, exportToCSV, exportToJSON } from '../utils/helpers';
import Card from '../components/common/Card';
import { CATEGORY_COLORS } from '../data/mockData';

type Range = '3m' | '6m' | 'all';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-navy-800 border border-zinc-200 dark:border-navy-700 rounded-xl p-3 shadow-xl text-xs">
      <p className="font-semibold text-zinc-700 dark:text-zinc-200 mb-2">{label}</p>
      {payload.map((e: { color: string; name: string; value: number }) => (
        <div key={e.name} className="flex items-center gap-2 mb-0.5">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: e.color }} />
          <span className="text-zinc-500 dark:text-zinc-400 capitalize">{e.name}:</span>
          <span className="font-semibold text-zinc-900 dark:text-white">{formatCurrency(e.value)}</span>
        </div>
      ))}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function PieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

export default function Reports() {
  const { transactions, theme } = useApp();
  const [range, setRange] = useState<Range>('6m');
  const [exportMenu, setExportMenu] = useState(false);

  const monthly = useMemo(() => computeMonthlyData(transactions), [transactions]);
  const categories = useMemo(() => computeCategoryStats(transactions), [transactions]);

  const filteredMonthly = useMemo(() => {
    if (range === 'all') return monthly;
    const n = range === '3m' ? 3 : 6;
    return monthly.slice(-n);
  }, [monthly, range]);

  const filteredTxns = useMemo(() => {
    if (range === 'all') return transactions;
    const months = range === '3m' ? 3 : 6;
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - months);
    const cutoffStr = cutoff.toISOString().slice(0, 7);
    return transactions.filter((t) => t.date.slice(0, 7) >= cutoffStr);
  }, [transactions, range]);

  const gridColor = theme === 'dark' ? '#3f3f46' : '#f4f4f5';
  const axisColor = theme === 'dark' ? '#71717a' : '#a1a1aa';

  const totalIncome = filteredTxns.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpenses = filteredTxns.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;

  const pieData = categories
    .filter((c) => c.value > 0)
    .slice(0, 7)
    .map((c) => ({ name: c.name, value: c.value, color: CATEGORY_COLORS[c.name] ?? '#94a3b8' }));

  // Cumulative savings line
  const cumulativeData = useMemo(() => {
    let running = 0;
    return filteredMonthly.map((m) => {
      running += m.income - m.expenses;
      return { ...m, savings: running };
    });
  }, [filteredMonthly]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-end gap-2 flex-wrap">
          {/* Range selector */}
          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-navy-800 rounded-xl p-1">
            {(['3m', '6m', 'all'] as Range[]).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  range === r
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
              >
                <Calendar size={11} />
                {r === 'all' ? 'All time' : r === '3m' ? '3 months' : '6 months'}
              </button>
            ))}
          </div>

          {/* Export */}
          <div className="relative">
            <button
              onClick={() => setExportMenu(!exportMenu)}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium border border-zinc-200 dark:border-navy-700 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-navy-750 transition-all"
            >
              <Download size={14} /> Export
            </button>
            {exportMenu && (
              <div className="absolute right-0 top-full mt-1 z-10 bg-white dark:bg-navy-800 border border-zinc-200 dark:border-navy-700 rounded-xl shadow-xl overflow-hidden animate-fade-in min-w-[140px]">
                <button onClick={() => { exportToCSV(filteredTxns); setExportMenu(false); }} className="block w-full px-4 py-2.5 text-sm text-left text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700">Export CSV</button>
                <button onClick={() => { exportToJSON(filteredTxns); setExportMenu(false); }} className="block w-full px-4 py-2.5 text-sm text-left text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700">Export JSON</button>
              </div>
            )}
          </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Income', value: formatCurrency(totalIncome), color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Total Expenses', value: formatCurrency(totalExpenses), color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-900/20' },
          { label: 'Net Savings', value: formatCurrency(netSavings), color: netSavings >= 0 ? 'text-violet-600 dark:text-violet-400' : 'text-rose-600 dark:text-rose-400', bg: 'bg-violet-50 dark:bg-violet-900/20' },
          { label: 'Savings Rate', value: `${savingsRate}%`, color: savingsRate >= 20 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500 dark:text-amber-400', bg: 'bg-zinc-50 dark:bg-navy-800' },
        ].map((s) => (
          <Card key={s.label} className="p-4">
            <div className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${s.bg} ${s.color} mb-2`}>{s.label}</div>
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Cumulative savings area chart */}
      <Card className="p-5">
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">Cumulative Savings</h2>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">Running balance of income minus expenses over time</p>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={cumulativeData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: axisColor }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: axisColor }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip content={<ChartTooltip />} />
            <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} fill="url(#incomeGrad)" name="income" dot={false} />
            <Area type="monotone" dataKey="savings" stroke="#7c3aed" strokeWidth={2} fill="url(#savingsGrad)" name="savings" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Spending by category donut */}
        <Card className="p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">Spending by Category</h2>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">All-time breakdown (top 7)</p>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%" cy="50%"
                innerRadius={60} outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                labelLine={false}
                label={PieLabel}
              >
                {pieData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Monthly income vs expense table */}
        <Card className="p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">Monthly Summary Table</h2>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">Income, expenses, and net per month</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-navy-700">
                  <th className="pb-2 text-left text-zinc-400 dark:text-zinc-500 font-semibold uppercase tracking-wide">Month</th>
                  <th className="pb-2 text-right text-zinc-400 dark:text-zinc-500 font-semibold uppercase tracking-wide">Income</th>
                  <th className="pb-2 text-right text-zinc-400 dark:text-zinc-500 font-semibold uppercase tracking-wide">Expenses</th>
                  <th className="pb-2 text-right text-zinc-400 dark:text-zinc-500 font-semibold uppercase tracking-wide">Net</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50 dark:divide-zinc-700/50">
                {[...filteredMonthly].reverse().map((m) => {
                  const net = m.income - m.expenses;
                  return (
                    <tr key={m.month} className="hover:bg-zinc-50 dark:hover:bg-zinc-700/30 transition-colors">
                      <td className="py-2.5 text-zinc-600 dark:text-zinc-400 font-medium">{m.month}</td>
                      <td className="py-2.5 text-right text-emerald-600 dark:text-emerald-400 font-semibold tabular-nums">{formatCurrency(m.income)}</td>
                      <td className="py-2.5 text-right text-rose-600 dark:text-rose-400 font-semibold tabular-nums">{formatCurrency(m.expenses)}</td>
                      <td className={`py-2.5 text-right font-bold tabular-nums ${net >= 0 ? 'text-violet-600 dark:text-violet-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {net >= 0 ? '+' : ''}{formatCurrency(net)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

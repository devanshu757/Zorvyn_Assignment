import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { computeSummary } from '../../utils/helpers';
import { formatCurrency } from '../../utils/helpers';
import Card from '../common/Card';

export default function SummaryCards() {
  const { transactions } = useApp();

  const { stats, currentMonth } = useMemo(() => {
    const now = new Date();
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonth = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;

    const currentMonthTxns = transactions.filter((t) => t.date.startsWith(thisMonth));
    const prevMonthTxns = transactions.filter((t) => t.date.startsWith(prevMonth));

    // Fall back to latest month in data if current month has no data
    const allMonths = [...new Set(transactions.map((t) => t.date.slice(0, 7)))].sort();
    const latestMonth = allMonths[allMonths.length - 1] ?? thisMonth;
    const secondLatest = allMonths[allMonths.length - 2] ?? '';

    const activeTxns = currentMonthTxns.length > 0
      ? currentMonthTxns
      : transactions.filter((t) => t.date.startsWith(latestMonth));
    const prevTxns = prevMonthTxns.length > 0
      ? prevMonthTxns
      : transactions.filter((t) => t.date.startsWith(secondLatest));

    return {
      stats: computeSummary(activeTxns, prevTxns),
      currentMonth: latestMonth,
    };
  }, [transactions]);

  const allTimeBalance = useMemo(() => {
    return transactions.reduce((sum, t) => t.type === 'income' ? sum + t.amount : sum - t.amount, 0);
  }, [transactions]);

  const cards = [
    {
      label: 'Net Balance',
      value: formatCurrency(allTimeBalance),
      sub: 'All time',
      icon: <Wallet size={20} />,
      iconBg: 'bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400',
      trend: null,
    },
    {
      label: 'Income',
      value: formatCurrency(stats.totalIncome),
      sub: currentMonth,
      icon: <TrendingUp size={20} />,
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
      trend: stats.incomeChange,
      trendPositive: true,
    },
    {
      label: 'Expenses',
      value: formatCurrency(stats.totalExpenses),
      sub: currentMonth,
      icon: <TrendingDown size={20} />,
      iconBg: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400',
      trend: stats.expenseChange,
      trendPositive: false,
    },
    {
      label: 'Transactions',
      value: stats.transactionCount.toString(),
      sub: `${currentMonth} total`,
      icon: <ArrowUpRight size={20} />,
      iconBg: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
      trend: null,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.label} className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.iconBg}`}>
              {card.icon}
            </div>
            {card.trend !== null && (
              <span
                className={`flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded-full ${
                  card.trendPositive
                    ? card.trend >= 0
                      ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400'
                      : 'text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400'
                    : card.trend <= 0
                    ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400'
                    : 'text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400'
                }`}
              >
                {card.trend >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {Math.abs(card.trend)}%
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium uppercase tracking-wide mb-1">{card.label}</p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-white leading-tight">{card.value}</p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">{card.sub}</p>
        </Card>
      ))}
    </div>
  );
}

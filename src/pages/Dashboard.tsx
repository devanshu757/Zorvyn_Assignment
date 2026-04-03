import { useMemo } from 'react';
import { ArrowRight, TrendingUp } from 'lucide-react';
import SummaryCards from '../components/dashboard/SummaryCards';
import BalanceTrendChart from '../components/dashboard/BalanceTrendChart';
import SpendingBreakdownChart from '../components/dashboard/SpendingBreakdownChart';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatShortDate } from '../utils/helpers';

export default function Dashboard() {
  const { transactions, setPage } = useApp();

  const recentTxns = useMemo(() =>
    [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5),
    [transactions]
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Overview</h1>
        <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-0.5">Your financial summary at a glance</p>
      </div>

      <SummaryCards />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3">
          <BalanceTrendChart />
        </div>
        <div className="lg:col-span-2">
          <SpendingBreakdownChart />
        </div>
      </div>

      {/* Recent Transactions */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">Recent Transactions</h2>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">Last 5 entries</p>
          </div>
          <button
            onClick={() => setPage('transactions')}
            className="flex items-center gap-1 text-xs font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
          >
            View all <ArrowRight size={12} />
          </button>
        </div>
        <div className="space-y-3">
          {recentTxns.map((t) => (
            <div key={t.id} className="flex items-center gap-3 py-1">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                t.type === 'income'
                  ? 'bg-emerald-100 dark:bg-emerald-900/30'
                  : 'bg-rose-100 dark:bg-rose-900/30'
              }`}>
                <TrendingUp
                  size={14}
                  className={t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400 rotate-180'}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">{t.description}</p>
                <p className="text-xs text-zinc-400 dark:text-zinc-500">{t.merchant} · {formatShortDate(t.date)}</p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-semibold ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                </p>
                <Badge label={t.category} variant="neutral" size="sm" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

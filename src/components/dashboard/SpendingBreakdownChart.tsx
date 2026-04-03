import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useApp } from '../../context/AppContext';
import { computeCategoryStats, formatCurrency } from '../../utils/helpers';
import Card from '../common/Card';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-3 shadow-lg text-xs">
      <p className="font-semibold text-zinc-700 dark:text-zinc-300">{d.name}</p>
      <p className="text-zinc-500 dark:text-zinc-400 mt-1">{formatCurrency(d.value)} · {d.count} txns</p>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) {
  if (percent < 0.06) return null;
  const RADIAN = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight="600">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

export default function SpendingBreakdownChart() {
  const { transactions } = useApp();
  const categories = useMemo(() => computeCategoryStats(transactions), [transactions]);
  const top = categories.slice(0, 6);

  const total = top.reduce((s, c) => s + c.value, 0);

  return (
    <Card className="p-5">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">Spending Breakdown</h2>
        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">By category — all time</p>
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="w-full sm:w-48 h-48 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={top}
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                labelLine={false}
                label={<CustomLabel />}
              >
                {top.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 w-full space-y-2">
          {top.map((cat) => (
            <div key={cat.name} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
              <span className="text-xs text-zinc-600 dark:text-zinc-400 flex-1 truncate">{cat.name}</span>
              <span className="text-xs font-semibold text-zinc-900 dark:text-white">{formatCurrency(cat.value)}</span>
              <span className="text-xs text-zinc-400 dark:text-zinc-500 w-8 text-right">
                {total > 0 ? `${Math.round((cat.value / total) * 100)}%` : '0%'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

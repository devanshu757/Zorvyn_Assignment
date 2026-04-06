import { useMemo, useState } from 'react';
import { PiggyBank, Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CATEGORIES, CATEGORY_COLORS } from '../data/mockData';
import { formatCurrency } from '../utils/helpers';
import Card from '../components/common/Card';

function BudgetBar({ spent, limit }: { spent: number; limit: number }) {
  const pct = Math.min((spent / limit) * 100, 100);
  const over = spent > limit;
  const warn = pct >= 75;

  const barColor = over
    ? 'bg-rose-500'
    : warn
    ? 'bg-amber-400'
    : 'bg-emerald-500';

  return (
    <div className="mt-2">
      <div className="h-2 bg-zinc-100 dark:bg-zinc-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex items-center justify-between mt-1.5">
        <span className={`text-xs font-medium ${over ? 'text-rose-600 dark:text-rose-400' : warn ? 'text-amber-600 dark:text-amber-400' : 'text-zinc-500 dark:text-zinc-400'}`}>
          {over ? `Over by ${formatCurrency(spent - limit)}` : `${formatCurrency(limit - spent)} remaining`}
        </span>
        <span className="text-xs text-zinc-400 dark:text-zinc-500">{Math.round(pct)}%</span>
      </div>
    </div>
  );
}

function InlineEdit({
  value,
  onSave,
  onCancel,
}: {
  value: number;
  onSave: (v: number) => void;
  onCancel: () => void;
}) {
  const [raw, setRaw] = useState(String(value || ''));

  function handleSave() {
    const n = parseFloat(raw);
    if (!isNaN(n) && n > 0) onSave(n);
  }

  return (
    <div className="flex items-center gap-1 mt-1">
      <span className="text-sm text-zinc-400">$</span>
      <input
        type="number"
        min={1}
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') onCancel(); }}
        autoFocus
        className="w-28 px-2 py-1 text-sm border border-brand-400 dark:border-brand-500 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-400"
      />
      <button onClick={handleSave} className="p-1 rounded text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors">
        <Check size={14} />
      </button>
      <button onClick={onCancel} className="p-1 rounded text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors">
        <X size={14} />
      </button>
    </div>
  );
}

export default function Budgets() {
  const { transactions, budgets, setBudget, removeBudget, role } = useApp();
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  // Current month spending per category
  const currentMonth = new Date().toISOString().slice(0, 7);
  const thisMonthSpend = useMemo(() => {
    const map: Record<string, number> = {};
    transactions
      .filter((t) => t.type === 'expense' && t.date.startsWith(currentMonth))
      .forEach((t) => {
        map[t.category] = (map[t.category] ?? 0) + t.amount;
      });
    return map;
  }, [transactions, currentMonth]);

  // All budgeted categories + any with spending this month that don't have a budget
  const budgetedCategories = new Set(budgets.map((b) => b.category));

  const unbudgetedWithSpend = Object.keys(thisMonthSpend).filter(
    (cat) => !budgetedCategories.has(cat)
  );

  const availableToAdd = CATEGORIES.expense.filter((c) => !budgetedCategories.has(c));

  const totalBudgeted = budgets.reduce((s, b) => s + b.limit, 0);
  const totalSpent = budgets.reduce((s, b) => s + (thisMonthSpend[b.category] ?? 0), 0);
  const overBudgetCount = budgets.filter((b) => (thisMonthSpend[b.category] ?? 0) > b.limit).length;

  const monthLabel = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500">Monthly limits · {monthLabel}</p>
        {role === 'admin' && availableToAdd.length > 0 && (
          <button
            onClick={() => { setAdding(true); setNewCategory(availableToAdd[0]); }}
            className="btn-primary"
          >
            <Plus size={14} /> Add Budget
          </button>
        )}
      </div>

      {/* Summary row */}
      {budgets.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Budgeted', value: formatCurrency(totalBudgeted), color: 'text-zinc-900 dark:text-white' },
            { label: 'Spent This Month', value: formatCurrency(totalSpent), color: totalSpent > totalBudgeted ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400' },
            { label: 'Over Budget', value: `${overBudgetCount} ${overBudgetCount === 1 ? 'category' : 'categories'}`, color: overBudgetCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400' },
          ].map((s) => (
            <Card key={s.label} className="p-4">
              <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wide mb-1">{s.label}</p>
              <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
            </Card>
          ))}
        </div>
      )}

      {/* Add new budget form */}
      {adding && role === 'admin' && (
        <Card className="p-4">
          <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-3">New Budget</p>
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-400"
              >
                {availableToAdd.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">Monthly Limit</label>
              <div className="flex items-center gap-2">
                <InlineEdit
                  value={0}
                  onSave={(v) => { setBudget(newCategory, v); setAdding(false); }}
                  onCancel={() => setAdding(false)}
                />
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Budget cards */}
      {budgets.length === 0 && !adding ? (
        <Card className="p-10 flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center">
            <PiggyBank size={22} className="text-brand-600 dark:text-brand-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">No budgets set</p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
              {role === 'admin' ? 'Add monthly spending limits per category to track your goals.' : 'An admin needs to set budgets first.'}
            </p>
          </div>
          {role === 'admin' && availableToAdd.length > 0 && (
            <button
              onClick={() => { setAdding(true); setNewCategory(availableToAdd[0]); }}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-brand-600 hover:bg-brand-700 text-white rounded-lg transition-all"
            >
              <Plus size={14} /> Add Your First Budget
            </button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.map((b) => {
            const spent = thisMonthSpend[b.category] ?? 0;
            const color = CATEGORY_COLORS[b.category] ?? '#94a3b8';
            const isEditing = editing === b.category;
            const over = spent > b.limit;

            return (
              <Card key={b.category} className={`p-4 ${over ? 'ring-1 ring-rose-300 dark:ring-rose-700' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                    <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{b.category}</p>
                    {over && (
                      <span className="text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 px-1.5 py-0.5 rounded-full">Over</span>
                    )}
                  </div>
                  {role === 'admin' && !isEditing && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditing(b.category)}
                        className="p-1 rounded text-zinc-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-all"
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        onClick={() => removeBudget(b.category)}
                        className="p-1 rounded text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-3">
                  <div className="flex items-baseline gap-1">
                    <span className={`text-xl font-bold ${over ? 'text-rose-600 dark:text-rose-400' : 'text-zinc-900 dark:text-white'}`}>
                      {formatCurrency(spent)}
                    </span>
                    <span className="text-sm text-zinc-400 dark:text-zinc-500">
                      / {isEditing ? '' : formatCurrency(b.limit)}
                    </span>
                  </div>

                  {isEditing ? (
                    <InlineEdit
                      value={b.limit}
                      onSave={(v) => { setBudget(b.category, v); setEditing(null); }}
                      onCancel={() => setEditing(null)}
                    />
                  ) : (
                    <BudgetBar spent={spent} limit={b.limit} />
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Categories spending this month without a budget */}
      {unbudgetedWithSpend.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wide mb-3">Untracked Spending This Month</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {unbudgetedWithSpend.map((cat) => {
              const color = CATEGORY_COLORS[cat] ?? '#94a3b8';
              return (
                <div key={cat} className="flex items-center justify-between px-4 py-3 rounded-xl border border-dashed border-zinc-200 dark:border-navy-700">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">{cat}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{formatCurrency(thisMonthSpend[cat])}</span>
                    {role === 'admin' && budgetedCategories.size < CATEGORIES.expense.length && (
                      <button
                        onClick={() => { setNewCategory(cat); setAdding(true); }}
                        className="p-1 rounded text-zinc-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                        title="Set budget"
                      >
                        <Plus size={13} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

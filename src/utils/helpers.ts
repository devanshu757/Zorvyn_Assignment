import { Transaction, MonthlyData, CategoryStat, SummaryStats, FilterState, SortState } from '../types';
import { CATEGORY_COLORS } from '../data/mockData';

let _activeCurrency = 'USD';
export function setActiveCurrency(c: string) { _activeCurrency = c; }

export function formatCurrency(amount: number, currency?: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency ?? _activeCurrency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatShortDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function getMonthLabel(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    year: '2-digit',
  });
}

export function generateId(): string {
  return `t${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export function computeMonthlyData(transactions: Transaction[]): MonthlyData[] {
  const monthMap: Record<string, { income: number; expenses: number }> = {};

  transactions.forEach((t) => {
    const key = t.date.slice(0, 7); // YYYY-MM
    if (!monthMap[key]) monthMap[key] = { income: 0, expenses: 0 };
    if (t.type === 'income') monthMap[key].income += t.amount;
    else monthMap[key].expenses += t.amount;
  });

  const sorted = Object.keys(monthMap).sort();
  let runningBalance = 0;

  return sorted.map((key) => {
    const { income, expenses } = monthMap[key];
    runningBalance += income - expenses;
    const [year, month] = key.split('-');
    const label = new Date(parseInt(year), parseInt(month) - 1, 1).toLocaleDateString('en-US', {
      month: 'short',
      year: '2-digit',
    });
    return { month: label, income, expenses, balance: runningBalance };
  });
}

export function computeCategoryStats(transactions: Transaction[]): CategoryStat[] {
  const expenses = transactions.filter((t) => t.type === 'expense');
  const map: Record<string, { value: number; count: number }> = {};

  expenses.forEach((t) => {
    if (!map[t.category]) map[t.category] = { value: 0, count: 0 };
    map[t.category].value += t.amount;
    map[t.category].count += 1;
  });

  return Object.entries(map)
    .map(([name, { value, count }]) => ({
      name,
      value,
      count,
      color: CATEGORY_COLORS[name] ?? '#94a3b8',
    }))
    .sort((a, b) => b.value - a.value);
}

export function computeSummary(transactions: Transaction[], prevMonthTxns: Transaction[]): SummaryStats {
  const income = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expenses = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  const prevIncome = prevMonthTxns.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const prevExpenses = prevMonthTxns.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  const incomeChange = prevIncome === 0 ? 0 : ((income - prevIncome) / prevIncome) * 100;
  const expenseChange = prevExpenses === 0 ? 0 : ((expenses - prevExpenses) / prevExpenses) * 100;

  return {
    totalBalance: income - expenses,
    totalIncome: income,
    totalExpenses: expenses,
    transactionCount: transactions.length,
    incomeChange: Math.round(incomeChange * 10) / 10,
    expenseChange: Math.round(expenseChange * 10) / 10,
  };
}

export function applyFilters(transactions: Transaction[], filters: FilterState): Transaction[] {
  return transactions.filter((t) => {
    if (filters.type !== 'all' && t.type !== filters.type) return false;
    if (filters.category && t.category !== filters.category) return false;
    if (filters.dateFrom && t.date < filters.dateFrom) return false;
    if (filters.dateTo && t.date > filters.dateTo) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const matches =
        t.description.toLowerCase().includes(q) ||
        t.merchant.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.amount.toString().includes(q);
      if (!matches) return false;
    }
    return true;
  });
}

export function applySort(transactions: Transaction[], sort: SortState): Transaction[] {
  return [...transactions].sort((a, b) => {
    let cmp = 0;
    if (sort.field === 'date') cmp = a.date.localeCompare(b.date);
    else if (sort.field === 'amount') cmp = a.amount - b.amount;
    else if (sort.field === 'category') cmp = a.category.localeCompare(b.category);
    else if (sort.field === 'description') cmp = a.description.localeCompare(b.description);
    return sort.direction === 'asc' ? cmp : -cmp;
  });
}

export function exportToCSV(transactions: Transaction[]): void {
  const headers = ['Date', 'Description', 'Merchant', 'Category', 'Type', 'Amount'];
  const rows = transactions.map((t) => [
    t.date,
    `"${t.description}"`,
    `"${t.merchant}"`,
    t.category,
    t.type,
    t.type === 'income' ? t.amount : -t.amount,
  ]);
  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `fintrack-export-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportToJSON(transactions: Transaction[]): void {
  const blob = new Blob([JSON.stringify(transactions, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `fintrack-export-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

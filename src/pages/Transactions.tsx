import { useMemo, useState } from 'react';
import {
  Plus, Download, ChevronUp, ChevronDown, ChevronsUpDown,
  Pencil, Trash2, ArrowLeftRight, Layers
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { applyFilters, applySort, formatCurrency, formatDate, exportToCSV, exportToJSON, getMonthLabel } from '../utils/helpers';
import { Transaction, SortField } from '../types';
import TransactionFilters from '../components/transactions/TransactionFilters';
import AddEditModal from '../components/transactions/AddEditModal';
import Badge from '../components/common/Badge';
import Card from '../components/common/Card';
import EmptyState from '../components/common/EmptyState';
import { CATEGORY_COLORS } from '../data/mockData';
import Modal from '../components/common/Modal';
import { TableSkeleton } from '../components/common/Skeleton';
import { useMockApi } from '../hooks/useMockApi';

const PAGE_SIZE = 15;
type GroupBy = 'none' | 'month' | 'category';

function SortIcon({ field: _field, active, dir }: { field: SortField; active: boolean; dir: 'asc' | 'desc' }) {
  if (!active) return <ChevronsUpDown size={13} className="text-zinc-400" />;
  return dir === 'asc' ? <ChevronUp size={13} className="text-brand-500" /> : <ChevronDown size={13} className="text-brand-500" />;
}

function TxRow({ t, role, onEdit, onDelete }: { t: Transaction; role: string; onEdit: (t: Transaction) => void; onDelete: (id: string) => void }) {
  return (
    <tr className="hover:bg-zinc-50 dark:hover:bg-navy-700/30 transition-colors group">
      <td className="px-4 py-3 text-xs text-zinc-400 dark:text-zinc-500 whitespace-nowrap w-28">{formatDate(t.date)}</td>
      <td className="px-4 py-3 min-w-0">
        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">{t.description}</p>
        <p className="text-xs text-zinc-400 dark:text-zinc-500 truncate">{t.merchant}</p>
      </td>
      <td className="px-4 py-3 hidden sm:table-cell w-36">
        <span className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: CATEGORY_COLORS[t.category] ?? '#94a3b8' }} />
          {t.category}
        </span>
      </td>
      <td className="px-4 py-3 hidden md:table-cell w-24">
        <Badge label={t.type} variant={t.type} size="sm" />
      </td>
      <td className="px-4 py-3 text-right w-28">
        <span className={`text-sm font-semibold tabular-nums ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
          {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
        </span>
      </td>
      {role === 'admin' && (
        <td className="px-4 py-3 w-20">
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => onEdit(t)} className="p-1.5 rounded-lg text-zinc-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-all">
              <Pencil size={13} />
            </button>
            <button onClick={() => onDelete(t.id)} className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all">
              <Trash2 size={13} />
            </button>
          </div>
        </td>
      )}
    </tr>
  );
}

export default function Transactions() {
  const { transactions, filters, sort, setSort, role, deleteTransaction } = useApp();
  const { loading } = useMockApi(true, 400);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTx, setEditTx] = useState<Transaction | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [exportMenu, setExportMenu] = useState(false);
  const [groupBy, setGroupBy] = useState<GroupBy>('month');

  const filtered = useMemo(() => applyFilters(transactions, filters), [transactions, filters]);
  const sorted = useMemo(() => applySort(filtered, sort), [filtered, sort]);

  // Grouping logic
  const groups = useMemo(() => {
    if (groupBy === 'none') return [{ key: '', label: '', items: sorted }];
    const map = new Map<string, Transaction[]>();
    sorted.forEach((t) => {
      const key = groupBy === 'month' ? t.date.slice(0, 7) : t.category;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    });
    return Array.from(map.entries()).map(([key, items]) => ({
      key,
      label: groupBy === 'month' ? getMonthLabel(key + '-01') : key,
      items,
    }));
  }, [sorted, groupBy]);

  const paginated = useMemo(() => sorted.slice(0, page * PAGE_SIZE), [sorted, page]);
  const hasMore = paginated.length < sorted.length && groupBy === 'none';

  function toggleSort(field: SortField) {
    if (sort.field === field) {
      setSort({ field, direction: sort.direction === 'asc' ? 'desc' : 'asc' });
    } else {
      setSort({ field, direction: 'desc' });
    }
  }

  function openAdd() { setEditTx(null); setModalOpen(true); }
  function openEdit(t: Transaction) { setEditTx(t); setModalOpen(true); }
  function confirmDelete(id: string) { setDeleteId(id); }
  function handleDelete() { if (deleteId) { deleteTransaction(deleteId); setDeleteId(null); } }

  const columns: { label: string; field?: SortField; className: string }[] = [
    { label: 'Date', field: 'date', className: 'w-28' },
    { label: 'Description', field: 'description', className: 'min-w-0 flex-1' },
    { label: 'Category', field: 'category', className: 'w-36 hidden sm:table-cell' },
    { label: 'Type', className: 'w-24 hidden md:table-cell' },
    { label: 'Amount', field: 'amount', className: 'w-28 text-right' },
    ...(role === 'admin' ? [{ label: '', className: 'w-20' }] : []),
  ];

  if (loading) return (
    <div className="space-y-5 animate-fade-in">
      <div className="h-8 bg-zinc-200 dark:bg-zinc-700 rounded-xl w-40 animate-pulse" />
      <Card><TableSkeleton /></Card>
    </div>
  );

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500">
          {filtered.length} of {transactions.length} records
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Group by */}
          <div className="flex items-center gap-1.5 px-3 py-2 text-sm border border-zinc-200 dark:border-navy-700 rounded-xl text-zinc-600 dark:text-zinc-300 bg-white dark:bg-navy-800">
            <Layers size={14} />
            <select
              value={groupBy}
              onChange={(e) => { setGroupBy(e.target.value as GroupBy); setPage(1); }}
              className="bg-transparent text-sm text-zinc-600 dark:text-zinc-400 focus:outline-none cursor-pointer"
            >
              <option value="none">No grouping</option>
              <option value="month">Group by month</option>
              <option value="category">Group by category</option>
            </select>
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
              <div className="absolute right-0 top-full mt-1 z-10 bg-white dark:bg-navy-800 border border-zinc-200 dark:border-navy-700 rounded-xl shadow-xl overflow-hidden animate-fade-in">
                <button
                  onClick={() => { exportToCSV(sorted); setExportMenu(false); }}
                  className="block w-full px-4 py-2.5 text-sm text-left text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-navy-700"
                >
                  Export as CSV
                </button>
                <button
                  onClick={() => { exportToJSON(sorted); setExportMenu(false); }}
                  className="block w-full px-4 py-2.5 text-sm text-left text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-navy-700"
                >
                  Export as JSON
                </button>
              </div>
            )}
          </div>

          {/* Add button (admin only) */}
          {role === 'admin' && (
            <button
              onClick={openAdd}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-brand-600 hover:bg-brand-700 text-white rounded-xl transition-all shadow-sm shadow-brand-300/40 dark:shadow-brand-900/30"
            >
              <Plus size={14} /> Add Transaction
            </button>
          )}
        </div>
      </div>

      <Card className="p-4">
        <TransactionFilters />
      </Card>

      {sorted.length === 0 ? (
        <Card>
          <EmptyState
            icon={<ArrowLeftRight size={24} />}
            title="No transactions found"
            description="Try adjusting your filters or add a new transaction."
            action={
              role === 'admin' ? (
                <button
                  onClick={openAdd}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-all"
                >
                  <Plus size={14} /> Add Transaction
                </button>
              ) : undefined
            }
          />
        </Card>
      ) : groupBy === 'none' ? (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-navy-700">
                  {columns.map((col) => (
                    <th
                      key={col.label}
                      className={`px-4 py-3 text-left text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wide ${col.className} ${col.field ? 'cursor-pointer hover:text-zinc-600 dark:hover:text-zinc-300 select-none' : ''}`}
                      onClick={() => col.field && toggleSort(col.field)}
                    >
                      <span className="flex items-center gap-1">
                        {col.label}
                        {col.field && <SortIcon field={col.field} active={sort.field === col.field} dir={sort.direction} />}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50 dark:divide-zinc-700/50">
                {paginated.map((t) => <TxRow key={t.id} t={t} role={role} onEdit={openEdit} onDelete={confirmDelete} />)}
              </tbody>
            </table>
          </div>
          {hasMore && (
            <div className="px-4 py-3 border-t border-zinc-100 dark:border-navy-700 text-center">
              <button
                onClick={() => setPage((p) => p + 1)}
                className="text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 font-medium transition-colors"
              >
                Load more ({sorted.length - paginated.length} remaining)
              </button>
            </div>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {groups.map((group) => {
            const groupIncome = group.items.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
            const groupExpense = group.items.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
            return (
              <Card key={group.key} className="overflow-hidden">
                {/* Group header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-navy-700 bg-zinc-50/60 dark:bg-navy-800/40">
                  <div className="flex items-center gap-2">
                    {groupBy === 'category' && (
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[group.key] ?? '#94a3b8' }} />
                    )}
                    <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{group.label}</p>
                    <span className="text-xs text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-700 px-2 py-0.5 rounded-full">{group.items.length}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    {groupIncome > 0 && <span className="text-emerald-600 dark:text-emerald-400 font-semibold tabular-nums">+{formatCurrency(groupIncome)}</span>}
                    {groupExpense > 0 && <span className="text-rose-600 dark:text-rose-400 font-semibold tabular-nums">-{formatCurrency(groupExpense)}</span>}
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <tbody className="divide-y divide-zinc-50 dark:divide-zinc-700/50">
                      {group.items.map((t) => <TxRow key={t.id} t={t} role={role} onEdit={openEdit} onDelete={confirmDelete} />)}
                    </tbody>
                  </table>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <AddEditModal open={modalOpen} onClose={() => setModalOpen(false)} editTransaction={editTx} />

      {/* Delete confirmation */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Transaction" maxWidth="max-w-sm">
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-5">
          Are you sure you want to delete this transaction? This action cannot be undone.
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setDeleteId(null)}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium border border-zinc-200 dark:border-zinc-600 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-navy-700 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-rose-600 hover:bg-rose-700 text-white transition-all"
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}

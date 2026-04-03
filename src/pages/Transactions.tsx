import { useMemo, useState } from 'react';
import {
  Plus, Download, ChevronUp, ChevronDown, ChevronsUpDown,
  Pencil, Trash2, ArrowLeftRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { applyFilters, applySort, formatCurrency, formatDate, exportToCSV, exportToJSON } from '../utils/helpers';
import { Transaction, SortField } from '../types';
import TransactionFilters from '../components/transactions/TransactionFilters';
import AddEditModal from '../components/transactions/AddEditModal';
import Badge from '../components/common/Badge';
import Card from '../components/common/Card';
import EmptyState from '../components/common/EmptyState';
import { CATEGORY_COLORS } from '../data/mockData';
import Modal from '../components/common/Modal';

const PAGE_SIZE = 12;

function SortIcon({ field: _field, active, dir }: { field: SortField; active: boolean; dir: 'asc' | 'desc' }) {
  if (!active) return <ChevronsUpDown size={13} className="text-zinc-400" />;
  return dir === 'asc' ? <ChevronUp size={13} className="text-brand-500" /> : <ChevronDown size={13} className="text-brand-500" />;
}

export default function Transactions() {
  const { transactions, filters, sort, setSort, role, deleteTransaction } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [editTx, setEditTx] = useState<Transaction | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [exportMenu, setExportMenu] = useState(false);

  const filtered = useMemo(() => applyFilters(transactions, filters), [transactions, filters]);
  const sorted = useMemo(() => applySort(filtered, sort), [filtered, sort]);
  const paginated = useMemo(() => sorted.slice(0, page * PAGE_SIZE), [sorted, page]);
  const hasMore = paginated.length < sorted.length;

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

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Transactions</h1>
          <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-0.5">
            {filtered.length} of {transactions.length} records
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Export */}
          <div className="relative">
            <button
              onClick={() => setExportMenu(!exportMenu)}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all"
            >
              <Download size={14} /> Export
            </button>
            {exportMenu && (
              <div className="absolute right-0 top-full mt-1 z-10 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg overflow-hidden animate-fade-in">
                <button
                  onClick={() => { exportToCSV(sorted); setExportMenu(false); }}
                  className="block w-full px-4 py-2.5 text-sm text-left text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700"
                >
                  Export as CSV
                </button>
                <button
                  onClick={() => { exportToJSON(sorted); setExportMenu(false); }}
                  className="block w-full px-4 py-2.5 text-sm text-left text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700"
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
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-brand-600 hover:bg-brand-700 text-white rounded-lg transition-all"
            >
              <Plus size={14} /> Add Transaction
            </button>
          )}
        </div>
      </div>

      <Card className="p-4">
        <TransactionFilters />
      </Card>

      <Card className="overflow-hidden">
        {sorted.length === 0 ? (
          <EmptyState
            icon={<ArrowLeftRight size={24} />}
            title="No transactions found"
            description="Try adjusting your filters or add a new transaction."
            action={
              role === 'admin' ? (
                <button
                  onClick={openAdd}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-all"
                >
                  <Plus size={14} /> Add Transaction
                </button>
              ) : undefined
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-100 dark:border-zinc-700">
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
                  {paginated.map((t) => (
                    <tr
                      key={t.id}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-700/30 transition-colors group"
                    >
                      <td className="px-4 py-3 text-xs text-zinc-400 dark:text-zinc-500 whitespace-nowrap">
                        {formatDate(t.date)}
                      </td>
                      <td className="px-4 py-3 min-w-0">
                        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">{t.description}</p>
                        <p className="text-xs text-zinc-400 dark:text-zinc-500 truncate">{t.merchant}</p>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: CATEGORY_COLORS[t.category] ?? '#94a3b8' }} />
                          {t.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <Badge label={t.type} variant={t.type} size="sm" />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`text-sm font-semibold tabular-nums ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                          {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                        </span>
                      </td>
                      {role === 'admin' && (
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => openEdit(t)}
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-all"
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              onClick={() => confirmDelete(t.id)}
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {hasMore && (
              <div className="px-4 py-3 border-t border-zinc-100 dark:border-zinc-700 text-center">
                <button
                  onClick={() => setPage((p) => p + 1)}
                  className="text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 font-medium transition-colors"
                >
                  Load more ({sorted.length - paginated.length} remaining)
                </button>
              </div>
            )}
          </>
        )}
      </Card>

      <AddEditModal open={modalOpen} onClose={() => setModalOpen(false)} editTransaction={editTx} />

      {/* Delete confirmation */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Transaction" maxWidth="max-w-sm">
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-5">
          Are you sure you want to delete this transaction? This action cannot be undone.
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setDeleteId(null)}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium border border-zinc-200 dark:border-zinc-600 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all"
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

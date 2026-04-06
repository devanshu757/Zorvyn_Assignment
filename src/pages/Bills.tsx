import { useState, useMemo } from 'react';
import { Plus, Check, X, Calendar, DollarSign, AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';
import Card from '../components/common/Card';
import Modal from '../components/common/Modal';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { formatCurrency } from '../utils/helpers';
import { Bill } from '../types';

/* ── Helpers ──────────────────────────────────────────── */
function getDaysUntil(dueDay: number) {
  const today   = new Date();
  const todayDay    = today.getDate();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  if (dueDay >= todayDay) return dueDay - todayDay;
  return (daysInMonth - todayDay) + dueDay;
}

function urgencyStyle(days: number, isPaid?: boolean) {
  if (isPaid) return 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400';
  if (days === 0) return 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400';
  if (days <= 3)  return 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400';
  return 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400';
}

function dueLabel(days: number, isPaid?: boolean) {
  if (isPaid)   return 'Paid ✓';
  if (days === 0) return 'Due today';
  if (days === 1) return 'Due tomorrow';
  return `Due in ${days} days`;
}

const BILL_CATEGORIES = ['Housing', 'Utilities', 'Subscriptions', 'Healthcare', 'Transportation', 'Food & Dining', 'Other'];

/* ── Add/Edit Modal ───────────────────────────────────── */
function BillModal({ bill, onClose, onSave }: {
  bill?: Partial<Bill>;
  onClose: () => void;
  onSave: (b: Omit<Bill, 'id'>) => void;
}) {
  const [name,     setName]     = useState(bill?.name     ?? '');
  const [amount,   setAmount]   = useState(String(bill?.amount ?? ''));
  const [dueDay,   setDueDay]   = useState(String(bill?.dueDay ?? '1'));
  const [category, setCategory] = useState(bill?.category ?? 'Utilities');
  const [icon,     setIcon]     = useState(bill?.icon     ?? '📄');
  const [color,    setColor]    = useState(bill?.color    ?? '#6366f1');

  const ICONS = ['📄','🏠','⚡','💧','📡','🎬','🎵','💪','🏥','🚇','📱','🛒','🎮','✈️','💼'];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !amount) return;
    onSave({ name: name.trim(), amount: parseFloat(amount), dueDay: parseInt(dueDay), category, icon, color, isActive: true, isPaid: false });
  }

  return (
    <Modal open={true} onClose={onClose} title={bill?.id ? 'Edit Bill' : 'Add Bill'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label-sm">Bill Name</label>
          <input className="input-base" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Netflix" required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label-sm">Amount ($)</label>
            <input className="input-base" type="number" min="0.01" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" required />
          </div>
          <div>
            <label className="label-sm">Due Day (1–31)</label>
            <input className="input-base" type="number" min="1" max="31" value={dueDay} onChange={e => setDueDay(e.target.value)} required />
          </div>
        </div>
        <div>
          <label className="label-sm">Category</label>
          <select className="input-base" value={category} onChange={e => setCategory(e.target.value)}>
            {BILL_CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="label-sm">Icon</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {ICONS.map(ic => (
              <button key={ic} type="button" onClick={() => setIcon(ic)}
                className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all ${icon === ic ? 'bg-brand-100 dark:bg-brand-900/40 ring-2 ring-brand-500' : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700'}`}>
                {ic}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="label-sm">Color</label>
          <input type="color" value={color} onChange={e => setColor(e.target.value)}
            className="h-10 w-full rounded-xl border border-zinc-200 dark:border-zinc-600 cursor-pointer bg-white dark:bg-zinc-800 p-1" />
        </div>
        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" className="btn-primary flex-1">
            {bill?.id ? 'Save Changes' : 'Add Bill'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ── Bill Row ─────────────────────────────────────────── */
function BillRow({ bill, role }: { bill: Bill; role: string }) {
  const { toggleBillPaid, removeBill } = useApp();
  const toast = useToast();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const days = getDaysUntil(bill.dueDay);

  return (
    <div className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all hover:bg-zinc-50/80 dark:hover:bg-zinc-800/50 group
                     ${!bill.isActive ? 'opacity-50' : ''}`}>
      {/* Icon */}
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
           style={{ backgroundColor: bill.color + '20' }}>
        {bill.icon}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 truncate">{bill.name}</p>
          {!bill.isActive && <span className="badge bg-zinc-100 dark:bg-zinc-800 text-zinc-400 text-[10px]">Inactive</span>}
        </div>
        <p className="text-xs text-zinc-400 mt-0.5">
          {bill.category} · Due on the {bill.dueDay}{['st','nd','rd'][((bill.dueDay + 90) % 100 - 10) % 10 > 2 ? 3 : ((bill.dueDay + 90) % 100 - 10) % 10] ?? 'th'}
        </p>
      </div>

      {/* Due badge */}
      <span className={`badge text-xs font-semibold px-2.5 py-1 rounded-full hidden sm:flex ${urgencyStyle(days, bill.isPaid)}`}>
        {dueLabel(days, bill.isPaid)}
      </span>

      {/* Amount */}
      <p className="text-sm font-bold text-zinc-900 dark:text-white tabular w-20 text-right">
        {formatCurrency(bill.amount)}
      </p>

      {/* Actions */}
      {role === 'admin' && (
        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {!bill.isPaid ? (
            <button onClick={() => { toggleBillPaid(bill.id); toast.success(`${bill.name} marked as paid`); }}
              className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 hover:bg-emerald-100 transition-colors"
              title="Mark as paid">
              <Check size={13} />
            </button>
          ) : (
            <button onClick={() => { toggleBillPaid(bill.id); toast.info(`${bill.name} marked as unpaid`); }}
              className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:bg-zinc-200 transition-colors"
              title="Mark as unpaid">
              <X size={13} />
            </button>
          )}
          {confirmDelete ? (
            <div className="flex items-center gap-1">
              <button onClick={() => { removeBill(bill.id); toast.success(`${bill.name} removed`); }}
                className="px-2 py-1 rounded-lg bg-rose-500 text-white text-xs font-semibold">Yes</button>
              <button onClick={() => setConfirmDelete(false)}
                className="px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-xs">No</button>
            </div>
          ) : (
            <button onClick={() => setConfirmDelete(true)}
              className="p-1.5 rounded-lg text-zinc-300 dark:text-zinc-600 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all">
              <Trash2 size={13} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Main Page ────────────────────────────────────────── */
export default function Bills() {
  const { bills, role, addBill } = useApp();
  const toast = useToast();
  const [showModal, setShowModal] = useState(false);
  const [filter,    setFilter]    = useState<'all' | 'upcoming' | 'paid' | 'inactive'>('all');

  const filtered = useMemo(() => {
    return bills.filter(b => {
      if (filter === 'upcoming') return b.isActive && !b.isPaid;
      if (filter === 'paid')     return b.isPaid;
      if (filter === 'inactive') return !b.isActive;
      return true;
    });
  }, [bills, filter]);

  /* Monthly summary */
  const monthlyTotal  = bills.filter(b => b.isActive).reduce((s, b) => s + b.amount, 0);
  const paidTotal     = bills.filter(b => b.isPaid).reduce((s, b) => s + b.amount, 0);
  const unpaidTotal   = bills.filter(b => b.isActive && !b.isPaid).reduce((s, b) => s + b.amount, 0);
  const dueSoonCount  = bills.filter(b => b.isActive && !b.isPaid && getDaysUntil(b.dueDay) <= 5).length;

  /* Sort by days until due */
  const sortedFiltered = [...filtered].sort((a, b) => getDaysUntil(a.dueDay) - getDaysUntil(b.dueDay));

  /* Group upcoming by urgency */
  const dueSoon  = sortedFiltered.filter(b => !b.isPaid && getDaysUntil(b.dueDay) <= 5 && b.isActive);
  const upcoming = sortedFiltered.filter(b => !b.isPaid && getDaysUntil(b.dueDay) >  5 && b.isActive);
  const paid     = sortedFiltered.filter(b => b.isPaid);
  const inactive = sortedFiltered.filter(b => !b.isActive);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Actions */}
      {role === 'admin' && (
        <div className="flex justify-end">
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <Plus size={15} /> Add Bill
          </button>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Monthly Total',  value: formatCurrency(monthlyTotal), icon: <RefreshCw size={16} />, bg: 'bg-brand-50 dark:bg-brand-900/20', ic: 'text-brand-600 dark:text-brand-400' },
          { label: 'Already Paid',   value: formatCurrency(paidTotal),    icon: <Check size={16} />,     bg: 'bg-emerald-50 dark:bg-emerald-900/20', ic: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'Still Owed',     value: formatCurrency(unpaidTotal),  icon: <DollarSign size={16} />, bg: 'bg-amber-50 dark:bg-amber-900/20', ic: 'text-amber-600 dark:text-amber-400' },
          { label: 'Due Soon',       value: String(dueSoonCount),         icon: <AlertTriangle size={16} />, bg: 'bg-rose-50 dark:bg-rose-900/20', ic: 'text-rose-600 dark:text-rose-400' },
        ].map(s => (
          <Card key={s.label} className="p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${s.bg}`}>
              <span className={s.ic}>{s.icon}</span>
            </div>
            <div>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">{s.label}</p>
              <p className="text-lg font-bold text-zinc-900 dark:text-white tabular">{s.value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2">
        {(['all', 'upcoming', 'paid', 'inactive'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
              filter === f
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-white dark:bg-navy-800 border border-zinc-200 dark:border-navy-700 text-zinc-600 dark:text-zinc-300 hover:border-brand-400'
            }`}>{f}</button>
        ))}
      </div>

      {/* Bills list */}
      <Card className="overflow-hidden">
        {filter === 'all' ? (
          <>
            {dueSoon.length > 0 && (
              <div>
                <div className="flex items-center gap-2 px-4 py-3 bg-rose-50 dark:bg-rose-900/15 border-b border-rose-100 dark:border-rose-800/30">
                  <AlertTriangle size={13} className="text-rose-500" />
                  <span className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wide">Due Soon</span>
                </div>
                {dueSoon.map(b => <BillRow key={b.id} bill={b} role={role} />)}
              </div>
            )}
            {upcoming.length > 0 && (
              <div>
                <div className="px-4 py-3 border-b border-zinc-100 dark:border-navy-750">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Upcoming</span>
                </div>
                {upcoming.map(b => <BillRow key={b.id} bill={b} role={role} />)}
              </div>
            )}
            {paid.length > 0 && (
              <div>
                <div className="px-4 py-3 border-b border-zinc-100 dark:border-navy-750">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Paid This Month</span>
                </div>
                {paid.map(b => <BillRow key={b.id} bill={b} role={role} />)}
              </div>
            )}
            {inactive.length > 0 && (
              <div>
                <div className="px-4 py-3 border-b border-zinc-100 dark:border-navy-750">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Inactive</span>
                </div>
                {inactive.map(b => <BillRow key={b.id} bill={b} role={role} />)}
              </div>
            )}
            {bills.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Calendar size={32} className="text-zinc-300 dark:text-zinc-600 mb-3" />
                <p className="text-sm font-medium text-zinc-500">No bills yet</p>
                {role === 'admin' && (
                  <button onClick={() => setShowModal(true)}
                    className="mt-3 text-xs text-brand-600 font-medium hover:underline">
                    Add your first bill
                  </button>
                )}
              </div>
            )}
          </>
        ) : (
          <>
            {sortedFiltered.map(b => <BillRow key={b.id} bill={b} role={role} />)}
            {sortedFiltered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-sm text-zinc-400">No {filter} bills</p>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Add modal */}
      {showModal && (
        <BillModal
          onClose={() => setShowModal(false)}
          onSave={b => { addBill(b); setShowModal(false); toast.success(`${b.name} added`); }}
        />
      )}
    </div>
  );
}

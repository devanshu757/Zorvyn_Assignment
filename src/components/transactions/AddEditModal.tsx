import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { Transaction, TransactionType } from '../../types';
import { useApp } from '../../context/AppContext';
import { CATEGORIES } from '../../data/mockData';

interface Props {
  open: boolean;
  onClose: () => void;
  editTransaction?: Transaction | null;
}

const empty = {
  date: new Date().toISOString().slice(0, 10),
  amount: '',
  category: '',
  type: 'expense' as TransactionType,
  description: '',
  merchant: '',
};

export default function AddEditModal({ open, onClose, editTransaction }: Props) {
  const { addTransaction, updateTransaction } = useApp();
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editTransaction) {
      setForm({
        date: editTransaction.date,
        amount: editTransaction.amount.toString(),
        category: editTransaction.category,
        type: editTransaction.type,
        description: editTransaction.description,
        merchant: editTransaction.merchant,
      });
    } else {
      setForm(empty);
    }
    setErrors({});
  }, [editTransaction, open]);

  const categories = form.type === 'income' ? CATEGORIES.income : CATEGORIES.expense;

  function validate() {
    const e: Record<string, string> = {};
    if (!form.date) e.date = 'Required';
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) e.amount = 'Enter a valid amount';
    if (!form.category) e.category = 'Select a category';
    if (!form.description.trim()) e.description = 'Required';
    if (!form.merchant.trim()) e.merchant = 'Required';
    return e;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const data = {
      date: form.date,
      amount: parseFloat(form.amount),
      category: form.category,
      type: form.type,
      description: form.description.trim(),
      merchant: form.merchant.trim(),
    };

    if (editTransaction) {
      updateTransaction(editTransaction.id, data);
    } else {
      addTransaction(data);
    }
    onClose();
  }

  const field = (label: string, name: keyof typeof form, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={form[name]}
        onChange={(e) => setForm((p) => ({ ...p, [name]: e.target.value, category: name === 'type' ? '' : p.category }))}
        className={`w-full px-3 py-2 text-sm rounded-lg border ${
          errors[name] ? 'border-rose-400' : 'border-zinc-200 dark:border-zinc-600'
        } bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all`}
      />
      {errors[name] && <p className="text-xs text-rose-500 mt-1">{errors[name]}</p>}
    </div>
  );

  return (
    <Modal open={open} onClose={onClose} title={editTransaction ? 'Edit Transaction' : 'Add Transaction'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type toggle */}
        <div>
          <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">Type</label>
          <div className="flex gap-2">
            {(['income', 'expense'] as TransactionType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setForm((p) => ({ ...p, type: t, category: '' }))}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                  form.type === t
                    ? t === 'income'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-rose-600 text-white border-rose-600'
                    : 'border-zinc-200 dark:border-zinc-600 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700'
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {field('Date', 'date', 'date')}
          {field('Amount ($)', 'amount', 'number', '0.00')}
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">Category</label>
          <select
            value={form.category}
            onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
            className={`w-full px-3 py-2 text-sm rounded-lg border ${
              errors.category ? 'border-rose-400' : 'border-zinc-200 dark:border-zinc-600'
            } bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all`}
          >
            <option value="">Select category</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          {errors.category && <p className="text-xs text-rose-500 mt-1">{errors.category}</p>}
        </div>

        {field('Description', 'description', 'text', 'e.g. Weekly groceries')}
        {field('Merchant', 'merchant', 'text', 'e.g. FreshMart')}

        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium border border-zinc-200 dark:border-zinc-600 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-brand-600 hover:bg-brand-700 text-white transition-all"
          >
            {editTransaction ? 'Save Changes' : 'Add Transaction'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

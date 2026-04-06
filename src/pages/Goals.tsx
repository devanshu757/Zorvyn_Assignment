import { useState } from 'react';
import { Plus, Target, Pencil, Trash2, Check, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Goal } from '../types';
import { formatCurrency } from '../utils/helpers';
import Card from '../components/common/Card';
import Modal from '../components/common/Modal';

const GOAL_ICONS = ['🏠', '🚗', '✈️', '🎓', '💍', '💻', '🏖️', '📦', '🏋️', '🐶'];
const GOAL_COLORS = [
  { label: 'Violet', value: '#7c3aed' },
  { label: 'Blue', value: '#2563eb' },
  { label: 'Emerald', value: '#059669' },
  { label: 'Amber', value: '#d97706' },
  { label: 'Rose', value: '#e11d48' },
  { label: 'Indigo', value: '#4338ca' },
];

function emptyForm(): Omit<Goal, 'id'> {
  return { name: '', targetAmount: 0, savedAmount: 0, deadline: '', icon: '🎯', color: '#7c3aed' };
}

function GoalForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: Omit<Goal, 'id'>;
  onSave: (g: Omit<Goal, 'id'>) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState(initial);

  function set<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || form.targetAmount <= 0) return;
    onSave(form);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1.5">Goal Name</label>
        <input
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          placeholder="e.g. Emergency Fund"
          required
          className="input-base"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1.5">Target ($)</label>
          <input
            type="number" min={1}
            value={form.targetAmount || ''}
            onChange={(e) => set('targetAmount', parseFloat(e.target.value) || 0)}
            required
            className="input-base"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1.5">Saved So Far ($)</label>
          <input
            type="number" min={0}
            value={form.savedAmount || ''}
            onChange={(e) => set('savedAmount', parseFloat(e.target.value) || 0)}
            className="input-base"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1.5">Deadline</label>
        <input
          type="date"
          value={form.deadline}
          onChange={(e) => set('deadline', e.target.value)}
          className="input-base"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-2">Icon</label>
        <div className="flex flex-wrap gap-2">
          {GOAL_ICONS.map((icon) => (
            <button
              key={icon} type="button"
              onClick={() => set('icon', icon)}
              className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all ${form.icon === icon ? 'ring-2 ring-violet-500 bg-violet-50 dark:bg-violet-900/20' : 'hover:bg-zinc-100 dark:hover:bg-zinc-700'}`}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-2">Color</label>
        <div className="flex gap-2">
          {GOAL_COLORS.map((c) => (
            <button
              key={c.value} type="button"
              onClick={() => set('color', c.value)}
              style={{ backgroundColor: c.value }}
              className={`w-7 h-7 rounded-full transition-all ${form.color === c.value ? 'ring-2 ring-offset-2 ring-zinc-400 dark:ring-offset-zinc-800 scale-110' : 'hover:scale-105'}`}
            />
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-zinc-200 dark:border-zinc-600 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all">
          Cancel
        </button>
        <button type="submit" className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-brand-600 to-brand-800 hover:from-brand-700 hover:to-brand-900 text-white transition-all">
          Save Goal
        </button>
      </div>
    </form>
  );
}

export default function Goals() {
  const { goals, addGoal, updateGoal, removeGoal, role } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [editGoal, setEditGoal] = useState<Goal | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [depositGoalId, setDepositGoalId] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState('');

  function openAdd() { setEditGoal(null); setModalOpen(true); }
  function openEdit(g: Goal) { setEditGoal(g); setModalOpen(true); }

  function handleSave(form: Omit<Goal, 'id'>) {
    if (editGoal) updateGoal(editGoal.id, form);
    else addGoal(form);
    setModalOpen(false);
  }

  function handleDeposit() {
    const goal = goals.find((g) => g.id === depositGoalId);
    if (!goal) return;
    const amt = parseFloat(depositAmount);
    if (!isNaN(amt) && amt > 0) {
      updateGoal(goal.id, { ...goal, savedAmount: Math.min(goal.savedAmount + amt, goal.targetAmount) });
    }
    setDepositGoalId(null);
    setDepositAmount('');
  }

  const totalTargeted = goals.reduce((s, g) => s + g.targetAmount, 0);
  const totalSaved = goals.reduce((s, g) => s + g.savedAmount, 0);
  const completed = goals.filter((g) => g.savedAmount >= g.targetAmount).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {role === 'admin' && (
        <div className="flex justify-end">
          <button onClick={openAdd} className="btn-primary">
            <Plus size={14} /> New Goal
          </button>
        </div>
      )}

      {goals.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Total Targeted', value: formatCurrency(totalTargeted), color: 'text-zinc-900 dark:text-white' },
            { label: 'Total Saved', value: formatCurrency(totalSaved), color: 'text-emerald-600 dark:text-emerald-400' },
            { label: 'Completed', value: `${completed} / ${goals.length}`, color: completed > 0 ? 'text-violet-600 dark:text-violet-400' : 'text-zinc-400 dark:text-zinc-500' },
          ].map((s) => (
            <Card key={s.label} className="p-4">
              <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wide mb-1">{s.label}</p>
              <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
            </Card>
          ))}
        </div>
      )}

      {goals.length === 0 ? (
        <Card className="p-12 flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center text-3xl">🎯</div>
          <div>
            <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">No goals yet</p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 max-w-xs">Set a savings target — a vacation fund, emergency buffer, or big purchase — and track your progress here.</p>
          </div>
          {role === 'admin' && (
            <button onClick={openAdd} className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl transition-all">
              <Plus size={14} /> Create First Goal
            </button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((g) => {
            const pct = g.targetAmount > 0 ? Math.min((g.savedAmount / g.targetAmount) * 100, 100) : 0;
            const done = g.savedAmount >= g.targetAmount;
            const remaining = g.targetAmount - g.savedAmount;
            const daysLeft = g.deadline ? Math.ceil((new Date(g.deadline).getTime() - Date.now()) / 86400000) : null;

            return (
              <Card key={g.id} className={`p-5 ${done ? 'ring-1 ring-emerald-300 dark:ring-emerald-700' : ''}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ backgroundColor: `${g.color}20` }}>
                      {g.icon}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 leading-tight">{g.name}</p>
                      {done
                        ? <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Completed! 🎉</span>
                        : daysLeft !== null
                          ? <span className={`text-xs ${daysLeft < 30 ? 'text-rose-500 dark:text-rose-400' : 'text-zinc-400 dark:text-zinc-500'}`}>{daysLeft > 0 ? `${daysLeft}d left` : 'Overdue'}</span>
                          : null}
                    </div>
                  </div>
                  {role === 'admin' && (
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(g)} className="p-1.5 rounded-lg text-zinc-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-all"><Pencil size={12} /></button>
                      <button onClick={() => setDeleteId(g.id)} className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all"><Trash2 size={12} /></button>
                    </div>
                  )}
                </div>

                {/* Progress ring + amounts */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative w-16 h-16 flex-shrink-0">
                    <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                      <circle cx="32" cy="32" r="26" fill="none" strokeWidth="6" className="stroke-zinc-100 dark:stroke-zinc-700" />
                      <circle
                        cx="32" cy="32" r="26" fill="none" strokeWidth="6"
                        strokeDasharray={`${(pct / 100) * 2 * Math.PI * 26} ${2 * Math.PI * 26}`}
                        strokeLinecap="round"
                        style={{ stroke: done ? '#059669' : g.color, transition: 'stroke-dasharray 0.6s ease' }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">{Math.round(pct)}%</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-bold text-zinc-900 dark:text-white">{formatCurrency(g.savedAmount)}</p>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500">of {formatCurrency(g.targetAmount)}</p>
                    {!done && <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{formatCurrency(remaining)} to go</p>}
                  </div>
                </div>

                {role === 'admin' && !done && (
                  depositGoalId === g.id ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm text-zinc-400">$</span>
                      <input
                        type="number" min={1} autoFocus
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleDeposit(); if (e.key === 'Escape') { setDepositGoalId(null); setDepositAmount(''); } }}
                        placeholder="Amount"
                        className="input-base !py-1.5 !text-xs flex-1"
                      />
                      <button onClick={handleDeposit} className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"><Check size={14} /></button>
                      <button onClick={() => { setDepositGoalId(null); setDepositAmount(''); }} className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"><X size={14} /></button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDepositGoalId(g.id)}
                      className="w-full py-2 rounded-xl text-xs font-semibold text-white transition-all hover:opacity-90"
                      style={{ background: `linear-gradient(135deg, ${g.color}dd, ${g.color})` }}
                    >
                      + Add Deposit
                    </button>
                  )
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editGoal ? 'Edit Goal' : 'New Savings Goal'}
      >
        <GoalForm
          initial={editGoal ? { name: editGoal.name, targetAmount: editGoal.targetAmount, savedAmount: editGoal.savedAmount, deadline: editGoal.deadline, icon: editGoal.icon, color: editGoal.color } : emptyForm()}
          onSave={handleSave}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>

      {/* Delete confirm */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Goal" maxWidth="max-w-sm">
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-5">Are you sure you want to delete this goal? This cannot be undone.</p>
        <div className="flex gap-2">
          <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-zinc-200 dark:border-zinc-600 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all">Cancel</button>
          <button onClick={() => { if (deleteId) { removeGoal(deleteId); setDeleteId(null); } }} className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-rose-600 hover:bg-rose-700 text-white transition-all">Delete</button>
        </div>
      </Modal>

      {/* Floating target icon for empty feel */}
      {goals.length === 0 && (
        <div className="fixed bottom-8 right-8 opacity-5 pointer-events-none select-none text-8xl">
          <Target />
        </div>
      )}
    </div>
  );
}

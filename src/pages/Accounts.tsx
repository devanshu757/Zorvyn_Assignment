import { useState, useMemo } from 'react';
import {
  Wallet, TrendingUp, CreditCard, Building2,
  PiggyBank, ArrowUpRight, ArrowDownRight, Edit2, Check, X,
  Plus, DollarSign,
} from 'lucide-react';
import Card from '../components/common/Card';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { formatCurrency } from '../utils/helpers';
import { AccountType } from '../types';

/* ── Account type config ──────────────────────────────── */
const ACCOUNT_META: Record<AccountType, { label: string; icon: React.ElementType; gradient: string }> = {
  checking:   { label: 'Checking',   icon: Wallet,    gradient: 'from-blue-600 to-cyan-400 shadow-blue-500/30' },
  savings:    { label: 'Savings',    icon: PiggyBank, gradient: 'from-emerald-500 to-teal-400 shadow-emerald-500/30' },
  investment: { label: 'Investment', icon: TrendingUp, gradient: 'from-brand-600 to-brand-400 shadow-brand-500/30' },
  credit:     { label: 'Credit',     icon: CreditCard, gradient: 'from-rose-500 to-orange-400 shadow-rose-500/30' },
};

/* ── Inline balance editor ────────────────────────────── */
function BalanceEditor({
  accountId,
  current,
  onSave,
  onCancel,
}: {
  accountId: string;
  current: number;
  onSave: (v: number) => void;
  onCancel: () => void;
}) {
  const [val, setVal] = useState(String(Math.abs(current)));
  return (
    <div className="flex items-center gap-1.5 mt-2">
      <input
        autoFocus
        type="number"
        value={val}
        onChange={e => setVal(e.target.value)}
        className="input-base !py-1.5 !text-xs w-28"
        step="0.01"
      />
      <button onClick={() => onSave(parseFloat(val) || 0)}
        className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 hover:bg-emerald-200 transition-colors">
        <Check size={12} />
      </button>
      <button onClick={onCancel}
        className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:bg-zinc-200 transition-colors">
        <X size={12} />
      </button>
    </div>
  );
}

/* ── Account Card ─────────────────────────────────────── */
function AccountCard({ account, role }: { account: ReturnType<typeof useApp>['accounts'][0]; role: string }) {
  const { updateAccount } = useApp();
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const meta = ACCOUNT_META[account.type];
  const Icon = meta.icon;
  const isCredit = account.type === 'credit';
  const balancePositive = account.balance >= 0;

  return (
    <Card className="p-6 flex flex-col gap-5 hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
      {/* Gradient header */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${meta.gradient.split('shadow-')[0]} opacity-90`} />

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${meta.gradient.split('shadow-')[0]} flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 duration-300`}>
            <Icon size={22} className="text-white drop-shadow-sm" />
          </div>
          <div>
            <p className="text-sm font-bold text-zinc-900 dark:text-white leading-tight">{account.name}</p>
            <p className="text-xs text-zinc-400 mt-0.5">{account.institution}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`badge text-[10px] font-semibold ${
            isCredit
              ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
          }`}>
            {meta.label}
          </span>
        </div>
      </div>

      {/* Balance */}
      <div>
        {editing ? (
          <BalanceEditor
            accountId={account.id}
            current={account.balance}
            onSave={v => { updateAccount(account.id, isCredit ? -Math.abs(v) : v); setEditing(false); toast.success(`${account.name} balance updated`); }}
            onCancel={() => setEditing(false)}
          />
        ) : (
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs text-zinc-400 mb-1">{isCredit ? 'Amount owed' : 'Available balance'}</p>
              <p className={`text-2xl font-black tabular ${
                isCredit ? 'text-rose-600 dark:text-rose-400' :
                balancePositive ? 'text-zinc-900 dark:text-white' : 'text-rose-500'
              }`}>
                {isCredit ? '-' : ''}{formatCurrency(Math.abs(account.balance))}
              </p>
            </div>
            {role === 'admin' && (
              <button
                onClick={() => setEditing(true)}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                title="Edit balance"
              >
                <Edit2 size={13} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Card footer */}
      <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-navy-750">
        <div className="flex items-center gap-1.5">
          <Building2 size={11} className="text-zinc-300 dark:text-zinc-600" />
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500">{account.institution}</span>
        </div>
        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 tabular font-mono">
          •••• {account.lastFour}
        </span>
      </div>
    </Card>
  );
}

/* ── Net Worth Banner ─────────────────────────────────── */
function NetWorthBanner({ accounts }: { accounts: ReturnType<typeof useApp>['accounts'] }) {
  const totalAssets      = accounts.filter(a => a.balance > 0).reduce((s, a) => s + a.balance, 0);
  const totalLiabilities = accounts.filter(a => a.balance < 0).reduce((s, a) => s + Math.abs(a.balance), 0);
  const netWorth         = totalAssets - totalLiabilities;

  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 rounded-2xl p-5 text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-blue-200 text-xs font-medium mb-0.5">Total Net Worth</p>
          <p className="text-3xl font-black tabular tracking-tight">{formatCurrency(netWorth)}</p>
          <p className="text-blue-100/70 text-xs mt-0.5">Across {accounts.length} account{accounts.length !== 1 ? 's' : ''}</p>
        </div>

        <div className="flex items-center gap-6 sm:gap-8 sm:pr-4">
          <div>
            <div className="flex items-center gap-1 mb-0.5">
              <ArrowUpRight size={12} className="text-emerald-300" />
              <p className="text-[11px] font-semibold text-emerald-200">Total Assets</p>
            </div>
            <p className="text-base font-bold tabular">{formatCurrency(totalAssets)}</p>
          </div>
          <div className="w-px h-8 bg-white/20" />
          <div>
            <div className="flex items-center gap-1 mb-0.5">
              <ArrowDownRight size={12} className="text-rose-300" />
              <p className="text-[11px] font-semibold text-rose-200">Liabilities</p>
            </div>
            <p className="text-base font-bold tabular">{formatCurrency(totalLiabilities)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Type Breakdown ───────────────────────────────────── */
function TypeBreakdown({ accounts }: { accounts: ReturnType<typeof useApp>['accounts'] }) {
  const types = ['checking', 'savings', 'investment', 'credit'] as AccountType[];
  return (
    <Card className="p-5">
      <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-4">Account Breakdown</h3>
      <div className="space-y-3">
        {types.map(type => {
          const typeAccounts = accounts.filter(a => a.type === type);
          if (typeAccounts.length === 0) return null;
          const total = typeAccounts.reduce((s, a) => s + Math.abs(a.balance), 0);
          const meta  = ACCOUNT_META[type];
          const Icon  = meta.icon;
          return (
            <div key={type} className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${meta.gradient.split('shadow-')[0]} flex items-center justify-center flex-shrink-0 shadow-md`}>
                <Icon size={16} className="text-white drop-shadow-sm" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">{meta.label}</p>
                <p className="text-[10px] text-zinc-400">{typeAccounts.length} account{typeAccounts.length !== 1 ? 's' : ''}</p>
              </div>
              <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200 tabular">{formatCurrency(total)}</p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

/* ── Main Page ────────────────────────────────────────── */
export default function Accounts() {
  const { accounts, role } = useApp();
  const [filter, setFilter] = useState<AccountType | 'all'>('all');

  const filtered = useMemo(() =>
    filter === 'all' ? accounts : accounts.filter(a => a.type === filter),
    [accounts, filter]
  );

  const types: { value: AccountType | 'all'; label: string }[] = [
    { value: 'all',        label: 'All' },
    { value: 'checking',   label: 'Checking' },
    { value: 'savings',    label: 'Savings' },
    { value: 'investment', label: 'Investment' },
    { value: 'credit',     label: 'Credit' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Actions */}
      {role === 'admin' && (
        <div className="flex justify-end">
          <button className="btn-primary gap-1.5">
            <Plus size={15} /> Add Account
          </button>
        </div>
      )}

      {/* Net worth banner */}
      <NetWorthBanner accounts={accounts} />

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {types.map(t => (
          <button
            key={t.value}
            onClick={() => setFilter(t.value)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filter === t.value
                ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/30'
                : 'bg-white dark:bg-navy-800 border border-zinc-200 dark:border-navy-700 text-zinc-600 dark:text-zinc-300 hover:border-brand-400'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {/* Account cards */}
        <div className="md:col-span-2 xl:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 content-start">
          {filtered.map(acc => (
            <AccountCard key={acc.id} account={acc} role={role} />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-2 flex flex-col items-center justify-center py-16 text-center">
              <DollarSign size={32} className="text-zinc-300 dark:text-zinc-600 mb-3" />
              <p className="text-sm font-medium text-zinc-500">No {filter !== 'all' ? filter : ''} accounts found</p>
            </div>
          )}
        </div>

        {/* Type breakdown */}
        <div className="space-y-4">
          <TypeBreakdown accounts={accounts} />

          {/* Quick stats */}
          <Card className="p-5">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-4">Quick Stats</h3>
            <div className="space-y-3">
              {[
                { label: 'Total Accounts',     value: String(accounts.length), icon: <Wallet size={14} className="text-brand-500" /> },
                { label: 'Positive Accounts',  value: String(accounts.filter(a => a.balance > 0).length), icon: <ArrowUpRight size={14} className="text-emerald-500" /> },
                { label: 'Credit Accounts',    value: String(accounts.filter(a => a.type === 'credit').length), icon: <CreditCard size={14} className="text-rose-500" /> },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {s.icon}
                    <span className="text-xs text-zinc-600 dark:text-zinc-400">{s.label}</span>
                  </div>
                  <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{s.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

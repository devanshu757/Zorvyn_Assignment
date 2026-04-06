import { useState } from 'react';
import { Shield, Eye, Camera, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Card from '../components/common/Card';

const AVATARS = ['🧑‍💼', '👩‍💼', '🧑‍💻', '👩‍💻', '🧑‍🎓', '👩‍🎓', '🧑‍🔬', '👩‍🔬'];

interface Props {
  userName: string;
}

export default function Profile({ userName }: Props) {
  const { role, transactions } = useApp();
  const [avatar, setAvatar] = useState(() => localStorage.getItem('ft_avatar') ?? '🧑‍💼');
  const [displayName, setDisplayName] = useState(userName);
  const [saved, setSaved] = useState(false);

  const initials = userName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  const totalIncome = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpenses = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const email = localStorage.getItem('ft_session_name') === userName
    ? (role === 'admin' ? 'admin@fintrack.app' : 'viewer@fintrack.app')
    : `${userName.toLowerCase().replace(' ', '.')}@fintrack.app`;

  function handleSave() {
    localStorage.setItem('ft_avatar', avatar);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      {/* Profile card */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Avatar */}
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-800 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-brand-300/30 dark:shadow-brand-900/40">
              {avatar === '🧑‍💼' && initials.length > 0 ? (
                <span className="text-2xl font-bold">{initials}</span>
              ) : (
                <span className="text-3xl">{avatar}</span>
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white dark:bg-navy-800 border border-zinc-200 dark:border-navy-700 flex items-center justify-center shadow-sm">
              <Camera size={11} className="text-zinc-500" />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">{displayName}</h2>
            <p className="text-sm text-zinc-400 dark:text-zinc-500">{email}</p>
            <div className="flex items-center gap-1.5 mt-2">
              {role === 'admin'
                ? <Shield size={13} className="text-brand-500" />
                : <Eye size={13} className="text-zinc-400" />}
              <span className={`text-xs font-semibold capitalize px-2 py-0.5 rounded-full ${
                role === 'admin'
                  ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300'
                  : 'bg-zinc-100 dark:bg-navy-750 text-zinc-600 dark:text-zinc-400'
              }`}>{role}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Edit name */}
      <Card className="p-5">
        <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-4">Personal Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1.5">Display Name</label>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="input-base"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1.5">Email</label>
            <input
              value={email}
              disabled
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-zinc-200 dark:border-zinc-600 bg-zinc-100 dark:bg-zinc-800/50 text-zinc-400 dark:text-zinc-500 cursor-not-allowed"
            />
          </div>
        </div>
      </Card>

      {/* Avatar picker */}
      <Card className="p-5">
        <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-3">Avatar</h2>
        <div className="flex flex-wrap gap-3">
          {AVATARS.map((a) => (
            <button
              key={a}
              onClick={() => setAvatar(a)}
              className={`w-12 h-12 rounded-xl text-2xl flex items-center justify-center transition-all ${
                avatar === a
                  ? 'ring-2 ring-brand-500 ring-offset-2 dark:ring-offset-navy-900 bg-brand-50 dark:bg-brand-900/20 scale-110'
                  : 'hover:bg-zinc-100 dark:hover:bg-navy-750 hover:scale-105'
              }`}
            >
              {a}
            </button>
          ))}
          {/* Initials option */}
          <button
            onClick={() => setAvatar('initials')}
            className={`w-12 h-12 rounded-xl text-sm font-bold flex items-center justify-center transition-all ${
              avatar === 'initials'
                ? 'ring-2 ring-brand-500 ring-offset-2 dark:ring-offset-navy-900 bg-gradient-to-br from-brand-500 to-brand-800 text-white scale-110'
                : 'bg-gradient-to-br from-brand-500 to-brand-800 text-white hover:scale-105 opacity-70 hover:opacity-100'
            }`}
          >
            {initials}
          </button>
        </div>
      </Card>

      {/* Stats */}
      <Card className="p-5">
        <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-4">Activity Summary</h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Transactions', value: transactions.length },
            { label: 'Income entries', value: transactions.filter((t) => t.type === 'income').length },
            { label: 'Expense entries', value: transactions.filter((t) => t.type === 'expense').length },
          ].map((s) => (
            <div key={s.label} className="text-center p-3 bg-zinc-50 dark:bg-navy-800 rounded-xl">
              <p className="text-xl font-bold text-zinc-900 dark:text-white">{s.value}</p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 text-xs text-zinc-400 dark:text-zinc-500 text-center">
          Total tracked: <span className="font-semibold text-emerald-600 dark:text-emerald-400">${totalIncome.toLocaleString()}</span> income · <span className="font-semibold text-rose-600 dark:text-rose-400">${totalExpenses.toLocaleString()}</span> expenses
        </div>
      </Card>

      <button
        onClick={handleSave}
        className="btn-primary"
      >
        {saved ? <><Check size={14} /> Saved!</> : 'Save Changes'}
      </button>
    </div>
  );
}

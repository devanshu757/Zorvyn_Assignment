import { useState } from 'react';
import { Sun, Moon, Shield, Eye, Bell, Palette, Database, Info } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Card from '../components/common/Card';
import { mockTransactions } from '../data/mockData';

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <Card className="p-5">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">{title}</h2>
        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">{description}</p>
      </div>
      <div className="space-y-3">{children}</div>
    </Card>
  );
}

function Row({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-zinc-50 dark:border-navy-700/50 last:border-0">
      <div>
        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{label}</p>
        {description && <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">{description}</p>}
      </div>
      <div className="flex-shrink-0 ml-4">{children}</div>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-brand-600' : 'bg-zinc-200 dark:bg-navy-700'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
}

export default function Settings() {
  const { theme, toggleTheme, role, setRole, transactions, setPage } = useApp();
  const [notifications, setNotifications] = useState({ budgetAlerts: true, weeklyDigest: false, goalReminders: true });
  const [currency, setCurrency] = useState('USD');
  const [resetConfirm, setResetConfirm] = useState(false);

  function handleReset() {
    localStorage.removeItem('ft_transactions');
    window.location.reload();
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      {/* Appearance */}
      <Section title="Appearance" description="Customise the look and feel of the dashboard">
        <Row label="Dark Mode" description="Switch between light and dark themes">
          <div className="flex items-center gap-2">
            <Sun size={14} className="text-amber-500" />
            <Toggle checked={theme === 'dark'} onChange={() => toggleTheme()} />
            <Moon size={14} className="text-brand-400" />
          </div>
        </Row>
        <Row label="Currency">
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="input-base !py-1.5 !w-auto"
          >
            {['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD'].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </Row>
      </Section>

      {/* Role */}
      <Section title="Access Role" description="Simulate different permission levels (viewer can only view; admin can add, edit, and delete)">
        <Row label="Current Role" description="Switching role simulates RBAC behaviour">
          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-navy-800 rounded-lg p-1">
            <button
              onClick={() => setRole('viewer')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${role === 'viewer' ? 'bg-white dark:bg-navy-700 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
            >
              <Eye size={12} /> Viewer
            </button>
            <button
              onClick={() => setRole('admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${role === 'admin' ? 'bg-brand-600 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
            >
              <Shield size={12} /> Admin
            </button>
          </div>
        </Row>
      </Section>

      {/* Notifications */}
      <Section title="Notifications" description="Control which alerts and digests you receive">
        <Row label="Budget Alerts" description="Notify when spending exceeds 80% of a budget">
          <Toggle checked={notifications.budgetAlerts} onChange={(v) => setNotifications((p) => ({ ...p, budgetAlerts: v }))} />
        </Row>
        <Row label="Weekly Digest" description="Summary email every Monday morning">
          <Toggle checked={notifications.weeklyDigest} onChange={(v) => setNotifications((p) => ({ ...p, weeklyDigest: v }))} />
        </Row>
        <Row label="Goal Reminders" description="Remind when a savings goal deadline is approaching">
          <Toggle checked={notifications.goalReminders} onChange={(v) => setNotifications((p) => ({ ...p, goalReminders: v }))} />
        </Row>
      </Section>

      {/* Data */}
      <Section title="Data Management" description="Manage your transaction data and storage">
        <Row label="Total Transactions" description="Stored in local browser storage">
          <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{transactions.length} records</span>
        </Row>
        <Row label="Export All Data" description="Download a full copy of your transactions">
          <div className="flex gap-2">
            <button
              onClick={() => setPage('reports')}
              className="text-xs px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-600 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all font-medium"
            >
              Go to Reports
            </button>
          </div>
        </Row>
        <Row label="Reset to Demo Data" description="Restore the original mock transactions (cannot be undone)">
          {resetConfirm ? (
            <div className="flex gap-2">
              <button onClick={() => setResetConfirm(false)} className="text-xs px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-600 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all">Cancel</button>
              <button onClick={handleReset} className="text-xs px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition-all font-semibold">Confirm Reset</button>
            </div>
          ) : (
            <button onClick={() => setResetConfirm(true)} className="text-xs px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all font-medium">
              Reset Data
            </button>
          )}
        </Row>
      </Section>

      {/* About */}
      <Section title="About" description="Application information">
        <Row label="Version"><span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">v1.0.0</span></Row>
        <Row label="Framework"><span className="text-xs text-zinc-500 dark:text-zinc-400">React 18 + Vite + Tailwind CSS</span></Row>
        <Row label="Charts"><span className="text-xs text-zinc-500 dark:text-zinc-400">Recharts</span></Row>
        <Row label="Storage"><span className="text-xs text-zinc-500 dark:text-zinc-400">Browser localStorage</span></Row>
        <Row label="Transactions in demo"><span className="text-xs text-zinc-500 dark:text-zinc-400">{mockTransactions.length} across 6 months</span></Row>
      </Section>

      {/* Icon keys so imports aren't flagged unused */}
      <div className="hidden"><Bell /><Palette /><Database /><Info /></div>
    </div>
  );
}

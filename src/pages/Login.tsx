import { useState } from 'react';
import { Eye, EyeOff, LogIn, ChevronRight, Sun, Moon, ArrowRight, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Role } from '../types';

interface StoredUser { name: string; email: string; password: string; role: Role }

const SEED_USERS: StoredUser[] = [
  { name: 'Jordan Lee',  email: 'admin@fintrack.app',  password: 'Admin@123',  role: 'admin'  },
  { name: 'Alex Morgan', email: 'viewer@fintrack.app', password: 'Viewer@123', role: 'viewer' },
];

function getUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem('ft_registered_users');
    const registered: StoredUser[] = raw ? JSON.parse(raw) : [];
    return [...SEED_USERS, ...registered];
  } catch { return SEED_USERS; }
}

function saveUser(user: StoredUser) {
  try {
    const raw = localStorage.getItem('ft_registered_users');
    const registered: StoredUser[] = raw ? JSON.parse(raw) : [];
    if (!registered.some(u => u.email === user.email)) {
      registered.push(user);
      localStorage.setItem('ft_registered_users', JSON.stringify(registered));
    }
  } catch { /* ignore */ }
}

interface Props { onLogin: (name: string) => void }
type View = 'login' | 'signup';

/* ── Logo mark ────────────────────────────────────────── */
function LogoMark({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <circle cx="15" cy="5" r="3.5" fill="white" fillOpacity="0.25" />
      <circle cx="15" cy="5" r="2" fill="white" />
      <path d="M2 15L7 9L11 12L15 5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── Stats for social proof ───────────────────────────── */
const STATS = [
  { value: '$2.4M+', label: 'Total tracked' },
  { value: '98%',    label: 'Uptime' },
  { value: '4.9★',   label: 'Rating' },
];

/* ── Feature list ─────────────────────────────────────── */
const FEATURES = [
  { icon: '📊', title: 'Real-time Overview',   desc: 'Net balance, income, and trends in one glance.' },
  { icon: '🎯', title: 'Smart Budgets',         desc: 'Set limits per category and track progress visually.' },
  { icon: '💰', title: 'Savings Goals',         desc: 'Define targets, log deposits, watch progress grow.' },
  { icon: '🔍', title: 'Deep Analytics',        desc: 'Month-over-month trends and spending insights.' },
  { icon: '🔔', title: 'Proactive Alerts',      desc: 'Get notified before you overspend a budget.' },
  { icon: '🔐', title: 'Role-Based Access',     desc: 'Separate admin and viewer access controls.' },
];

export default function Login({ onLogin }: Props) {
  const { setRole, theme, toggleTheme } = useApp();
  const [view, setView] = useState<View>('login');

  /* Login state */
  const [loginEmail,    setLoginEmail]    = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPwd,  setShowLoginPwd]  = useState(false);
  const [loginError,    setLoginError]    = useState('');
  const [loginLoading,  setLoginLoading]  = useState(false);

  /* Signup state */
  const [signupName,     setSignupName]     = useState('');
  const [signupEmail,    setSignupEmail]    = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [showSignupPwd,  setShowSignupPwd]  = useState(false);
  const [signupError,    setSignupError]    = useState('');
  const [signupLoading,  setSignupLoading]  = useState(false);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    setTimeout(() => {
      const user = getUsers().find(
        u => u.email.toLowerCase() === loginEmail.trim().toLowerCase() && u.password === loginPassword
      );
      if (user) { setRole(user.role); onLogin(user.name); }
      else setLoginError('Incorrect email or password. Try the demo credentials below.');
      setLoginLoading(false);
    }, 600);
  }

  function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setSignupError('');
    if (signupPassword.length < 6) { setSignupError('Password must be at least 6 characters.'); return; }
    setSignupLoading(true);
    setTimeout(() => {
      const all = getUsers();
      if (all.some(u => u.email.toLowerCase() === signupEmail.trim().toLowerCase())) {
        setSignupError('An account with this email already exists.'); setSignupLoading(false); return;
      }
      const newUser: StoredUser = { name: signupName.trim(), email: signupEmail.trim().toLowerCase(), password: signupPassword, role: 'viewer' };
      saveUser(newUser);
      setRole('viewer');
      onLogin(newUser.name);
      setSignupLoading(false);
    }, 600);
  }

  const inputCls = `input-base`;
  const labelCls = `label-sm`;

  return (
    <div className={`min-h-screen flex ${theme === 'dark' ? 'dark' : ''}`}>

      {/* ── Left panel ─────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[52%] xl:w-[55%] relative overflow-hidden flex-col">
        {/* Gradient bg — deep navy blue */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#050e1d] via-[#071828] to-[#0a2040]" />

        {/* Radial glow center */}
        <div className="absolute inset-0 opacity-40"
          style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(37,99,235,0.25) 0%, transparent 65%)' }} />

        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.8) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.8) 1px,transparent 1px)', backgroundSize: '44px 44px' }} />

        {/* Glow blobs */}
        <div className="absolute -top-20 -left-10 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[28rem] h-[28rem] bg-brand-800/25 rounded-full blur-3xl pointer-events-none translate-x-1/3 translate-y-1/3" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-sky-600/10 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />

        <div className="relative z-10 flex flex-col h-full px-12 py-10">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center shadow-lg">
              <LogoMark size={20} />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">FinTrack</span>
          </div>

          {/* Hero */}
          <div className="mt-auto mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 border border-white/20 rounded-full text-xs text-brand-200 font-medium mb-5">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              Smart personal finance dashboard
            </div>
            <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight tracking-tight">
              Your finances,<br />
              <span className="text-brand-200">always in focus.</span>
            </h1>
            <p className="text-brand-200/80 text-base mt-4 max-w-sm leading-relaxed">
              Track every dollar, optimize every budget, and hit your savings goals — in one beautifully designed dashboard.
            </p>

            {/* Stats */}
            <div className="flex items-center gap-6 mt-7">
              {STATS.map(s => (
                <div key={s.label}>
                  <p className="text-lg font-black text-white">{s.value}</p>
                  <p className="text-xs text-brand-300/70 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Feature grid */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            {FEATURES.map(f => (
              <div key={f.title} className="flex items-start gap-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-3.5 py-3 transition-colors">
                <span className="text-lg mt-0.5 flex-shrink-0">{f.icon}</span>
                <div>
                  <p className="text-xs font-semibold text-white">{f.title}</p>
                  <p className="text-[11px] text-brand-200/60 mt-0.5 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-brand-300/40">© 2026 FinTrack · All data stored locally in your browser</p>
        </div>
      </div>

      {/* ── Right panel ────────────────────────────── */}
      <div className="flex-1 flex flex-col bg-zinc-50 dark:bg-navy-950 transition-colors duration-200">
        {/* Top bar */}
        <div className="flex items-center justify-between px-8 py-5">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-brand-800 flex items-center justify-center shadow-md">
              <LogoMark size={16} />
            </div>
            <span className="text-base font-bold text-zinc-900 dark:text-white">FinTrack</span>
          </div>
          <div className="hidden lg:block" />

          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-all"
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center px-6 pb-8">
          <div className="w-full max-w-[400px]">
            {/* Heading */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
                {view === 'login' ? 'Welcome back' : 'Create an account'}
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1.5">
                {view === 'login'
                  ? 'Sign in to access your financial dashboard.'
                  : 'Get started for free. No credit card required.'}
              </p>
            </div>

            {/* Card */}
            <div className="bg-white dark:bg-navy-900 rounded-2xl border border-zinc-200/80 dark:border-navy-750/60
                            shadow-lg shadow-zinc-200/50 dark:shadow-navy-950/60 p-6">

              {view === 'login' ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className={labelCls}>Email Address</label>
                    <input type="email" required value={loginEmail}
                      onChange={e => setLoginEmail(e.target.value)}
                      placeholder="you@example.com" className={inputCls} />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className={`${labelCls} !mb-0`}>Password</label>
                    </div>
                    <div className="relative">
                      <input type={showLoginPwd ? 'text' : 'password'} required
                        value={loginPassword} onChange={e => setLoginPassword(e.target.value)}
                        placeholder="••••••••" className={`${inputCls} pr-11`} />
                      <button type="button" onClick={() => setShowLoginPwd(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
                        {showLoginPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  {loginError && (
                    <p className="flex items-start gap-2 text-xs text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800/40 px-3 py-2.5 rounded-xl">
                      <span className="flex-shrink-0 mt-0.5">⚠️</span> {loginError}
                    </p>
                  )}

                  <button type="submit" disabled={loginLoading}
                    className="btn-primary w-full gap-2 py-2.5 text-sm bg-gradient-to-r from-brand-600 to-brand-800 hover:from-brand-700 hover:to-brand-900 shadow-sm shadow-brand-500/30">
                    {loginLoading
                      ? <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                      : <LogIn size={15} />}
                    {loginLoading ? 'Signing in…' : 'Sign In'}
                  </button>

                  <p className="text-center text-xs text-zinc-400 dark:text-zinc-500">
                    Don't have an account?{' '}
                    <button type="button" onClick={() => { setView('signup'); setLoginError(''); }}
                      className="text-brand-600 dark:text-brand-400 font-semibold hover:underline">
                      Create one
                    </button>
                  </p>
                </form>
              ) : (
                <form onSubmit={handleSignup} className="space-y-4">
                  <div>
                    <label className={labelCls}>Full Name</label>
                    <input type="text" required value={signupName}
                      onChange={e => setSignupName(e.target.value)}
                      placeholder="Jane Doe" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Email Address</label>
                    <input type="email" required value={signupEmail}
                      onChange={e => setSignupEmail(e.target.value)}
                      placeholder="you@example.com" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Password</label>
                    <div className="relative">
                      <input type={showSignupPwd ? 'text' : 'password'} required
                        value={signupPassword} onChange={e => setSignupPassword(e.target.value)}
                        placeholder="Min. 6 characters" className={`${inputCls} pr-11`} />
                      <button type="button" onClick={() => setShowSignupPwd(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
                        {showSignupPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  {signupError && (
                    <p className="flex items-start gap-2 text-xs text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800/40 px-3 py-2.5 rounded-xl">
                      <span>⚠️</span> {signupError}
                    </p>
                  )}

                  <button type="submit" disabled={signupLoading}
                    className="btn-primary w-full gap-2 py-2.5 text-sm bg-gradient-to-r from-brand-600 to-brand-800 hover:from-brand-700 hover:to-brand-900 shadow-sm shadow-brand-500/30">
                    {signupLoading
                      ? <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                      : <ChevronRight size={15} />}
                    {signupLoading ? 'Creating account…' : 'Create Account'}
                  </button>

                  <p className="text-center text-xs text-zinc-400 dark:text-zinc-500">
                    Already have an account?{' '}
                    <button type="button" onClick={() => { setView('login'); setSignupError(''); }}
                      className="text-brand-600 dark:text-brand-400 font-semibold hover:underline">
                      Sign in
                    </button>
                  </p>
                </form>
              )}
            </div>

            {/* Demo credentials */}
            <div className="mt-5 p-4 bg-brand-50 dark:bg-brand-900/15 border border-brand-100 dark:border-brand-800/40 rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-brand-700 dark:text-brand-300">Demo Accounts</p>
                <span className="badge bg-brand-100 dark:bg-brand-800/40 text-brand-600 dark:text-brand-400 text-[10px]">
                  Click to fill
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { label: 'Admin',  email: 'admin@fintrack.app',  password: 'Admin@123',  emoji: '🛡️', role: 'Full access' },
                  { label: 'Viewer', email: 'viewer@fintrack.app', password: 'Viewer@123', emoji: '👁️', role: 'Read only' },
                ].map(u => (
                  <button key={u.label} type="button"
                    onClick={() => { setLoginEmail(u.email); setLoginPassword(u.password); setView('login'); setLoginError(''); }}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white dark:bg-navy-850
                               border border-brand-200 dark:border-brand-800/50
                               hover:border-brand-400 hover:shadow-sm transition-all text-left group">
                    <span className="text-lg flex-shrink-0">{u.emoji}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{u.label}</p>
                        <ArrowRight size={10} className="text-zinc-300 group-hover:text-brand-500 transition-colors" />
                      </div>
                      <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">{u.role}</p>
                    </div>
                    <Check size={11} className="ml-auto text-zinc-200 group-hover:text-brand-500 transition-colors flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

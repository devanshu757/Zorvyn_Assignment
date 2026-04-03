import { useEffect } from 'react';
import { useApp } from './context/AppContext';
import Navbar from './components/layout/Navbar';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Insights from './pages/Insights';

function AppContent() {
  const { theme, currentPage } = useApp();

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
  }, [theme]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors duration-200">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentPage === 'dashboard' && <Dashboard />}
        {currentPage === 'transactions' && <Transactions />}
        {currentPage === 'insights' && <Insights />}
      </main>
    </div>
  );
}

export default function App() {
  return <AppContent />;
}

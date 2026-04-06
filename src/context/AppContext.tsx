import React, { createContext, useContext, useCallback, useEffect } from 'react';
import { Transaction, FilterState, SortState, Role, Page, Theme, Budget, Goal, Account, Bill } from '../types';
import { mockTransactions, mockAccounts, mockBills } from '../data/mockData';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { generateId, setActiveCurrency } from '../utils/helpers';

interface AppContextType {
  transactions: Transaction[];
  filters: FilterState;
  sort: SortState;
  role: Role;
  theme: Theme;
  currentPage: Page;
  budgets: Budget[];
  goals: Goal[];
  accounts: Account[];
  bills: Bill[];
  currency: string;
  setCurrency: (c: string) => void;
  addTransaction: (t: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, t: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  setFilters: (f: Partial<FilterState>) => void;
  resetFilters: () => void;
  setSort: (s: SortState) => void;
  setRole: (r: Role) => void;
  toggleTheme: () => void;
  setPage: (p: Page) => void;
  setBudget: (category: string, limit: number) => void;
  removeBudget: (category: string) => void;
  addGoal: (g: Omit<Goal, 'id'>) => void;
  updateGoal: (id: string, g: Omit<Goal, 'id'>) => void;
  removeGoal: (id: string) => void;
  updateAccount: (id: string, balance: number) => void;
  toggleBillPaid: (id: string) => void;
  addBill: (b: Omit<Bill, 'id'>) => void;
  removeBill: (id: string) => void;
}

const defaultFilters: FilterState = {
  search: '',
  type: 'all',
  category: '',
  dateFrom: '',
  dateTo: '',
};

const defaultSort: SortState = { field: 'date', direction: 'desc' };

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('ft_transactions', mockTransactions);
  const [filters, setFiltersState] = useLocalStorage<FilterState>('ft_filters', defaultFilters);
  const [sort, setSort] = useLocalStorage<SortState>('ft_sort', defaultSort);
  const [role, setRole] = useLocalStorage<Role>('ft_role', 'viewer');
  const [theme, setTheme] = useLocalStorage<Theme>('ft_theme', 'light');
  const [currentPage, setPage] = useLocalStorage<Page>('ft_page', 'dashboard');
  const [budgets, setBudgetsState] = useLocalStorage<Budget[]>('ft_budgets', []);
  const [goals, setGoals] = useLocalStorage<Goal[]>('ft_goals', []);
  const [accounts, setAccounts] = useLocalStorage<Account[]>('ft_accounts', mockAccounts);
  const [bills, setBills] = useLocalStorage<Bill[]>('ft_bills', mockBills);
  const [currency, setCurrencyState] = useLocalStorage<string>('ft_currency', 'USD');

  // Sync currency to the helpers module so formatCurrency stays reactive
  useEffect(() => { setActiveCurrency(currency); }, [currency]);

  const setCurrency = useCallback((c: string) => {
    setActiveCurrency(c);
    setCurrencyState(c);
  }, [setCurrencyState]);

  const addTransaction = useCallback((t: Omit<Transaction, 'id'>) => {
    setTransactions((prev) => [{ ...t, id: generateId() }, ...prev]);
  }, [setTransactions]);

  const updateTransaction = useCallback((id: string, t: Omit<Transaction, 'id'>) => {
    setTransactions((prev) => prev.map((tx) => (tx.id === id ? { ...t, id } : tx)));
  }, [setTransactions]);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
  }, [setTransactions]);

  const setFilters = useCallback((f: Partial<FilterState>) => {
    setFiltersState((prev) => ({ ...prev, ...f }));
  }, [setFiltersState]);

  const resetFilters = useCallback(() => {
    setFiltersState(defaultFilters);
  }, [setFiltersState]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, [setTheme]);

  const setBudget = useCallback((category: string, limit: number) => {
    setBudgetsState((prev) => {
      const existing = prev.find((b) => b.category === category);
      if (existing) return prev.map((b) => b.category === category ? { ...b, limit } : b);
      return [...prev, { category, limit }];
    });
  }, [setBudgetsState]);

  const removeBudget = useCallback((category: string) => {
    setBudgetsState((prev) => prev.filter((b) => b.category !== category));
  }, [setBudgetsState]);

  const addGoal = useCallback((g: Omit<Goal, 'id'>) => {
    setGoals((prev) => [...prev, { ...g, id: generateId() }]);
  }, [setGoals]);

  const updateGoal = useCallback((id: string, g: Omit<Goal, 'id'>) => {
    setGoals((prev) => prev.map((goal) => goal.id === id ? { ...g, id } : goal));
  }, [setGoals]);

  const removeGoal = useCallback((id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  }, [setGoals]);

  const updateAccount = useCallback((id: string, balance: number) => {
    setAccounts((prev) => prev.map((a) => a.id === id ? { ...a, balance } : a));
  }, [setAccounts]);

  const toggleBillPaid = useCallback((id: string) => {
    setBills((prev) => prev.map((b) => b.id === id ? { ...b, isPaid: !b.isPaid } : b));
  }, [setBills]);

  const addBill = useCallback((b: Omit<Bill, 'id'>) => {
    setBills((prev) => [...prev, { ...b, id: generateId() }]);
  }, [setBills]);

  const removeBill = useCallback((id: string) => {
    setBills((prev) => prev.filter((b) => b.id !== id));
  }, [setBills]);

  return (
    <AppContext.Provider
      value={{
        transactions, filters, sort, role, theme, currentPage,
        budgets, goals, accounts, bills,
        currency, setCurrency,
        addTransaction, updateTransaction, deleteTransaction,
        setFilters, resetFilters, setSort, setRole, toggleTheme, setPage,
        setBudget, removeBudget,
        addGoal, updateGoal, removeGoal,
        updateAccount, toggleBillPaid, addBill, removeBill,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

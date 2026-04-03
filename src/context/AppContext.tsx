import React, { createContext, useContext, useCallback } from 'react';
import { Transaction, FilterState, SortState, Role, Page, Theme } from '../types';
import { mockTransactions } from '../data/mockData';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { generateId } from '../utils/helpers';

interface AppContextType {
  transactions: Transaction[];
  filters: FilterState;
  sort: SortState;
  role: Role;
  theme: Theme;
  currentPage: Page;
  addTransaction: (t: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, t: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  setFilters: (f: Partial<FilterState>) => void;
  resetFilters: () => void;
  setSort: (s: SortState) => void;
  setRole: (r: Role) => void;
  toggleTheme: () => void;
  setPage: (p: Page) => void;
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

  return (
    <AppContext.Provider
      value={{
        transactions,
        filters,
        sort,
        role,
        theme,
        currentPage,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        setFilters,
        resetFilters,
        setSort,
        setRole,
        toggleTheme,
        setPage,
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

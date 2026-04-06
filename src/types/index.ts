export type TransactionType = 'income' | 'expense';
export type Role = 'viewer' | 'admin';
export type Page =
  | 'dashboard'
  | 'transactions'
  | 'accounts'
  | 'bills'
  | 'budgets'
  | 'goals'
  | 'reports'
  | 'insights'
  | 'analytics'
  | 'settings'
  | 'profile';
export type Theme = 'light' | 'dark';
export type SortField = 'date' | 'amount' | 'category' | 'description';
export type SortDirection = 'asc' | 'desc';

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  category: string;
  type: TransactionType;
  description: string;
  merchant: string;
}

export interface FilterState {
  search: string;
  type: TransactionType | 'all';
  category: string;
  dateFrom: string;
  dateTo: string;
}

export interface SortState {
  field: SortField;
  direction: SortDirection;
}

export interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
  balance: number;
}

export interface CategoryStat {
  name: string;
  value: number;
  color: string;
  count: number;
}

export interface SummaryStats {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  transactionCount: number;
  incomeChange: number;
  expenseChange: number;
}

export interface Budget {
  category: string;
  limit: number;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  deadline: string;
  icon: string;
  color: string;
}

export type AccountType = 'checking' | 'savings' | 'investment' | 'credit';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  institution: string;
  color: string;
  lastFour: string;
}

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDay: number;
  category: string;
  icon: string;
  isActive: boolean;
  color: string;
  isPaid?: boolean;
}

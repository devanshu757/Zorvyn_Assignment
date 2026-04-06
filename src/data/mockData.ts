import { Transaction, Account, Bill } from '../types';

export const mockAccounts: Account[] = [
  { id: 'acc1', name: 'Primary Checking', type: 'checking', balance: 12450.30, institution: 'Chase Bank', color: '#3b82f6', lastFour: '4521' },
  { id: 'acc2', name: 'High-Yield Savings', type: 'savings', balance: 28750.00, institution: 'Marcus by GS', color: '#10b981', lastFour: '8834' },
  { id: 'acc3', name: 'Investment Portfolio', type: 'investment', balance: 45200.00, institution: 'Fidelity', color: '#8b5cf6', lastFour: '0012' },
  { id: 'acc4', name: 'Visa Platinum', type: 'credit', balance: -2340.50, institution: 'Capital One', color: '#f43f5e', lastFour: '7291' },
];

export const mockBills: Bill[] = [
  { id: 'bill1', name: 'Monthly Rent', amount: 1800, dueDay: 1, category: 'Housing', icon: '🏠', isActive: true, color: '#6366f1' },
  { id: 'bill2', name: 'Power Grid Co.', amount: 95, dueDay: 15, category: 'Utilities', icon: '⚡', isActive: true, color: '#f59e0b' },
  { id: 'bill3', name: 'City Water', amount: 45, dueDay: 20, category: 'Utilities', icon: '💧', isActive: true, color: '#06b6d4' },
  { id: 'bill4', name: 'Fiber Internet', amount: 60, dueDay: 12, category: 'Utilities', icon: '📡', isActive: true, color: '#3b82f6' },
  { id: 'bill5', name: 'City Transit Pass', amount: 42, dueDay: 5, category: 'Transportation', icon: '🚇', isActive: true, color: '#f59e0b' },
  { id: 'bill6', name: 'Netflix', amount: 15, dueDay: 8, category: 'Subscriptions', icon: '🎬', isActive: true, color: '#ef4444' },
  { id: 'bill7', name: 'Spotify', amount: 10, dueDay: 22, category: 'Subscriptions', icon: '🎵', isActive: true, color: '#1db954' },
  { id: 'bill8', name: 'Gym Membership', amount: 45, dueDay: 1, category: 'Healthcare', icon: '💪', isActive: true, color: '#10b981' },
  { id: 'bill9', name: 'Health Insurance', amount: 220, dueDay: 28, category: 'Healthcare', icon: '🏥', isActive: true, color: '#ec4899' },
];

export const CATEGORIES = {
  expense: [
    'Food & Dining',
    'Housing',
    'Transportation',
    'Entertainment',
    'Healthcare',
    'Shopping',
    'Utilities',
    'Travel',
    'Education',
    'Subscriptions',
  ],
  income: ['Salary', 'Freelance', 'Investment', 'Bonus', 'Other Income'],
};

export const CATEGORY_COLORS: Record<string, string> = {
  'Food & Dining': '#f43f5e',
  Housing: '#6366f1',
  Transportation: '#f59e0b',
  Entertainment: '#8b5cf6',
  Healthcare: '#10b981',
  Shopping: '#ec4899',
  Utilities: '#3b82f6',
  Travel: '#14b8a6',
  Education: '#84cc16',
  Subscriptions: '#fb923c',
  Salary: '#22c55e',
  Freelance: '#06b6d4',
  Investment: '#a855f7',
  Bonus: '#eab308',
  'Other Income': '#64748b',
};

export const mockTransactions: Transaction[] = [
  // October 2025
  { id: 't001', date: '2025-10-01', amount: 5500, category: 'Salary', type: 'income', description: 'Monthly salary', merchant: 'Employer' },
  { id: 't002', date: '2025-10-03', amount: 1200, category: 'Freelance', type: 'income', description: 'Web design project', merchant: 'Client A' },
  { id: 't003', date: '2025-10-04', amount: 1800, category: 'Housing', type: 'expense', description: 'Monthly rent payment', merchant: 'Landlord' },
  { id: 't004', date: '2025-10-06', amount: 85, category: 'Food & Dining', type: 'expense', description: 'Weekly groceries', merchant: 'FreshMart' },
  { id: 't005', date: '2025-10-09', amount: 42, category: 'Transportation', type: 'expense', description: 'Monthly metro pass', merchant: 'City Transit' },
  { id: 't006', date: '2025-10-11', amount: 15, category: 'Subscriptions', type: 'expense', description: 'Streaming subscription', merchant: 'Netflix' },
  { id: 't007', date: '2025-10-13', amount: 68, category: 'Food & Dining', type: 'expense', description: 'Team lunch outing', merchant: 'The Grille' },
  { id: 't008', date: '2025-10-15', amount: 95, category: 'Utilities', type: 'expense', description: 'Electricity bill', merchant: 'PowerGrid Co.' },
  { id: 't009', date: '2025-10-18', amount: 30, category: 'Food & Dining', type: 'expense', description: 'Coffee & snacks', merchant: 'Brew & Co.' },
  { id: 't010', date: '2025-10-20', amount: 150, category: 'Healthcare', type: 'expense', description: 'Annual checkup', merchant: 'CityClinic' },
  { id: 't011', date: '2025-10-22', amount: 78, category: 'Food & Dining', type: 'expense', description: 'Grocery run', merchant: 'QuickMart' },
  { id: 't012', date: '2025-10-24', amount: 230, category: 'Shopping', type: 'expense', description: 'New shoes & clothing', merchant: 'StyleHub' },
  { id: 't013', date: '2025-10-28', amount: 45, category: 'Utilities', type: 'expense', description: 'Water bill', merchant: 'City Water' },

  // November 2025
  { id: 't014', date: '2025-11-01', amount: 5500, category: 'Salary', type: 'income', description: 'Monthly salary', merchant: 'Employer' },
  { id: 't015', date: '2025-11-04', amount: 1800, category: 'Housing', type: 'expense', description: 'Monthly rent payment', merchant: 'Landlord' },
  { id: 't016', date: '2025-11-05', amount: 92, category: 'Food & Dining', type: 'expense', description: 'Weekly groceries', merchant: 'FreshMart' },
  { id: 't017', date: '2025-11-08', amount: 15, category: 'Subscriptions', type: 'expense', description: 'Streaming subscription', merchant: 'Netflix' },
  { id: 't018', date: '2025-11-10', amount: 60, category: 'Entertainment', type: 'expense', description: 'Movie tickets & dinner', merchant: 'CinePlex' },
  { id: 't019', date: '2025-11-14', amount: 110, category: 'Utilities', type: 'expense', description: 'Electricity bill', merchant: 'PowerGrid Co.' },
  { id: 't020', date: '2025-11-17', amount: 75, category: 'Transportation', type: 'expense', description: 'Fuel & parking', merchant: 'FuelStop' },
  { id: 't021', date: '2025-11-22', amount: 450, category: 'Shopping', type: 'expense', description: 'Black Friday deals', merchant: 'MegaMall' },
  { id: 't022', date: '2025-11-25', amount: 220, category: 'Food & Dining', type: 'expense', description: 'Thanksgiving dinner', merchant: 'Grand Feast' },
  { id: 't023', date: '2025-11-28', amount: 50, category: 'Food & Dining', type: 'expense', description: 'Coffee & breakfast', merchant: 'Brew & Co.' },

  // December 2025
  { id: 't024', date: '2025-12-01', amount: 5500, category: 'Salary', type: 'income', description: 'Monthly salary', merchant: 'Employer' },
  { id: 't025', date: '2025-12-15', amount: 2000, category: 'Bonus', type: 'income', description: 'Year-end performance bonus', merchant: 'Employer' },
  { id: 't026', date: '2025-12-03', amount: 1800, category: 'Housing', type: 'expense', description: 'Monthly rent payment', merchant: 'Landlord' },
  { id: 't027', date: '2025-12-06', amount: 380, category: 'Food & Dining', type: 'expense', description: 'Holiday grocery haul', merchant: 'FreshMart' },
  { id: 't028', date: '2025-12-10', amount: 15, category: 'Subscriptions', type: 'expense', description: 'Streaming subscription', merchant: 'Netflix' },
  { id: 't029', date: '2025-12-13', amount: 680, category: 'Shopping', type: 'expense', description: 'Christmas gifts', merchant: 'GiftWorld' },
  { id: 't030', date: '2025-12-18', amount: 950, category: 'Travel', type: 'expense', description: 'Holiday flights & hotel', merchant: 'TravelEase' },
  { id: 't031', date: '2025-12-20', amount: 130, category: 'Utilities', type: 'expense', description: 'Electricity bill', merchant: 'PowerGrid Co.' },
  { id: 't032', date: '2025-12-24', amount: 320, category: 'Food & Dining', type: 'expense', description: 'Christmas Eve dinner', merchant: 'La Belle' },
  { id: 't033', date: '2025-12-28', amount: 90, category: 'Entertainment', type: 'expense', description: 'New Year event tickets', merchant: 'EventHub' },

  // January 2026
  { id: 't034', date: '2026-01-01', amount: 5500, category: 'Salary', type: 'income', description: 'Monthly salary', merchant: 'Employer' },
  { id: 't035', date: '2026-01-05', amount: 800, category: 'Freelance', type: 'income', description: 'Logo design project', merchant: 'Client B' },
  { id: 't036', date: '2026-01-07', amount: 350, category: 'Investment', type: 'income', description: 'Dividend returns', merchant: 'Brokerage' },
  { id: 't037', date: '2026-01-04', amount: 1800, category: 'Housing', type: 'expense', description: 'Monthly rent payment', merchant: 'Landlord' },
  { id: 't038', date: '2026-01-08', amount: 75, category: 'Food & Dining', type: 'expense', description: 'Weekly groceries', merchant: 'FreshMart' },
  { id: 't039', date: '2026-01-11', amount: 15, category: 'Subscriptions', type: 'expense', description: 'Streaming subscription', merchant: 'Netflix' },
  { id: 't040', date: '2026-01-14', amount: 140, category: 'Utilities', type: 'expense', description: 'Electricity bill', merchant: 'PowerGrid Co.' },
  { id: 't041', date: '2026-01-16', amount: 200, category: 'Healthcare', type: 'expense', description: 'Dental checkup', merchant: 'DentaCare' },
  { id: 't042', date: '2026-01-20', amount: 65, category: 'Transportation', type: 'expense', description: 'Fuel & parking', merchant: 'FuelStop' },
  { id: 't043', date: '2026-01-24', amount: 180, category: 'Shopping', type: 'expense', description: 'New year essentials', merchant: 'HomeStore' },
  { id: 't044', date: '2026-01-27', amount: 40, category: 'Food & Dining', type: 'expense', description: 'Coffee & snacks', merchant: 'Brew & Co.' },

  // February 2026
  { id: 't045', date: '2026-02-01', amount: 5500, category: 'Salary', type: 'income', description: 'Monthly salary', merchant: 'Employer' },
  { id: 't046', date: '2026-02-04', amount: 1800, category: 'Housing', type: 'expense', description: 'Monthly rent payment', merchant: 'Landlord' },
  { id: 't047', date: '2026-02-06', amount: 80, category: 'Food & Dining', type: 'expense', description: 'Weekly groceries', merchant: 'FreshMart' },
  { id: 't048', date: '2026-02-10', amount: 15, category: 'Subscriptions', type: 'expense', description: 'Streaming subscription', merchant: 'Netflix' },
  { id: 't049', date: '2026-02-14', amount: 150, category: 'Entertainment', type: 'expense', description: "Valentine's dinner", merchant: 'Rosario' },
  { id: 't050', date: '2026-02-16', amount: 120, category: 'Utilities', type: 'expense', description: 'Electricity bill', merchant: 'PowerGrid Co.' },
  { id: 't051', date: '2026-02-19', amount: 95, category: 'Transportation', type: 'expense', description: 'Fuel & metro pass', merchant: 'City Transit' },
  { id: 't052', date: '2026-02-22', amount: 200, category: 'Food & Dining', type: 'expense', description: 'Dinner & groceries', merchant: 'QuickMart' },
  { id: 't053', date: '2026-02-26', amount: 35, category: 'Food & Dining', type: 'expense', description: 'Coffee & breakfast', merchant: 'Brew & Co.' },

  // March 2026
  { id: 't054', date: '2026-03-01', amount: 5500, category: 'Salary', type: 'income', description: 'Monthly salary', merchant: 'Employer' },
  { id: 't055', date: '2026-03-05', amount: 1500, category: 'Freelance', type: 'income', description: 'Dashboard UI project', merchant: 'Client C' },
  { id: 't056', date: '2026-03-03', amount: 1800, category: 'Housing', type: 'expense', description: 'Monthly rent payment', merchant: 'Landlord' },
  { id: 't057', date: '2026-03-07', amount: 95, category: 'Food & Dining', type: 'expense', description: 'Weekly groceries', merchant: 'FreshMart' },
  { id: 't058', date: '2026-03-10', amount: 15, category: 'Subscriptions', type: 'expense', description: 'Streaming subscription', merchant: 'Netflix' },
  { id: 't059', date: '2026-03-12', amount: 100, category: 'Utilities', type: 'expense', description: 'Electricity bill', merchant: 'PowerGrid Co.' },
  { id: 't060', date: '2026-03-15', amount: 80, category: 'Healthcare', type: 'expense', description: 'Physiotherapy session', merchant: 'PhysioPlus' },
  { id: 't061', date: '2026-03-18', amount: 55, category: 'Transportation', type: 'expense', description: 'Fuel', merchant: 'FuelStop' },
  { id: 't062', date: '2026-03-21', amount: 260, category: 'Shopping', type: 'expense', description: 'Spring wardrobe refresh', merchant: 'StyleHub' },
  { id: 't063', date: '2026-03-25', amount: 180, category: 'Food & Dining', type: 'expense', description: 'Dinner with friends', merchant: 'Ember & Oak' },
  { id: 't064', date: '2026-03-28', amount: 42, category: 'Food & Dining', type: 'expense', description: 'Coffee & snacks', merchant: 'Brew & Co.' },
  { id: 't065', date: '2026-03-30', amount: 120, category: 'Education', type: 'expense', description: 'Online course subscription', merchant: 'LearnPro' },
];

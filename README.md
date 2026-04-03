# FinTrack — Finance Dashboard

A clean, responsive finance dashboard built for tracking income, expenses, and spending patterns.

---

## Features

### Core
- **Dashboard Overview** — Summary cards (Net Balance, Income, Expenses, Transaction count) with month-over-month change indicators
- **Balance Trend Chart** — Area chart showing income, expenses, and running balance over 6 months
- **Spending Breakdown** — Donut chart with category-level breakdown and percentage share
- **Transaction List** — Full list with date, description, merchant, category, type, and amount
- **Search & Filter** — Filter by type, category, date range, and free-text search
- **Sorting** — Sort by date, amount, category, or description (ascending/descending)
- **Role-Based UI** — Viewer (read-only) and Admin (add, edit, delete transactions) roles
- **Insights Section** — Savings rate, top spending category, smart observations, month-over-month comparison

### Extras
- **Dark / Light Mode** — Full theme toggle, persisted across sessions
- **Local Storage Persistence** — All state (transactions, filters, role, theme) persisted in the browser
- **Export** — Export transactions as CSV or JSON
- **Responsive Design** — Works on mobile, tablet, and desktop

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 18 + TypeScript |
| Bundler | Vite 5 |
| Styling | Tailwind CSS 3 |
| Charts | Recharts 2 |
| Icons | lucide-react |
| State | React Context API + useLocalStorage |

---

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Project Structure

```
src/
├── components/
│   ├── common/          # Card, Badge, Modal, EmptyState
│   ├── dashboard/       # SummaryCards, BalanceTrendChart, SpendingBreakdownChart
│   ├── layout/          # Navbar
│   └── transactions/    # TransactionFilters, AddEditModal
├── context/
│   └── AppContext.tsx   # Global state (transactions, filters, role, theme)
├── data/
│   └── mockData.ts      # 65 mock transactions (Oct 2025 – Mar 2026)
├── hooks/
│   └── useLocalStorage.ts
├── pages/
│   ├── Dashboard.tsx
│   ├── Transactions.tsx
│   └── Insights.tsx
├── types/
│   └── index.ts
└── utils/
    └── helpers.ts       # Formatting, filtering, sorting, export utilities
```

---

## Role-Based Behavior

Switch roles using the toggle in the navbar:

| Role | Capabilities |
|---|---|
| **Viewer** | Read-only access — view all data, charts, and insights. Cannot modify transactions. |
| **Admin** | Full access — add, edit, and delete transactions via the Transactions page. |

---

## State Management

React Context API with `useLocalStorage` for persistence:

- `transactions` — Array of all transactions (defaults to 65 mock records)
- `filters` — Active filter state (search, type, category, date range)
- `sort` — Active sort field and direction
- `role` — Current user role (viewer / admin)
- `theme` — Light or dark mode

---

## Design Decisions

**Why Context API instead of Redux/Zustand?**
The state shape is simple and co-located. Context handles it cleanly without the boilerplate of Redux or an additional library dependency.

**Why Recharts?**
Composable, React-native, tree-shakeable. No imperative DOM manipulation needed.

**Why Tailwind CSS?**
`dark:` variants and responsive prefixes (`sm:`, `lg:`) make responsive dark-mode-aware layouts fast to build and easy to read.

**Hybrid dark/light design**
Default light theme with dark accents. A full dark mode is toggled via the moon/sun icon in the navbar.

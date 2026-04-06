# FinTrack — Professional Finance Dashboard

A production-quality personal finance dashboard built with React 18, TypeScript, Tailwind CSS, and Recharts. Covers the full spectrum of personal finance management — authentication, multi-page navigation, real-time budgets, savings goals, bill tracking, accounts overview, advanced analytics, smart insights, and role-based access control — entirely client-side with no backend required.

---

## Quick Start

```bash
# Install dependencies
npm install

# Start development server  (http://localhost:5173)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

**Demo credentials — available immediately:**

| Role   | Email                  | Password    | Access                              |
|--------|------------------------|-------------|-------------------------------------|
| Admin  | admin@fintrack.app     | Admin@123   | Full read + write across all pages  |
| Viewer | viewer@fintrack.app    | Viewer@123  | Read-only across all pages          |

You can also register a new account — it is saved in localStorage and defaults to the Viewer role.

---

## Feature Overview

### 11 Pages

| Page          | Purpose                                                                 |
|---------------|-------------------------------------------------------------------------|
| **Dashboard** | Personalised greeting, 4 KPI cards with sparklines, Financial Health Score arc, upcoming bills widget, goals progress, quick actions, budget overview, recent transactions |
| **Transactions** | Full transaction list with search, type/category/date filters, multi-field sort, month/category grouping, pagination, CSV/JSON export, add/edit/delete (admin) |
| **Accounts**  | Net worth banner (assets − liabilities), account cards per type (checking/savings/investment/credit), inline balance editing (admin) |
| **Bills**     | Urgency-sorted recurring payments, "Due today / Due in N days" labels, mark-as-paid toggles, monthly total summary, add/remove bills (admin) |
| **Budgets**   | Monthly limits per expense category, colour-coded progress bars (green/amber/red), untracked-spending surface, add/edit/remove (admin) |
| **Goals**     | Savings targets with circular progress rings, deadline countdowns, inline deposit logging, full CRUD (admin) |
| **Reports**   | Cumulative savings area chart, spending donut chart, monthly summary table with sort, date-range filter (3m / 6m / all), CSV/JSON export |
| **Insights**  | 4 KPI metrics, month-over-month income & expense change, 3-month cash flow forecast, automatic recurring transaction detection |
| **Analytics** | Income vs Expenses bar chart, cumulative balance area chart, spending trend line chart, category breakdown pie, 3 financial health ratios, range selector (3M / 6M / 1Y / All) |
| **Settings**  | Dark/light mode, currency selector, RBAC role switcher, notification preferences, data reset |
| **Profile**   | Avatar picker, display name, account stats (income, expenses, role) |

### Core Features

- **Financial Health Score (0–100)** — Composite metric weighting savings rate (40%), budget adherence (30%), and spending diversity (30%). Displayed as an animated arc on the Dashboard.
- **Live Notification System** — Bell icon with count badge; panel surfaces real alerts: budgets ≥ 80% spent and bills due within 5 days.
- **Cmd/Ctrl + K Search** — Quick-navigation command palette accessible from any page.
- **Collapsible Sidebar** — Collapses from 240px to 64px icon-only mode; state persisted in localStorage. Grouped navigation sections with live badge counts.
- **Toast Feedback** — Success/error/info toasts on every mutating action (add, edit, delete, mark paid, balance update).
- **Role-Based Access Control** — Viewer and Admin roles enforced at component level; all write actions are gated behind `role === 'admin'` checks.
- **Dark Mode** — Full dark/light theme via Tailwind `dark:` variants, toggle in sidebar and Settings.
- **CSV / JSON Export** — Available on Transactions and Reports pages.
- **Recurring Transaction Detection** — Automatically identifies merchants appearing across 3+ months and estimates monthly cost.
- **Cash Flow Forecast** — Projects next month's income, expenses, and net savings from the trailing 3-month average.

---

## Architecture

### Directory Structure

```
src/
├── components/
│   ├── common/
│   │   ├── Badge.tsx          # Income/expense/neutral variant badge
│   │   ├── Card.tsx           # Base card container with hover effects
│   │   ├── EmptyState.tsx     # Empty state component
│   │   ├── Modal.tsx          # Accessible modal with Esc-to-close
│   │   └── Skeleton.tsx       # Dashboard and table loading skeletons
│   ├── dashboard/
│   │   ├── BalanceTrendChart.tsx
│   │   ├── SpendingBreakdownChart.tsx
│   │   └── SummaryCards.tsx
│   ├── layout/
│   │   ├── Sidebar.tsx        # Collapsible sidebar with badge system
│   │   └── TopHeader.tsx      # Notification panel + Cmd+K search
│   └── transactions/
│       ├── AddEditModal.tsx   # Add/edit transaction form modal
│       └── TransactionFilters.tsx
├── context/
│   ├── AppContext.tsx         # Global state: transactions, budgets, goals,
│   │                          #   accounts, bills, filters, sort, role, theme
│   └── ToastContext.tsx       # Toast notification queue
├── data/
│   └── mockData.ts            # 65 mock transactions (Oct 2025 – Apr 2026),
│                              #   4 mock accounts, 9 mock bills, category colours
├── hooks/
│   ├── useLocalStorage.ts     # Two-way localStorage sync hook
│   └── useMockApi.ts          # Simulated API delay for skeleton UX
├── pages/
│   ├── Accounts.tsx           # Net worth + account cards
│   ├── Analytics.tsx          # Advanced multi-chart analytics
│   ├── Bills.tsx              # Recurring payments tracker
│   ├── Budgets.tsx            # Monthly category limits
│   ├── Dashboard.tsx          # Overview + widgets
│   ├── Goals.tsx              # Savings targets
│   ├── Insights.tsx           # Smart observations + forecast
│   ├── Login.tsx              # Auth (login + signup)
│   ├── Profile.tsx            # User profile
│   ├── Reports.tsx            # Charts + monthly table
│   ├── Settings.tsx           # Preferences
│   └── Transactions.tsx       # Full transaction list
├── types/
│   └── index.ts               # All TypeScript interfaces and union types
└── utils/
    └── helpers.ts             # Formatting, filtering, sorting, export, analytics
```

### Layout

```
┌─────────────────────────────────────────────────────────┐
│  Sidebar (240px / 64px collapsed)  │  TopHeader (52px)  │
│  ─ Logo                            │  ─ Page title      │
│  ─ Nav sections with badges        │  ─ Search (Cmd+K)  │
│  ─ Settings / theme / user         │  ─ Notifications   │
│                                    ├────────────────────│
│                                    │  Page content      │
│                                    │  (scrollable)      │
└────────────────────────────────────┴────────────────────┘
```

---

## State Management

All state lives in `AppContext` (React Context API) with automatic localStorage persistence via a custom `useLocalStorage` hook.

```
AppContext
├── transactions[]        — 65 seed records; fully editable by admins
├── budgets[]             — per-category monthly limits
├── goals[]               — savings targets (amount, deadline, icon, colour)
├── accounts[]            — bank/investment/credit accounts
├── bills[]               — recurring payment definitions
├── filters / sort        — active filter + sort for Transactions page
├── role                  — 'admin' | 'viewer'
├── theme                 — 'light' | 'dark'
└── currentPage           — active page (client-side router)
```

**Why no Redux / Zustand?** The state is flat, co-located, and the relationships are simple enough that Context + a custom hook handles everything without the overhead of an external library. If the app grew to dozens of pages with complex cross-cutting state, that would be the right time to introduce a dedicated store.

**localStorage keys:**

| Key | Contents |
|-----|----------|
| `ft_transactions` | Transaction array |
| `ft_budgets` | Budget definitions |
| `ft_goals` | Savings goals |
| `ft_accounts` | Account list |
| `ft_bills` | Bill list |
| `ft_filters` | Active filter state |
| `ft_sort` | Active sort state |
| `ft_role` | Current role |
| `ft_theme` | Current theme |
| `ft_page` | Current page |
| `ft_session` | Login flag |
| `ft_session_name` | Logged-in user's name |
| `ft_sidebar_collapsed` | Sidebar collapse state |
| `ft_avatar` | Selected avatar emoji |
| `ft_registered_users` | Custom registered accounts |

---

## Role-Based Access Control

| Capability | Viewer | Admin |
|------------|--------|-------|
| View all 11 pages | ✓ | ✓ |
| Add / edit / delete transactions | — | ✓ |
| Set / edit / remove budgets | — | ✓ |
| Create / edit / delete savings goals | — | ✓ |
| Log goal deposits | — | ✓ |
| Edit account balances | — | ✓ |
| Add / remove bills | — | ✓ |
| Mark bills as paid | — | ✓ |

Roles are enforced with `role === 'admin'` guards at the component level — not just hidden UI but the action buttons themselves are never rendered for Viewer sessions. Switching role in Settings updates context immediately without a page reload.

---

## Design System

### Tech
- **Tailwind CSS 3** — utility-first, `dark:` variants, responsive prefixes (`sm:`, `md:`, `lg:`)
- **Inter** — primary font via Google Fonts
- **lucide-react** — consistent SVG icon set

### Color palette
- **Brand (Violet/Indigo)** — primary actions, active nav, gradients
- **Emerald** — income, positive values, success states
- **Rose** — expenses, over-budget alerts, destructive actions
- **Amber** — warnings (budget ≥ 75%, bills due soon)
- **Zinc** — neutral text, borders, backgrounds (light and dark)

### Component classes (global in `index.css`)
```css
.card         — base card (white bg, border, shadow)
.card-hover   — card + hover lift
.btn-primary  — brand-coloured filled button
.btn-secondary — neutral outlined button
.btn-ghost    — no-background text button
.input-base   — consistent form input styling
.nav-item     — sidebar navigation item base
.nav-item-active — active nav item highlight
.badge        — pill badge
.tabular      — tabular-nums font variant
```

---

## Key Design Decisions

**Sidebar over top navbar** — For a dashboard with 11 pages grouped into sections, a sidebar gives better scanability, more room for nav labels and badge counts, and aligns with how enterprise finance tools (Stripe, Linear, Notion) are structured.

**Financial Health Score** — A single 0–100 composite metric gives users an immediate sense of their financial position. The three factors (savings rate, budget adherence, spending diversity) cover fundamentally different aspects of financial health, and the weightings (40 / 30 / 30) reflect the relative importance of savings as the primary lever.

**Automatic recurring detection** — No configuration needed. The algorithm finds merchants appearing in 3+ different calendar months and surfaces them as likely recurring costs. This is genuinely useful and hard to replicate with manual tagging.

**Notification system driven from data** — Rather than storing notifications, they are computed fresh from state on every render. Budget and bill alerts are always accurate and never go stale.

**Mock API delay with skeletons** — The `useMockApi` hook introduces a 600ms simulated latency on first load of heavy pages, showing skeleton screens. This demonstrates realistic loading-state UX without needing a real backend.

**localStorage auth** — The seeded accounts are hard-coded constants, not stored in localStorage, so they survive a full storage clear. Custom-registered accounts are stored separately. A real deployment would swap this layer for a proper auth service; the shape of `onLogin(name: string)` and `role: Role` in context would make that migration straightforward.

---

## Tech Stack

| Layer | Choice | Version |
|-------|--------|---------|
| Framework | React | 18.2.0 |
| Language | TypeScript | 5.2.2 |
| Bundler | Vite | 5.0.8 |
| Styling | Tailwind CSS | 3.4.0 |
| Charts | Recharts | 2.10.3 |
| Icons | lucide-react | 0.309.0 |
| State | React Context + custom hooks | — |
| Persistence | localStorage | — |

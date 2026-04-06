# FinTrack — Finance Dashboard UI

**Submitted by:** Devanshu Maru  
**Email:** devanshumaru@gmail.com  
**Role:** Frontend Developer Intern  
**Assignment:** Finance Dashboard UI — Zorvyn Assignment Portal

---

## What I Built

FinTrack is a personal finance dashboard I built for this assignment. The idea was to create something that actually feels useful — not just a static mockup with some charts slapped together. A user should be able to open it, understand their financial situation at a glance, dig into transactions, track budgets and goals, and feel like the tool is working for them.

It runs entirely in the browser with no backend. All data is stored in localStorage so nothing gets lost on refresh. I used React 18 with TypeScript, Tailwind CSS for styling, and Recharts for the charts.

---

## Getting Started

```bash
npm install
npm run dev
```

That's it. Opens at `http://localhost:5173`.

There are two demo accounts ready to go:

| Role   | Email                  | Password    |
|--------|------------------------|-------------|
| Admin  | admin@fintrack.app     | Admin@123   |
| Viewer | viewer@fintrack.app    | Viewer@123  |

You can also register your own account from the login page — it'll be saved locally and default to the Viewer role.

To build for production:

```bash
npm run build
npm run preview
```

---

## My Approach

I started by thinking about what a finance dashboard actually needs to do well. The assignment mentioned summary cards, transaction filtering, role-based UI, and insights — but I wanted to go beyond the minimum and build something that I'd actually want to use myself.

A few decisions I made early on:

**Sidebar layout over a top nav** — with 11 different sections, a top navbar would've felt cramped. A sidebar gives room to show section labels, badge counts, and still collapse down to icon-only mode when you need more space. It's also how most serious dashboards (Stripe, Linear, Notion) are structured.

**Everything persisted to localStorage** — the assignment said persistence was optional but it felt wrong not to do it. If you set a budget or add a transaction and then refresh, losing that data kills the experience. I built a small `useLocalStorage` hook that handles the sync automatically.

**65 seed transactions across 7 months** — I wanted the charts and insights to actually show something meaningful. A few dummy records wouldn't really demonstrate spending patterns, monthly comparisons, or category breakdowns. Having real-ish data across multiple months makes every feature feel alive.

**TypeScript throughout** — it's a bit more upfront work but it catches so many issues early and makes the codebase much easier to reason about. All the data shapes are defined in `src/types/index.ts`.

---

## Pages and Features

### Dashboard
The first thing you see after logging in. Shows four KPI cards (net balance, income, expenses, savings rate) each with a small sparkline chart underneath. There's a Financial Health Score displayed as an animated arc — it's a composite of your savings rate, how well you're sticking to budgets, and spending diversity. Below that are quick widgets for upcoming bills and goals progress, a budget status overview, and the seven most recent transactions.

The greeting at the top uses your actual name and the time of day — small thing but it makes the app feel personal.

### Transactions
Full transaction list with search, filters (by type, category, date range), sorting on any column, and grouping by month or category. Admins can add, edit, and delete. There's pagination and both CSV and JSON export. I added a proper empty state for when filters return nothing.

### Accounts
Shows your total net worth (assets minus liabilities) in a banner at the top, then account cards for each account type (checking, savings, investment, credit). Admins can click on the balance to edit it inline — no modal needed for something that simple.

### Bills
Recurring payments sorted by urgency. Anything due today shows in red, due within two days in amber. Admins can mark bills as paid and add/remove them. There's also a monthly total so you know exactly what's going out every month.

### Budgets
Category-based monthly spending limits. The progress bars go green → amber → red as you approach and exceed the limit. Categories you're spending in but haven't budgeted for show up separately so nothing falls through the cracks.

### Goals
Savings targets with circular progress rings. Each goal has a deadline countdown. Admins can log deposits directly from the goal card. The ring animates as progress increases.

### Reports
A more detailed look at savings trends over time (area chart), spending breakdown by category (donut chart), and a sortable monthly summary table. You can filter by the last 3 months, 6 months, or all time. CSV and JSON export work here too.

### Insights
This was one of the more interesting pages to build. It automatically detects recurring transactions by finding merchants that appear across 3 or more separate calendar months — no tagging required. It also projects next month's income, expenses, and net savings based on a rolling 3-month average. Month-over-month income and expense changes are shown with clear directional indicators.

### Analytics
Deeper charting — income vs expenses bar chart, cumulative balance over time, a spending trend line, and a category breakdown pie chart. There's a date range selector (3M / 6M / 1Y / All) that adjusts all charts together. Three financial health ratios (savings rate, expense-to-income, budget adherence) give a quick numeric read.

### Settings
Dark/light mode toggle, currency selector (USD, EUR, GBP, INR, JPY, CAD, AUD — actually changes the formatting everywhere, not just the label), role switcher for demo purposes, notification preference toggles (persisted), and a data reset option.

### Profile
Avatar picker, display name, and a summary of your account stats. Simple but complete.

---

## Role-Based Access Control

The assignment asked for a simulated frontend RBAC, so here's how it works:

Viewer accounts can see everything but can't change anything. The add/edit/delete buttons simply don't render — they're not hidden with `display:none` or disabled, just not there. That keeps the UI clean for read-only users.

Admin accounts get full write access across all pages: adding and editing transactions, creating and editing budgets and goals, managing bills, editing account balances, and marking bills as paid.

You can switch roles in Settings, or log in with the respective demo account. Role is persisted in localStorage so it survives a refresh.

---

## State Management

Everything lives in a single `AppContext` using React's built-in Context API. I considered Zustand but the state is flat enough that it felt like unnecessary overhead. The context holds:

- All data arrays (transactions, budgets, goals, accounts, bills)
- Active filters and sort state for the Transactions page
- The current page (used as a client-side router)
- Theme, role, and currency preferences

Every action (add, update, delete) is wrapped in `useCallback` to avoid unnecessary re-renders. State is synced to localStorage through a custom `useLocalStorage` hook that mirrors the standard `useState` API so it's completely transparent to use.

The currency selector is wired to a module-level variable in `helpers.ts` that the `formatCurrency` function reads from. When the user changes currency in Settings, all formatted values across every page update immediately — no prop-drilling needed.

---

## Design Decisions Worth Mentioning

**Financial Health Score** — I wanted a single number that gives people an honest read on their situation. It's weighted: savings rate counts for 40% (the most impactful lever), budget adherence for 30%, and spending diversity for 30%. The arc animates when you first load the dashboard.

**Command palette (⌘K)** — Lets you navigate to any page instantly from anywhere. Results are grouped by section with icons, has a clear button, and a footer showing the keyboard shortcuts. Felt like a nice touch for a dashboard you'd use daily.

**Skeleton screens** — The dashboard and a few heavy pages show shimmer placeholders for 600ms before rendering. It's simulated latency, but it demonstrates that the app handles loading states properly rather than just flashing blank content.

**Notification system** — Budget alerts (≥80% spent) and upcoming bills (≤5 days) are computed fresh from state on every render. There's no separate notification store to go stale — the bell badge count is always accurate.

**Toast feedback** — Every write action gives immediate confirmation. Adding a transaction, editing a balance, marking a bill paid — all produce a small toast in the corner so you always know something happened.

---

## What I'd Add With More Time

Honestly there are a few things I ran out of time for:

- A proper multi-account transaction split view
- Chart annotations (e.g. marking when a budget was set)
- A proper search that covers transactions, not just page navigation
- Print/PDF export for reports
- Mobile-specific bottom nav instead of the hamburger drawer

The codebase is set up in a way that adding these wouldn't require major restructuring, which was intentional.

---

## Tech Stack

| | |
|--|--|
| Framework | React 18 with TypeScript |
| Bundler | Vite |
| Styling | Tailwind CSS 3 |
| Charts | Recharts |
| Icons | lucide-react |
| State | React Context + custom hooks |
| Persistence | localStorage |

---

## Project Structure

```
src/
├── components/
│   ├── common/        # Card, Badge, Modal, EmptyState, Skeleton
│   ├── dashboard/     # Sparklines, summary cards, charts
│   ├── layout/        # Sidebar, TopHeader (with command palette)
│   └── transactions/  # Filter bar, add/edit modal
├── context/
│   ├── AppContext.tsx  # All global state and actions
│   └── ToastContext.tsx
├── data/
│   └── mockData.ts    # 65 transactions, 4 accounts, 9 bills, colours
├── hooks/
│   ├── useLocalStorage.ts
│   └── useMockApi.ts
├── pages/             # One file per page, 11 total
├── types/
│   └── index.ts       # All interfaces and union types
└── utils/
    └── helpers.ts     # Formatting, filtering, sorting, analytics, export
```

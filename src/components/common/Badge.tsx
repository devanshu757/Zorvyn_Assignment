interface BadgeProps {
  label: string;
  variant?: 'income' | 'expense' | 'neutral';
  size?: 'sm' | 'md';
}

export default function Badge({ label, variant = 'neutral', size = 'md' }: BadgeProps) {
  const base = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';
  const colors = {
    income: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
    expense: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400',
    neutral: 'bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300',
  };
  return (
    <span className={`inline-flex items-center rounded-full font-medium ${base} ${colors[variant]}`}>
      {label}
    </span>
  );
}

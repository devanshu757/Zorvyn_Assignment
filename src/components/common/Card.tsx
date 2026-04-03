import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({ children, className = '', hover = false }: CardProps) {
  return (
    <div
      className={`bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-card ${
        hover ? 'hover:shadow-card-hover hover:-translate-y-0.5 cursor-pointer' : ''
      } transition-all duration-200 ${className}`}
    >
      {children}
    </div>
  );
}

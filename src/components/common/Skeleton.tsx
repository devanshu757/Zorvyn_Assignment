export function SkeletonBox({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-zinc-200 dark:bg-navy-750 rounded-xl ${className}`} />
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-navy-800 border border-zinc-100 dark:border-navy-750 rounded-2xl p-5 space-y-3">
            <SkeletonBox className="h-3 w-24 rounded-full" />
            <SkeletonBox className="h-7 w-32 rounded-full" />
            <SkeletonBox className="h-3 w-16 rounded-full" />
          </div>
        ))}
      </div>
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3">
          <SkeletonBox className="h-72 rounded-2xl" />
        </div>
        <div className="lg:col-span-2">
          <SkeletonBox className="h-72 rounded-2xl" />
        </div>
      </div>
      {/* Recent txns */}
      <SkeletonBox className="h-52 rounded-2xl" />
    </div>
  );
}

export function TableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-2">
          <SkeletonBox className="h-4 w-20 rounded-full" />
          <SkeletonBox className="h-4 flex-1 rounded-full" />
          <SkeletonBox className="h-4 w-24 rounded-full" />
          <SkeletonBox className="h-4 w-16 rounded-full" />
          <SkeletonBox className="h-4 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
}

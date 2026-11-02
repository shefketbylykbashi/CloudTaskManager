export function Skeleton({ className = '', ...props }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-lg bg-slate-200/80 dark:bg-slate-800 ${className}`}
      {...props}
    />
  )
}

export function CardSkeleton({ className = '' }) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 ${className}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-8 w-20" />
        </div>
        <Skeleton className="h-10 w-10 rounded-xl" />
      </div>
      <Skeleton className="mt-5 h-2 w-full" />
    </div>
  )
}

export function TableSkeleton({ rows = 6, className = '' }) {
  return (
    <div className={`overflow-hidden ${className}`} aria-label="Loading tasks">
      <span className="sr-only">Loading tasks</span>
      <div className="hidden border-b border-slate-200 px-5 py-4 md:flex dark:border-slate-800">
        {[32, 20, 16, 16, 20].map((width, index) => (
          <Skeleton
            key={`${width}-${index}`}
            className="mr-10 h-3"
            style={{ width: `${width}%` }}
          />
        ))}
      </div>
      {Array.from({ length: rows }, (_, index) => (
        <div
          key={index}
          className="flex items-center gap-4 border-b border-slate-100 px-5 py-5 last:border-0 dark:border-slate-800/70"
        >
          <div className="min-w-0 flex-1 space-y-2.5">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="hidden h-6 w-20 rounded-full sm:block" />
          <Skeleton className="hidden h-6 w-16 rounded-full md:block" />
          <Skeleton className="h-9 w-9 rounded-lg" />
        </div>
      ))}
    </div>
  )
}


import { cn } from '@/lib/utils'

export function Skeleton({ className }) {
  return <div className={cn('animate-pulse rounded-lg bg-slate-200 dark:bg-white/10', className)} />
}

export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-800">
      <div className="mb-3 flex items-center justify-between">
        <Skeleton className="h-9 w-9 rounded-xl" />
        <Skeleton className="h-3.5 w-3.5 rounded" />
      </div>
      <Skeleton className="h-8 w-16 mb-1" />
      <Skeleton className="h-3 w-24 mb-2" />
      <Skeleton className="h-3 w-32" />
    </div>
  )
}

export function SkeletonTable({ rows = 5, cols = 6 }) {
  return (
    <div className="space-y-3">
      <div className="flex gap-4 border-b border-slate-100 pb-2.5 dark:border-white/10">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-3 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 py-2">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className="h-4 flex-1" style={{ opacity: 1 - i * 0.12 }} />
          ))}
        </div>
      ))}
    </div>
  )
}

export function SkeletonChart({ height = 240 }) {
  return (
    <div className="flex items-end gap-2 px-4" style={{ height }}>
      {[60, 80, 50, 90, 70, 85, 65].map((h, i) => (
        <Skeleton key={i} className="flex-1 rounded-t-lg" style={{ height: `${h}%` }} />
      ))}
    </div>
  )
}

export function SkeletonTimeline({ items = 4 }) {
  return (
    <ol className="relative space-y-5 border-l border-slate-200 pl-5 dark:border-white/10">
      {Array.from({ length: items }).map((_, i) => (
        <li key={i} className="relative">
          <span className="absolute -left-[25px] top-0.5 h-4 w-4 rounded-full bg-slate-200 dark:bg-white/10" />
          <Skeleton className="h-4 w-40 mb-1" />
          <Skeleton className="h-3 w-56 mb-1" />
          <Skeleton className="h-3 w-32" />
        </li>
      ))}
    </ol>
  )
}

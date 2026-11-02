import { ArrowUpRight } from 'lucide-react'

const accentStyles = {
  indigo: { icon: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-300', glow: 'bg-indigo-500/8' },
  amber: { icon: 'bg-amber-50 text-amber-600 dark:bg-amber-400/10 dark:text-amber-300', glow: 'bg-amber-500/8' },
  blue: { icon: 'bg-blue-50 text-blue-600 dark:bg-blue-400/10 dark:text-blue-300', glow: 'bg-blue-500/8' },
  emerald: { icon: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-300', glow: 'bg-emerald-500/8' },
  rose: { icon: 'bg-rose-50 text-rose-600 dark:bg-rose-400/10 dark:text-rose-300', glow: 'bg-rose-500/8' },
  violet: { icon: 'bg-violet-50 text-violet-600 dark:bg-violet-400/10 dark:text-violet-300', glow: 'bg-violet-500/8' },
}

export default function StatCard({ label, value, helper, icon: Icon, accent = 'indigo', progress }) {
  const styles = accentStyles[accent]
  return (
    <article className="surface-card group relative min-h-[142px] overflow-hidden p-5 transition duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-[0_14px_38px_rgba(51,55,86,0.09)] dark:hover:border-brand-900">
      <div className={`pointer-events-none absolute -right-8 -top-8 size-28 rounded-full blur-2xl ${styles.glow}`} />
      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-[var(--text-muted)]">{label}</p>
          <p className="mt-2 text-[28px] font-bold leading-none tracking-[-0.045em] text-[var(--text)]">{value}</p>
        </div>
        <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl transition group-hover:scale-105 ${styles.icon}`}>
          <Icon size={19} strokeWidth={2.1} aria-hidden="true" />
        </div>
      </div>
      <div className="relative mt-5">
        {typeof progress === 'number' ? (
          <div className="flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-indigo-400 transition-[width] duration-500" style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }} />
            </div>
            <span className="text-[10px] font-semibold text-[var(--text-subtle)]">of all tasks</span>
          </div>
        ) : (
          <p className="flex items-center gap-1 text-[11px] font-medium text-[var(--text-subtle)]">
            {helper}
            <ArrowUpRight size={12} className="opacity-50" />
          </p>
        )}
      </div>
    </article>
  )
}


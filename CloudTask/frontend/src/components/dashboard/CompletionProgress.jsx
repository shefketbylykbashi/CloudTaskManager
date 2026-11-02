import { CheckCheck, Target } from 'lucide-react'

export default function CompletionProgress({ rate, completed, total }) {
  const normalized = Math.min(Math.max(Number(rate) || 0, 0), 100)
  return (
    <section className="surface-card relative overflow-hidden p-5 sm:p-6">
      <div className="pointer-events-none absolute -right-14 -top-16 size-52 rounded-full bg-brand-500/8 blur-3xl" />
      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="eyebrow">Momentum</p>
            <h2 className="mt-1.5 text-base font-bold tracking-tight">Completion progress</h2>
          </div>
          <div className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
            <Target size={19} />
          </div>
        </div>

        <div className="mt-7 flex items-center gap-5">
          <div
            className="relative flex size-28 shrink-0 items-center justify-center rounded-full"
            style={{ background: `conic-gradient(#5d63f2 ${normalized * 3.6}deg, var(--border) 0deg)` }}
            role="img"
            aria-label={`${normalized.toFixed(1)} percent complete`}
          >
            <div className="absolute inset-[9px] rounded-full bg-[var(--surface)]" />
            <div className="relative text-center">
              <p className="text-2xl font-bold tracking-[-0.05em]">{normalized.toFixed(normalized % 1 === 0 ? 0 : 1)}%</p>
              <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-subtle)]">Complete</p>
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <CheckCheck size={17} />
              <span className="text-sm font-bold">{completed.toLocaleString()} finished</span>
            </div>
            <p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">
              {total === 0
                ? 'Create your first task to start building momentum.'
                : `${Math.max(total - completed, 0).toLocaleString()} ${total - completed === 1 ? 'task remains' : 'tasks remain'} in your current workload.`}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}


import { ArrowRight, Calendar, Clock3, Pencil, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatDate, getDueDateLabel, isOverdue } from '../../utils/date'
import { PriorityBadge, StatusBadge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { EmptyState } from '../ui/EmptyState'

export default function TaskListCard({ title, eyebrow, description, tasks, mode = 'recent', onEdit }) {
  return (
    <section className="surface-card overflow-hidden">
      <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] px-5 py-5 sm:px-6">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="mt-1.5 text-base font-bold tracking-tight">{title}</h2>
          <p className="mt-1 text-xs text-[var(--text-muted)]">{description}</p>
        </div>
        <Link to="/tasks" className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-500 dark:text-brand-300">
          View all <ArrowRight size={14} />
        </Link>
      </div>

      {tasks.length === 0 ? (
        <EmptyState
          compact
          icon={mode === 'upcoming' ? Calendar : Sparkles}
          title={mode === 'upcoming' ? 'No deadlines on the horizon' : 'No tasks to show yet'}
          description={mode === 'upcoming' ? 'Open tasks with due dates will appear here.' : 'Create a task and it will appear in this live activity list.'}
        />
      ) : (
        <div className="divide-y divide-[var(--border)]">
          {tasks.map((task) => {
            const overdue = mode === 'upcoming' && isOverdue(task)
            return (
              <article key={task.id} className="group flex items-center gap-3 px-5 py-3.5 transition hover:bg-slate-50/70 sm:px-6 dark:hover:bg-slate-800/25">
                <div className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${overdue ? 'bg-rose-50 text-rose-600 dark:bg-rose-400/10 dark:text-rose-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                  {mode === 'upcoming' ? <Calendar size={16} /> : <Clock3 size={16} />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[var(--text)]">{task.title}</p>
                  <div className="mt-1 flex items-center gap-2 text-[10px] font-medium text-[var(--text-subtle)]">
                    {mode === 'upcoming' ? (
                      <span className={overdue ? 'font-bold text-rose-600 dark:text-rose-400' : ''}>{getDueDateLabel(task)}</span>
                    ) : (
                      <span>Created {formatDate(task.createdAt)}</span>
                    )}
                    <span aria-hidden="true">•</span>
                    <PriorityBadge priority={task.priority} className="!border-0 !bg-transparent !p-0" />
                  </div>
                </div>
                <div className="hidden sm:block"><StatusBadge status={task.status} /></div>
                <Button variant="icon" size="icon" onClick={() => onEdit(task)} aria-label={`Edit ${task.title}`} className="!size-8 opacity-60 transition group-hover:opacity-100">
                  <Pencil size={14} />
                </Button>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}


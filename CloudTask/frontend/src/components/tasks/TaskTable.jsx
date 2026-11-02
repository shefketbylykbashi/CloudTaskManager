import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Calendar,
  Clock3,
  Pencil,
  Trash2,
} from 'lucide-react'
import { formatDate, formatDateTime, getDueDateLabel, isOverdue } from '../../utils/date'
import { STATUS_OPTIONS } from '../../utils/taskConstants'
import { PriorityBadge, StatusBadge } from '../ui/Badge'
import { Button } from '../ui/Button'

const statusSelectStyles = {
  Pending: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-300',
  InProgress: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-300',
  Completed: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300',
}

function SortButton({ field, label, query, onSort }) {
  const active = query.sortBy === field
  const Icon = !active ? ArrowUpDown : query.sortDirection === 'asc' ? ArrowUp : ArrowDown
  const currentDirection = active ? query.sortDirection : null
  return (
    <button
      type="button"
      onClick={() => onSort(field)}
      className={`group inline-flex items-center gap-1.5 font-bold uppercase tracking-[0.08em] transition ${
        active ? 'text-brand-600 dark:text-brand-300' : 'text-[var(--text-subtle)] hover:text-[var(--text)]'
      }`}
      aria-label={currentDirection ? `${label}, sorted ${currentDirection === 'asc' ? 'ascending' : 'descending'}. Change sort direction.` : `Sort by ${label}`}
    >
      {label}
      <Icon size={13} className={active ? '' : 'opacity-45 group-hover:opacity-100'} />
    </button>
  )
}

function StatusSelect({ task, disabled, onChange }) {
  return (
    <select
      value={task.status}
      onChange={(event) => onChange(task, event.target.value)}
      disabled={disabled}
      className={`h-8 w-[126px] appearance-none rounded-full border px-3 text-[11px] font-bold outline-none transition focus:ring-2 focus:ring-brand-500/25 disabled:cursor-wait disabled:opacity-60 ${statusSelectStyles[task.status]}`}
      aria-label={`Change status for ${task.title}`}
    >
      {STATUS_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select>
  )
}

function DueDate({ task, compact = false }) {
  if (!task.dueDate) return <span className="text-[var(--text-subtle)]">No due date</span>
  const overdue = isOverdue(task)
  return (
    <div className={overdue ? 'text-rose-600 dark:text-rose-400' : 'text-[var(--text-muted)]'}>
      <p className={`font-semibold ${compact ? 'text-xs' : 'text-sm'}`}>{formatDate(task.dueDate)}</p>
      <p className="mt-0.5 text-[10px] font-medium">{getDueDateLabel(task)}</p>
    </div>
  )
}

function MobileTaskCard({ task, updating, onEdit, onDelete, onStatusChange }) {
  return (
    <article className="border-b border-[var(--border)] p-4 last:border-b-0 md:hidden">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="line-clamp-2 text-sm font-bold leading-5">{task.title}</h3>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--text-muted)]">
            {task.description || 'No description'}
          </p>
        </div>
        <PriorityBadge priority={task.priority} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <StatusBadge status={task.status} />
        {task.dueDate && (
          <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${isOverdue(task) ? 'text-rose-600 dark:text-rose-400' : 'text-[var(--text-muted)]'}`}>
            <Calendar size={12} />
            {getDueDateLabel(task)}
          </span>
        )}
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--text-subtle)]">
          <Clock3 size={12} />
          Created {formatDate(task.createdAt, { year: undefined })}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-[var(--border)] pt-3">
        <StatusSelect task={task} disabled={updating} onChange={onStatusChange} />
        <div className="flex items-center gap-1">
          <Button variant="icon" size="icon" onClick={() => onEdit(task)} aria-label={`Edit ${task.title}`} className="!size-9">
            <Pencil size={15} />
          </Button>
          <Button variant="icon" size="icon" onClick={() => onDelete(task)} aria-label={`Delete ${task.title}`} className="!size-9 hover:!bg-rose-50 hover:!text-rose-600 dark:hover:!bg-rose-400/10 dark:hover:!text-rose-300">
            <Trash2 size={15} />
          </Button>
        </div>
      </div>
    </article>
  )
}

export default function TaskTable({ tasks, query, onSort, onEdit, onDelete, onStatusChange, updatingStatusIds = new Set() }) {
  const ariaSort = (field) => (query.sortBy === field ? (query.sortDirection === 'asc' ? 'ascending' : 'descending') : 'none')
  return (
    <>
      <div className="md:hidden">
        {tasks.map((task) => (
          <MobileTaskCard
            key={task.id}
            task={task}
            updating={updatingStatusIds.has(task.id)}
            onEdit={onEdit}
            onDelete={onDelete}
            onStatusChange={onStatusChange}
          />
        ))}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[1080px] border-collapse text-left">
          <caption className="sr-only">CloudTask task list</caption>
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--surface-muted)] text-[10px]">
              <th className="w-[22%] px-5 py-4" aria-sort={ariaSort('title')}><SortButton field="title" label="Task" query={query} onSort={onSort} /></th>
              <th className="w-[24%] px-4 py-4 text-[var(--text-subtle)]"><span className="font-bold uppercase tracking-[0.08em]">Description</span></th>
              <th className="px-4 py-4" aria-sort={ariaSort('status')}><SortButton field="status" label="Status" query={query} onSort={onSort} /></th>
              <th className="px-4 py-4" aria-sort={ariaSort('priority')}><SortButton field="priority" label="Priority" query={query} onSort={onSort} /></th>
              <th className="px-4 py-4" aria-sort={ariaSort('dueDate')}><SortButton field="dueDate" label="Due date" query={query} onSort={onSort} /></th>
              <th className="px-4 py-4" aria-sort={ariaSort('createdAt')}><SortButton field="createdAt" label="Created" query={query} onSort={onSort} /></th>
              <th className="px-5 py-4 text-right font-bold uppercase tracking-[0.08em] text-[var(--text-subtle)]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id} className="group border-b border-[var(--border)] transition-colors last:border-b-0 hover:bg-slate-50/65 dark:hover:bg-slate-800/25">
                <td className="px-5 py-4 align-middle">
                  <div className="min-w-0">
                    <p className="line-clamp-2 text-sm font-bold leading-5 text-[var(--text)]">{task.title}</p>
                    <p className="mt-1 text-[10px] font-medium text-[var(--text-subtle)]">TASK-{String(task.id).padStart(3, '0')}</p>
                  </div>
                </td>
                <td className="px-4 py-4 align-middle">
                  <p className="line-clamp-2 max-w-[310px] text-xs leading-5 text-[var(--text-muted)]">{task.description || <span className="italic text-[var(--text-subtle)]">No description</span>}</p>
                </td>
                <td className="px-4 py-4 align-middle">
                  <StatusSelect task={task} disabled={updatingStatusIds.has(task.id)} onChange={onStatusChange} />
                </td>
                <td className="px-4 py-4 align-middle"><PriorityBadge priority={task.priority} /></td>
                <td className="px-4 py-4 align-middle"><DueDate task={task} /></td>
                <td className="px-4 py-4 align-middle">
                  <div className="text-xs text-[var(--text-muted)]">
                    <p className="font-semibold">{formatDate(task.createdAt)}</p>
                    <p className="mt-1 inline-flex items-center gap-1 text-[10px] text-[var(--text-subtle)]"><Clock3 size={10} /> {formatDateTime(task.createdAt, { year: undefined })}</p>
                  </div>
                </td>
                <td className="px-5 py-4 align-middle">
                  <div className="flex items-center justify-end gap-1 opacity-75 transition group-hover:opacity-100">
                    <Button variant="icon" size="icon" onClick={() => onEdit(task)} aria-label={`Edit ${task.title}`} title="Edit task" className="!size-9">
                      <Pencil size={15} />
                    </Button>
                    <Button variant="icon" size="icon" onClick={() => onDelete(task)} aria-label={`Delete ${task.title}`} title="Delete task" className="!size-9 hover:!bg-rose-50 hover:!text-rose-600 dark:hover:!bg-rose-400/10 dark:hover:!text-rose-300">
                      <Trash2 size={15} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}


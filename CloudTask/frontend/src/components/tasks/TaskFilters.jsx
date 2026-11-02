import { RotateCcw, Search, SlidersHorizontal, X } from 'lucide-react'
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from '../../utils/taskConstants'
import { Button } from '../ui/Button'

export default function TaskFilters({ search, onSearchChange, query, onFilterChange, onSortChange, onClear, hasFilters, totalCount, isRefreshing }) {
  return (
    <section className="surface-card p-4 sm:p-5" aria-label="Task filters">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <div className="relative min-w-0 flex-1 xl:max-w-xl">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[var(--text-subtle)]" aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            maxLength={200}
            className="input-control pl-10 pr-10"
            placeholder="Search titles and descriptions…"
            aria-label="Search tasks"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-lg text-[var(--text-subtle)] hover:bg-slate-100 hover:text-[var(--text)] dark:hover:bg-slate-800"
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:flex sm:items-center">
          <div className="relative min-w-0">
            <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-[var(--text-subtle)]" />
            <select
              value={query.status}
              onChange={(event) => onFilterChange({ status: event.target.value })}
              className="input-control min-w-0 appearance-none pl-9 pr-8 sm:w-40"
              aria-label="Filter by status"
            >
              <option value="">All statuses</option>
              {STATUS_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </div>
          <select
            value={query.priority}
            onChange={(event) => onFilterChange({ priority: event.target.value })}
            className="input-control min-w-0 appearance-none pr-8 sm:w-40"
            aria-label="Filter by priority"
          >
            <option value="">All priorities</option>
            {PRIORITY_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          {hasFilters && (
            <Button variant="ghost" onClick={onClear} className="min-[420px]:col-span-2 sm:col-auto">
              <RotateCcw size={15} aria-hidden="true" />
              Clear filters
            </Button>
          )}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-[minmax(0,1fr)_132px] gap-3 md:hidden">
        <select
          value={query.sortBy}
          onChange={(event) => onSortChange({ sortBy: event.target.value, page: 1 })}
          className="input-control min-w-0 appearance-none"
          aria-label="Sort tasks by"
        >
          <option value="createdAt">Sort by created</option>
          <option value="title">Sort by title</option>
          <option value="status">Sort by status</option>
          <option value="priority">Sort by priority</option>
          <option value="dueDate">Sort by due date</option>
        </select>
        <select
          value={query.sortDirection}
          onChange={(event) => onSortChange({ sortDirection: event.target.value, page: 1 })}
          className="input-control appearance-none"
          aria-label="Sort direction"
        >
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-4 text-xs text-[var(--text-muted)]">
        <p><span className="font-bold text-[var(--text)]">{totalCount.toLocaleString()}</span> {totalCount === 1 ? 'task' : 'tasks'} found</p>
        {isRefreshing && <p className="animate-pulse-soft font-medium text-brand-600 dark:text-brand-300">Syncing changes…</p>}
      </div>
    </section>
  )
}


import { ListFilter, Plus, RefreshCw, SearchX } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { updateTaskStatus } from '../api/tasksApi'
import DeleteTaskDialog from '../components/tasks/DeleteTaskDialog'
import Pagination from '../components/tasks/Pagination'
import TaskFilters from '../components/tasks/TaskFilters'
import TaskFormDialog from '../components/tasks/TaskFormDialog'
import TaskTable from '../components/tasks/TaskTable'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { ErrorState } from '../components/ui/ErrorState'
import { TableSkeleton } from '../components/ui/Skeleton'
import { useAppContext } from '../context/AppContext'
import { useDebounce } from '../hooks/useDebounce'
import { useTasks } from '../hooks/useTasks'

export default function Tasks() {
  const {
    tasks,
    pagination,
    query,
    setQuery,
    setFilters,
    resetFilters,
    loading,
    isRefreshing,
    error,
    refresh,
  } = useTasks()
  const { openCreateTask } = useAppContext()
  const [search, setSearch] = useState(query.search)
  const debouncedSearch = useDebounce(search, 350)
  const suppressDebounceRef = useRef(false)
  const [editingTask, setEditingTask] = useState(null)
  const [deletingTask, setDeletingTask] = useState(null)
  const [updatingStatusIds, setUpdatingStatusIds] = useState(() => new Set())

  useEffect(() => {
    if (suppressDebounceRef.current) {
      if (debouncedSearch === '') suppressDebounceRef.current = false
      return
    }
    if (debouncedSearch !== query.search) setFilters({ search: debouncedSearch })
  }, [debouncedSearch, query.search, setFilters])

  const hasFilters = Boolean(search || query.status || query.priority)
  const emptyCopy = useMemo(() => {
    if (hasFilters) {
      return {
        icon: SearchX,
        title: 'No tasks match these filters',
        description: 'Try a different search term or clear the current filters.',
      }
    }
    return {
      icon: ListFilter,
      title: 'No tasks yet',
      description: 'Create your first task to begin organizing the work.',
    }
  }, [hasFilters])

  const handleClear = () => {
    suppressDebounceRef.current = true
    setSearch('')
    resetFilters()
  }

  const handleSort = (field) => {
    setQuery((current) => ({
      sortBy: field,
      sortDirection: current.sortBy === field && current.sortDirection === 'asc' ? 'desc' : 'asc',
      page: 1,
    }))
  }

  const handleStatusChange = async (task, status) => {
    if (status === task.status) return
    setUpdatingStatusIds((current) => new Set(current).add(task.id))
    try {
      await updateTaskStatus(task.id, status)
      toast.success('Status updated', { description: `“${task.title}” is now ${status === 'InProgress' ? 'in progress' : status.toLowerCase()}.` })
    } catch (requestError) {
      toast.error('Could not update status', { description: requestError.message })
    } finally {
      setUpdatingStatusIds((current) => {
        const next = new Set(current)
        next.delete(task.id)
        return next
      })
    }
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow text-brand-600 dark:text-brand-300">Task manager</p>
          <h2 className="mt-2 text-2xl font-bold tracking-[-0.04em] sm:text-[28px]">Every task, one clear view</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-muted)]">Search, sort, filter, and update work without losing your place.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={refresh} disabled={loading || isRefreshing}>
            <RefreshCw size={15} className={isRefreshing ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button size="sm" onClick={openCreateTask}>
            <Plus size={15} /> New task
          </Button>
        </div>
      </div>

      <TaskFilters
        search={search}
        onSearchChange={setSearch}
        query={query}
        onFilterChange={setFilters}
        onSortChange={setQuery}
        onClear={handleClear}
        hasFilters={hasFilters}
        totalCount={pagination.totalCount}
        isRefreshing={isRefreshing}
      />

      <section className="surface-card overflow-hidden" aria-label="Tasks">
        {loading ? (
          <TableSkeleton rows={8} />
        ) : error ? (
          <ErrorState
            title="Tasks could not be loaded"
            description={error.message}
            onRetry={refresh}
          />
        ) : tasks.length === 0 ? (
          <EmptyState
            icon={emptyCopy.icon}
            title={emptyCopy.title}
            description={emptyCopy.description}
            action={
              hasFilters ? (
                <Button variant="secondary" size="sm" onClick={handleClear}>Clear filters</Button>
              ) : (
                <Button size="sm" onClick={openCreateTask}><Plus size={15} /> Create task</Button>
              )
            }
          />
        ) : (
          <TaskTable
            tasks={tasks}
            query={query}
            onSort={handleSort}
            onEdit={setEditingTask}
            onDelete={setDeletingTask}
            onStatusChange={handleStatusChange}
            updatingStatusIds={updatingStatusIds}
          />
        )}

        {!loading && !error && pagination.totalCount > 0 && (
          <Pagination
            {...pagination}
            onPageChange={(page) => setQuery({ page })}
            onPageSizeChange={(pageSize) => setQuery({ pageSize, page: 1 })}
          />
        )}
      </section>

      <TaskFormDialog
        open={Boolean(editingTask)}
        task={editingTask}
        onClose={() => setEditingTask(null)}
        onSaved={() => setEditingTask(null)}
      />
      <DeleteTaskDialog
        open={Boolean(deletingTask)}
        task={deletingTask}
        onClose={() => setDeletingTask(null)}
        onDeleted={() => setDeletingTask(null)}
      />
    </div>
  )
}


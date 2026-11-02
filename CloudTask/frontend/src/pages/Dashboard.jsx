import {
  BadgeCheck,
  CircleDotDashed,
  Gauge,
  ListTodo,
  Plus,
  RefreshCw,
  Siren,
  Timer,
} from 'lucide-react'
import { useState } from 'react'
import CompletionProgress from '../components/dashboard/CompletionProgress'
import PriorityBreakdownChart from '../components/dashboard/PriorityBreakdownChart'
import StatCard from '../components/dashboard/StatCard'
import StatusDistributionChart from '../components/dashboard/StatusDistributionChart'
import TaskListCard from '../components/dashboard/TaskListCard'
import TaskFormDialog from '../components/tasks/TaskFormDialog'
import { Button } from '../components/ui/Button'
import { CardSkeleton } from '../components/ui/Skeleton'
import { ErrorState } from '../components/ui/ErrorState'
import { useAppContext } from '../context/AppContext'
import { useDashboard } from '../hooks/useDashboard'

export default function Dashboard() {
  const {
    stats,
    statusDistribution,
    priorityBreakdown,
    recentTasks,
    upcomingTasks,
    loading,
    isRefreshing,
    hasLoaded,
    error,
    refresh,
  } = useDashboard()
  const { openCreateTask } = useAppContext()
  const [editingTask, setEditingTask] = useState(null)

  const kpis = [
    { label: 'Total tasks', value: stats.totalTasks, helper: 'All saved work items', icon: ListTodo, accent: 'indigo' },
    { label: 'Pending', value: stats.pendingTasks, helper: 'Waiting to be started', icon: Timer, accent: 'amber' },
    { label: 'In progress', value: stats.inProgressTasks, helper: 'Currently moving forward', icon: CircleDotDashed, accent: 'blue' },
    { label: 'Completed', value: stats.completedTasks, helper: 'Finished work items', icon: BadgeCheck, accent: 'emerald' },
    { label: 'Overdue', value: stats.overdueTasks, helper: 'Open tasks past due', icon: Siren, accent: 'rose' },
    { label: 'Completion rate', value: `${Number(stats.completionRate || 0).toFixed(stats.completionRate % 1 === 0 ? 0 : 1)}%`, icon: Gauge, accent: 'violet', progress: Number(stats.completionRate || 0) },
  ]

  if (error && !hasLoaded) {
    return (
      <div className="surface-card">
        <ErrorState
          title="The dashboard could not connect"
          description={error.message}
          onRetry={refresh}
        />
      </div>
    )
  }

  return (
    <div className="animate-fade-in space-y-6 lg:space-y-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow text-brand-600 dark:text-brand-300">Overview</p>
          <h2 className="mt-2 text-2xl font-bold tracking-[-0.04em] sm:text-[28px]">Your work, at a glance</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-muted)]">
            Live statistics, priorities, and deadlines from your CloudTask workspace.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={refresh} disabled={loading || isRefreshing}>
          <RefreshCw size={15} className={isRefreshing ? 'animate-spin' : ''} />
          {isRefreshing ? 'Refreshing…' : 'Refresh data'}
        </Button>
      </div>

      {error && !loading && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-200" role="alert">
          The latest refresh failed: {error.message} The last loaded data remains visible.
        </div>
      )}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          {Array.from({ length: 6 }, (_, index) => <CardSkeleton key={index} />)}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          {kpis.map((kpi) => <StatCard key={kpi.label} {...kpi} />)}
        </div>
      )}

      {!loading && stats.totalTasks === 0 && (
        <section className="relative overflow-hidden rounded-2xl border border-brand-200 bg-brand-50 px-5 py-5 dark:border-brand-500/20 dark:bg-brand-500/8 sm:flex sm:items-center sm:justify-between sm:px-6">
          <div className="relative">
            <p className="text-sm font-bold text-brand-900 dark:text-brand-100">A clean slate is a good place to start.</p>
            <p className="mt-1 text-xs leading-5 text-brand-700/80 dark:text-brand-200/70">Create your first task and the dashboard will update automatically.</p>
          </div>
          <Button onClick={openCreateTask} size="sm" className="mt-4 sm:mt-0">
            <Plus size={15} /> Create first task
          </Button>
        </section>
      )}

      {!loading && (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          <StatusDistributionChart data={statusDistribution} total={stats.totalTasks} />
          <PriorityBreakdownChart data={priorityBreakdown} />
          <CompletionProgress rate={stats.completionRate} completed={stats.completedTasks} total={stats.totalTasks} />
        </div>
      )}

      {!loading && (
        <div className="grid gap-4 xl:grid-cols-2">
          <TaskListCard
            eyebrow="Activity"
            title="Recent tasks"
            description="The five most recently created work items."
            tasks={recentTasks}
            onEdit={setEditingTask}
          />
          <TaskListCard
            eyebrow="Deadlines"
            title="Upcoming & overdue"
            description="The next deadlines that need your attention."
            tasks={upcomingTasks}
            mode="upcoming"
            onEdit={setEditingTask}
          />
        </div>
      )}

      <TaskFormDialog
        open={Boolean(editingTask)}
        task={editingTask}
        onClose={() => setEditingTask(null)}
        onSaved={() => setEditingTask(null)}
      />
    </div>
  )
}


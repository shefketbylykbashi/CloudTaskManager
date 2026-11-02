import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  CircleDot,
  Clock3,
  Minus,
} from 'lucide-react'

const toneStyles = {
  neutral:
    'border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300',
  blue:
    'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-300',
  amber:
    'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-300',
  green:
    'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300',
  violet:
    'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-400/20 dark:bg-violet-400/10 dark:text-violet-300',
  rose:
    'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-300',
}

const sizeStyles = {
  sm: 'gap-1 px-2 py-1 text-[11px]',
  md: 'gap-1.5 px-2.5 py-1 text-xs',
}

const statusConfig = {
  pending: { label: 'Pending', tone: 'amber', icon: Clock3 },
  inprogress: { label: 'In progress', tone: 'blue', icon: CircleDot },
  completed: { label: 'Completed', tone: 'green', icon: CheckCircle2 },
}

const priorityConfig = {
  low: { label: 'Low', tone: 'neutral', icon: ArrowDown },
  medium: { label: 'Medium', tone: 'violet', icon: Minus },
  high: { label: 'High', tone: 'rose', icon: ArrowUp },
}

function normalizeValue(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[\s_-]/g, '')
}

export function Badge({
  children,
  tone = 'neutral',
  size = 'sm',
  icon: Icon,
  className = '',
  ...props
}) {
  return (
    <span
      className={`inline-flex w-fit items-center whitespace-nowrap rounded-full border font-semibold leading-none ${toneStyles[tone] ?? toneStyles.neutral} ${sizeStyles[size] ?? sizeStyles.sm} ${className}`}
      {...props}
    >
      {Icon && <Icon aria-hidden="true" className="h-3 w-3" />}
      {children}
    </span>
  )
}

export function StatusBadge({ status, ...props }) {
  const normalizedStatus = normalizeValue(status)
  const config = statusConfig[normalizedStatus] ?? {
    label: status || 'Unknown',
    tone: 'neutral',
    icon: CircleDot,
  }

  return (
    <Badge tone={config.tone} icon={config.icon} {...props}>
      {config.label}
    </Badge>
  )
}

export function PriorityBadge({ priority, ...props }) {
  const normalizedPriority = normalizeValue(priority)
  const config = priorityConfig[normalizedPriority] ?? {
    label: priority || 'Unknown',
    tone: 'neutral',
    icon: Minus,
  }

  return (
    <Badge tone={config.tone} icon={config.icon} {...props}>
      {config.label}
    </Badge>
  )
}


import { RefreshCw, TriangleAlert } from 'lucide-react'
import { Button } from './Button'

export function ErrorState({
  title = 'We could not load this content',
  description,
  message,
  onRetry,
  retryLabel = 'Try again',
  compact = false,
  className = '',
}) {
  return (
    <div
      role="alert"
      className={`flex flex-col items-center justify-center px-6 text-center ${compact ? 'py-8' : 'py-14 sm:py-16'} ${className}`}
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-300">
        <TriangleAlert aria-hidden="true" className="h-5 w-5" />
      </div>
      <h3 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h3>
      {(description || message) && (
        <p className="mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
          {description || message}
        </p>
      )}
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry} className="mt-5">
          <RefreshCw aria-hidden="true" className="h-3.5 w-3.5" />
          {retryLabel}
        </Button>
      )}
    </div>
  )
}


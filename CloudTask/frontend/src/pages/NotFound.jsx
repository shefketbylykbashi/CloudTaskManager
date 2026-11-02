import { ArrowLeft, CloudOff } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="surface-card flex min-h-[62vh] flex-col items-center justify-center px-6 py-16 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
        <CloudOff size={28} />
      </div>
      <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-brand-600 dark:text-brand-300">Error 404</p>
      <h2 className="mt-2 text-2xl font-bold tracking-[-0.04em]">This page drifted out of view</h2>
      <p className="mt-3 max-w-md text-sm leading-6 text-[var(--text-muted)]">The page you requested does not exist or may have moved. Your tasks are still right where you left them.</p>
      <Link
        to="/"
        className="mt-7 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm shadow-indigo-600/20 transition hover:bg-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:bg-indigo-500 dark:hover:bg-indigo-400"
      >
        <ArrowLeft size={16} /> Back to dashboard
      </Link>
    </div>
  )
}


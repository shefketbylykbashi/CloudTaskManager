import { CalendarDays, Menu, Moon, Plus, Sun } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'
import { Button } from '../ui/Button'

const pageDetails = {
  '/': {
    title: 'Dashboard',
    subtitle: 'A clear view of your workload and momentum.',
  },
  '/tasks': {
    title: 'Tasks',
    subtitle: 'Plan, prioritize, and move work forward.',
  },
}

function formatToday() {
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date())
}

export default function Header({ onMenuClick, menuButtonRef }) {
  const { pathname } = useLocation()
  const { theme, toggleTheme, openCreateTask } = useAppContext()
  const details = pageDetails[pathname] ?? {
    title: 'CloudTask',
    subtitle: 'Your cloud workspace.',
  }

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--app-bg)_88%,transparent)] backdrop-blur-xl">
      <div className="mx-auto flex h-[76px] max-w-[1680px] items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          ref={menuButtonRef}
          type="button"
          onClick={onMenuClick}
          className="inline-flex size-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] transition hover:text-[var(--text)] lg:hidden"
          aria-label="Open navigation"
        >
          <Menu size={19} />
        </button>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-bold tracking-[-0.025em] sm:text-xl">{details.title}</h1>
          <p className="hidden truncate text-xs text-[var(--text-muted)] sm:block sm:text-sm">
            {details.subtitle}
          </p>
        </div>

        <div className="hidden items-center gap-2 text-sm text-[var(--text-muted)] xl:flex">
          <CalendarDays size={16} aria-hidden="true" />
          <time dateTime={new Date().toISOString().slice(0, 10)}>{formatToday()}</time>
        </div>

        <div className="mx-1 hidden h-7 w-px bg-[var(--border)] sm:block" />

        <button
          type="button"
          onClick={toggleTheme}
          className="inline-flex size-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] transition hover:-translate-y-0.5 hover:border-brand-300 hover:text-brand-600 dark:hover:border-brand-800 dark:hover:text-brand-300"
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <Button onClick={openCreateTask} className="shrink-0 max-[419px]:!w-10 max-[419px]:!px-0" aria-label="Create a new task">
          <Plus size={17} aria-hidden="true" />
          <span className="hidden sm:inline">New task</span>
          <span className="hidden min-[420px]:inline sm:hidden">New</span>
        </Button>
      </div>
    </header>
  )
}


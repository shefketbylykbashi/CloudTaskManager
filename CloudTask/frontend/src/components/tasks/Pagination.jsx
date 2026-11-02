import { ChevronLeft, ChevronRight } from 'lucide-react'
import { PAGE_SIZE_OPTIONS } from '../../utils/taskConstants'
import { Button } from '../ui/Button'

function pageRange(current, total) {
  const values = new Set([1, total, current - 1, current, current + 1])
  const pages = [...values].filter((page) => page >= 1 && page <= total).sort((a, b) => a - b)
  const result = []
  pages.forEach((page, index) => {
    if (index > 0 && page - pages[index - 1] > 1) result.push(`gap-${page}`)
    result.push(page)
  })
  return result
}

export default function Pagination({ page, pageSize, totalPages, totalCount, onPageChange, onPageSizeChange }) {
  const from = totalCount === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, totalCount)

  return (
    <div className="flex flex-col gap-4 border-t border-[var(--border)] px-4 py-4 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--text-muted)] sm:text-sm lg:justify-start">
        <span>Showing <strong className="text-[var(--text)]">{from}–{to}</strong> of <strong className="text-[var(--text)]">{totalCount}</strong></span>
        <label className="flex items-center gap-2">
          <span>Rows</span>
          <select
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            className="h-9 rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] px-2 text-xs font-semibold text-[var(--text)]"
          >
            {PAGE_SIZE_OPTIONS.map((size) => <option key={size} value={size}>{size}</option>)}
          </select>
        </label>
      </div>

      <nav className="flex items-center justify-center gap-1" aria-label="Task pages">
        <Button variant="icon" size="icon" onClick={() => onPageChange(page - 1)} disabled={page <= 1} aria-label="Previous page">
          <ChevronLeft size={17} />
        </Button>
        <div className="hidden items-center gap-1 sm:flex">
          {pageRange(page, Math.max(totalPages, 1)).map((item) =>
            typeof item === 'string' ? (
              <span key={item} className="inline-flex size-9 items-center justify-center text-[var(--text-subtle)]">…</span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => onPageChange(item)}
                className={`inline-flex size-9 items-center justify-center rounded-lg text-xs font-bold transition ${
                  item === page
                    ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/20'
                    : 'text-[var(--text-muted)] hover:bg-slate-100 hover:text-[var(--text)] dark:hover:bg-slate-800'
                }`}
                aria-current={item === page ? 'page' : undefined}
              >
                {item}
              </button>
            ),
          )}
        </div>
        <span className="px-2 text-xs font-medium text-[var(--text-muted)] sm:hidden">{page} / {Math.max(totalPages, 1)}</span>
        <Button variant="icon" size="icon" onClick={() => onPageChange(page + 1)} disabled={page >= Math.max(totalPages, 1)} aria-label="Next page">
          <ChevronRight size={17} />
        </Button>
      </nav>
    </div>
  )
}


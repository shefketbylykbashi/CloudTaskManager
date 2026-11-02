import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { Button } from './Button'

const sizeStyles = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

export function Modal({
  open,
  isOpen = false,
  onClose,
  title,
  description,
  children,
  size = 'md',
  className = '',
  contentClassName = '',
  showClose = true,
  ariaLabel,
}) {
  const visible = open ?? isOpen
  const panelRef = useRef(null)
  const onCloseRef = useRef(onClose)
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!visible) return undefined

    const previousActiveElement = document.activeElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const focusTimer = window.setTimeout(() => {
      const firstFocusable =
        panelRef.current?.querySelector('[data-autofocus]') ??
        panelRef.current?.querySelector(focusableSelector)
      ;(firstFocusable ?? panelRef.current)?.focus()
    }, 0)

    const handleEscape = (event) => {
      if (event.key === 'Escape') onCloseRef.current?.()
    }

    document.addEventListener('keydown', handleEscape)

    return () => {
      window.clearTimeout(focusTimer)
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = previousOverflow
      previousActiveElement?.focus?.()
    }
  }, [visible])

  if (!visible || typeof document === 'undefined') return null

  const handlePanelKeyDown = (event) => {
    if (event.key !== 'Tab' || !panelRef.current) return

    const focusableElements = Array.from(
      panelRef.current.querySelectorAll(focusableSelector),
    )

    if (focusableElements.length === 0) {
      event.preventDefault()
      panelRef.current.focus()
      return
    }

    const firstElement = focusableElements[0]
    const lastElement = focusableElements.at(-1)

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault()
      lastElement.focus()
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault()
      firstElement.focus()
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.()
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={!title ? ariaLabel : undefined}
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        onKeyDown={handlePanelKeyDown}
        className={`flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/20 outline-none sm:rounded-2xl dark:border-slate-800 dark:bg-slate-900 ${sizeStyles[size] ?? sizeStyles.md} ${className}`}
      >
        {(title || description || showClose) && (
          <div className="flex items-start gap-4 border-b border-slate-200 px-5 py-5 sm:px-6 dark:border-slate-800">
            <div className="min-w-0 flex-1">
              {title && (
                <h2
                  id={titleId}
                  className="text-lg font-bold tracking-tight text-slate-950 dark:text-white"
                >
                  {title}
                </h2>
              )}
              {description && (
                <p
                  id={descriptionId}
                  className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400"
                >
                  {description}
                </p>
              )}
            </div>
            {showClose && (
              <Button
                variant="icon"
                onClick={onClose}
                aria-label="Close dialog"
                className="-mr-2 -mt-1"
              >
                <X aria-hidden="true" className="h-5 w-5" />
              </Button>
            )}
          </div>
        )}

        <div className={`min-h-0 flex-1 overflow-y-auto ${contentClassName}`}>
          {children}
        </div>
      </div>
    </div>,
    document.body,
  )
}


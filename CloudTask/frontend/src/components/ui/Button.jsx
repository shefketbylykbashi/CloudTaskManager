import { forwardRef } from 'react'
import { LoaderCircle } from 'lucide-react'

const variantStyles = {
  primary:
    'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20 hover:bg-indigo-500 active:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:active:bg-indigo-600',
  secondary:
    'border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50 active:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800',
  ghost:
    'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-950 active:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white dark:active:bg-slate-700',
  danger:
    'bg-rose-600 text-white shadow-sm shadow-rose-600/20 hover:bg-rose-500 active:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-400',
  icon:
    'bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-950 active:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white dark:active:bg-slate-700',
}

const sizeStyles = {
  sm: 'h-9 gap-1.5 rounded-lg px-3 text-xs',
  md: 'h-10 gap-2 rounded-xl px-4 text-sm',
  lg: 'h-12 gap-2.5 rounded-xl px-5 text-sm',
  icon: 'h-10 w-10 rounded-xl p-0',
}

export const Button = forwardRef(function Button(
  {
    children,
    className = '',
    variant = 'primary',
    size = 'md',
    loading = false,
    loadingText,
    disabled,
    type = 'button',
    ...props
  },
  ref,
) {
  const resolvedSize = variant === 'icon' && size === 'md' ? 'icon' : size

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={`inline-flex shrink-0 items-center justify-center font-semibold transition duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus-visible:ring-offset-slate-950 ${variantStyles[variant] ?? variantStyles.primary} ${sizeStyles[resolvedSize] ?? sizeStyles.md} ${className}`}
      {...props}
    >
      {loading && <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />}
      {loading && loadingText ? loadingText : children}
    </button>
  )
})


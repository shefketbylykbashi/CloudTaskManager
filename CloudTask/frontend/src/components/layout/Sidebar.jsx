import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  ListTodo,
  Sparkles,
  X,
} from 'lucide-react'
import { useEffect, useRef } from 'react'
import { NavLink } from 'react-router-dom'
import { cn } from '../../utils/cn'

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

const navigation = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/tasks', label: 'Tasks', icon: ListTodo },
]

function SidebarContent({ collapsed, onCollapse, mobile = false, onMobileClose, closeButtonRef }) {
  return (
    <div className="flex h-full flex-col">
      <div className={cn('flex h-[76px] items-center border-b border-white/8', collapsed ? 'justify-center px-3' : 'px-5')}>
        <NavLink to="/" className="flex min-w-0 items-center gap-3" aria-label="CloudTask home">
          <img src="/cloudtask-mark.svg" alt="" className="size-10 shrink-0 rounded-xl shadow-lg shadow-indigo-950/20" />
          {!collapsed && (
            <div className="min-w-0 animate-fade-in">
              <p className="truncate text-[15px] font-bold tracking-[-0.02em] text-white">CloudTask</p>
              <p className="truncate text-[10px] font-semibold uppercase tracking-[0.15em] text-indigo-200/60">Manager</p>
            </div>
          )}
        </NavLink>
        {mobile && (
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onMobileClose}
            className="ml-auto inline-flex size-9 items-center justify-center rounded-lg text-indigo-100/70 hover:bg-white/10 hover:text-white"
            aria-label="Close navigation"
          >
            <X size={19} />
          </button>
        )}
      </div>

      <nav className={cn('flex-1 space-y-1.5 py-6', collapsed ? 'px-3' : 'px-4')} aria-label="Primary navigation">
        {!collapsed && <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-200/40">Workspace</p>}
        {navigation.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              cn(
                'group relative flex h-11 items-center rounded-xl text-sm font-semibold transition-all duration-200',
                collapsed ? 'justify-center px-2' : 'gap-3 px-3',
                isActive
                  ? 'bg-white text-indigo-700 shadow-[0_8px_24px_rgba(15,23,42,0.18)]'
                  : 'text-indigo-100/70 hover:bg-white/8 hover:text-white',
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={19} strokeWidth={isActive ? 2.4 : 2} aria-hidden="true" />
                {!collapsed && <span>{label}</span>}
                {isActive && !collapsed && <span className="ml-auto size-1.5 rounded-full bg-indigo-500" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className={cn('border-t border-white/8', collapsed ? 'p-3' : 'p-4')}>
        {!collapsed && (
          <div className="mb-4 rounded-2xl border border-white/8 bg-white/[0.055] p-3.5">
            <div className="mb-2 flex items-center gap-2 text-indigo-100">
              <Sparkles size={15} className="text-indigo-300" />
              <span className="text-xs font-semibold">Stay focused</span>
            </div>
            <p className="text-[11px] leading-relaxed text-indigo-200/55">Small, clear next steps build real momentum.</p>
          </div>
        )}
        {!mobile && (
          <button
            type="button"
            onClick={onCollapse}
            className={cn(
              'flex h-10 w-full items-center rounded-xl text-xs font-semibold text-indigo-100/60 transition hover:bg-white/8 hover:text-white',
              collapsed ? 'justify-center' : 'gap-2.5 px-3',
            )}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            {!collapsed && <span>Collapse sidebar</span>}
          </button>
        )}
      </div>
    </div>
  )
}

export default function Sidebar({ collapsed, mobileOpen, onCollapse, onMobileClose, menuButtonRef }) {
  const mobilePanelRef = useRef(null)
  const closeButtonRef = useRef(null)
  const onMobileCloseRef = useRef(onMobileClose)

  useEffect(() => {
    onMobileCloseRef.current = onMobileClose
  }, [onMobileClose])

  useEffect(() => {
    if (!mobileOpen) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const focusTimer = window.setTimeout(() => closeButtonRef.current?.focus(), 0)
    const handleEscape = (event) => {
      if (event.key === 'Escape') onMobileCloseRef.current?.()
    }
    document.addEventListener('keydown', handleEscape)

    return () => {
      window.clearTimeout(focusTimer)
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = previousOverflow
      window.setTimeout(() => menuButtonRef?.current?.focus(), 0)
    }
  }, [mobileOpen, menuButtonRef])

  const trapMobileFocus = (event) => {
    if (event.key !== 'Tab' || !mobilePanelRef.current) return
    const focusable = [...mobilePanelRef.current.querySelectorAll(focusableSelector)]
    if (!focusable.length) return
    const first = focusable[0]
    const last = focusable.at(-1)
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  return (
    <>
      <aside
        ref={mobilePanelRef}
        className={cn(
          'fixed inset-y-0 left-0 z-40 hidden overflow-hidden bg-[#191b46] transition-[width] duration-300 lg:block',
          collapsed ? 'w-[88px]' : 'w-[264px]',
        )}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_5%,rgba(110,117,255,0.23),transparent_32%),radial-gradient(circle_at_100%_100%,rgba(79,70,229,0.18),transparent_35%)]" />
        <div className="relative h-full">
          <SidebarContent collapsed={collapsed} onCollapse={onCollapse} />
        </div>
      </aside>

      <div
        className={cn(
          'fixed inset-0 z-50 bg-slate-950/55 backdrop-blur-sm transition-opacity duration-200 lg:hidden',
          mobileOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onMobileClose}
        aria-hidden="true"
      />
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-[282px] bg-[#191b46] shadow-2xl transition-transform duration-300 lg:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
        aria-label="Mobile navigation"
        aria-hidden={!mobileOpen}
        aria-modal={mobileOpen ? 'true' : undefined}
        role={mobileOpen ? 'dialog' : undefined}
        inert={!mobileOpen ? true : undefined}
        onKeyDown={trapMobileFocus}
      >
        <SidebarContent collapsed={false} mobile onMobileClose={onMobileClose} closeButtonRef={closeButtonRef} />
      </aside>
    </>
  )
}


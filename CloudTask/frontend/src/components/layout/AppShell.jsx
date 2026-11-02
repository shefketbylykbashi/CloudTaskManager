import { useEffect, useRef, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'
import TaskFormDialog from '../tasks/TaskFormDialog'
import Header from './Header'
import Sidebar from './Sidebar'

export default function AppShell() {
  const location = useLocation()
  const { createTaskOpen, closeCreateTask, notifyTasksChanged } = useAppContext()
  const [mobileOpen, setMobileOpen] = useState(false)
  const menuButtonRef = useRef(null)
  const [collapsed, setCollapsed] = useState(
    () => window.localStorage.getItem('cloudtask-sidebar-collapsed') === 'true',
  )

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  useEffect(() => {
    window.localStorage.setItem('cloudtask-sidebar-collapsed', String(collapsed))
  }, [collapsed])

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--text)]">
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCollapse={() => setCollapsed((value) => !value)}
        onMobileClose={() => setMobileOpen(false)}
        menuButtonRef={menuButtonRef}
      />

      <div
        className={`min-h-screen transition-[padding] duration-300 ${
          collapsed ? 'lg:pl-[88px]' : 'lg:pl-[264px]'
        }`}
        inert={mobileOpen ? true : undefined}
        aria-hidden={mobileOpen ? 'true' : undefined}
      >
        <Header onMenuClick={() => setMobileOpen(true)} menuButtonRef={menuButtonRef} />
        <main className="mx-auto w-full max-w-[1680px] px-4 pb-10 pt-6 sm:px-6 lg:px-8 lg:pt-8">
          <Outlet />
        </main>
      </div>

      <TaskFormDialog
        open={createTaskOpen}
        onClose={closeCreateTask}
        onSaved={() => {
          notifyTasksChanged()
          closeCreateTask()
        }}
      />
    </div>
  )
}


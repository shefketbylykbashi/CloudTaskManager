import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

const AppContext = createContext(null)
const THEME_STORAGE_KEY = 'cloudtask-theme'

function getResolvedTheme() {
  if (typeof window === 'undefined') return 'light'

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
  if (storedTheme === 'light' || storedTheme === 'dark') return storedTheme

  return window.matchMedia?.('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

export function AppProvider({ children }) {
  const [theme, setTheme] = useState(getResolvedTheme)
  const [createTaskOpen, setCreateTaskOpen] = useState(false)
  const [dataVersion, setDataVersion] = useState(0)

  useEffect(() => {
    const root = document.documentElement
    const isDark = theme === 'dark'

    root.classList.toggle('dark', isDark)
    root.style.colorScheme = theme
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'))
  }, [])

  const openCreateTask = useCallback(() => setCreateTaskOpen(true), [])
  const closeCreateTask = useCallback(() => setCreateTaskOpen(false), [])
  const notifyTasksChanged = useCallback(() => {
    setDataVersion((version) => version + 1)
  }, [])

  const value = useMemo(
    () => ({
      theme,
      toggleTheme,
      createTaskOpen,
      openCreateTask,
      closeCreateTask,
      dataVersion,
      notifyTasksChanged,
    }),
    [
      theme,
      toggleTheme,
      createTaskOpen,
      openCreateTask,
      closeCreateTask,
      dataVersion,
      notifyTasksChanged,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useAppContext() {
  const context = useContext(AppContext)

  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider')
  }

  return context
}


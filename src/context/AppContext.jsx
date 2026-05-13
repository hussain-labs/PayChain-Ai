// ─────────────────────────────────────────────────────────────────────────────
// PayChain AI — AppContext
// Global UI state: sidebar, notifications, active page
// ─────────────────────────────────────────────────────────────────────────────
import { createContext, useContext, useState, useCallback } from 'react'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [sidebarOpen, setSidebarOpen]     = useState(true)
  const [notifications, setNotifications] = useState([])
  const [activePage, setActivePage]       = useState('dashboard')

  const toggleSidebar = useCallback(() => setSidebarOpen(prev => !prev), [])

  const addNotification = useCallback((note) => {
    const id = Date.now()
    setNotifications(prev => [...prev, { id, ...note }])
    setTimeout(() => removeNotification(id), note.duration ?? 4000)
  }, [])

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  return (
    <AppContext.Provider value={{
      sidebarOpen, toggleSidebar,
      notifications, addNotification, removeNotification,
      activePage, setActivePage,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

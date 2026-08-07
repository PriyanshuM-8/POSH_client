import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { getUser, setSession, clearSession } from '@/lib/auth'
import { getMeService } from '@/services/authService'

const PoshContext = createContext()

export function PoshProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => getUser())
  const [authLoading, setAuthLoading] = useState(true)
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const [isOffline, setIsOffline] = useState(!navigator.onLine)

  // Company settings loaded from localStorage
  const [companySettings, setCompanySettings] = useState(() => {
    const saved = localStorage.getItem('posh_company_settings')
    return saved ? JSON.parse(saved) : {
      name: 'Sentinel Org',
      address: '123 Corporate Blvd, Suite 100',
      email: 'posh.compliance@sentinel.org',
      acknowledgementSla: '7',
      investigationSla: '90',
      mfaRequired: false,
      anonymityAllowed: true
    }
  })

  const revalidateAuth = useCallback(async () => {
    const token = localStorage.getItem('posh_token')
    const expires = localStorage.getItem('posh_token_expires')
    
    // Check if token has expired
    if (token && expires && Date.now() > parseInt(expires)) {
      clearSession()
      setAuthLoading(false)
      setCurrentUser(null)
      return
    }
    
    if (!token) {
      setAuthLoading(false)
      return
    }

    try {
      const user = await getMeService()
      setCurrentUser(user)
      localStorage.setItem('posh_user', JSON.stringify(user))
    } catch (err) {
      // If it's an explicit 401/403, we must log out.
      // If there is no response (network error) or 500, we DO NOT log out.
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        clearSession()
        setCurrentUser(null)
      }
    } finally {
      setAuthLoading(false)
    }
  }, [])

  // Network Event Listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false)
      toast.success('Connection restored! Revalidating...')
      // Controlled revalidation after reconnect
      revalidateAuth()
    }
    const handleOffline = () => setIsOffline(true)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [revalidateAuth])

  // Rehydrate user from backend on mount
  useEffect(() => {
    revalidateAuth()
  }, [revalidateAuth])

  const login = useCallback((token, user, rememberMe = false) => {
    setSession(token, user, rememberMe)
    setCurrentUser(user)
  }, [])

  const handleLogout = useCallback((navigate) => {
    clearSession()
    setCurrentUser(null)
    navigate('/login', { replace: true })
    toast('Logged out securely')
  }, [])

  const addAuditLog = useCallback((action) => {
    console.log(`[Audit Log] ${action}`)
  }, [])

  return (
    <PoshContext.Provider value={{
      currentUser,
      setCurrentUser,
      authLoading,
      isOffline,
      login,
      handleLogout,
      companySettings,
      setCompanySettings,
      unreadNotificationCount,
      setUnreadNotificationCount,
      sidebarCollapsed,
      setSidebarCollapsed,
      addAuditLog,
    }}>
      {children}
    </PoshContext.Provider>
  )
}

export function usePosh() {
  const context = useContext(PoshContext)
  if (!context) throw new Error('usePosh must be used within a PoshProvider')
  return context
}

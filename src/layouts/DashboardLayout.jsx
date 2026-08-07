import React, { useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'
import { usePosh } from '@/context/PoshContext'
import { Skeleton } from '@/components/ui/Skeleton'

export default function DashboardLayout() {
  const [dark, setDark] = useState(() => localStorage.getItem('posh_dark') === 'true')
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { currentUser, authLoading } = usePosh()

  useEffect(() => {
    if (!authLoading && !currentUser) {
      navigate('/login', { replace: true })
    }
  }, [currentUser, authLoading])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('posh_dark', dark)
  }, [dark])

  if (authLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#2563EB] border-t-transparent" />
          <p className="text-sm font-medium text-slate-500">Loading workspace…</p>
        </div>
      </div>
    )
  }

  if (!currentUser) return null

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#F8FAFC] dark:bg-slate-900">
      <Sidebar mobileSidebarOpen={mobileSidebarOpen} setMobileSidebarOpen={setMobileSidebarOpen} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar dark={dark} setDark={setDark} setMobileSidebarOpen={setMobileSidebarOpen} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="fade-in"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}

import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Moon, Sun, Menu } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { usePosh } from '@/context/PoshContext'
import { getRoleLabel } from '@/lib/auth'

function getInitials(name = '') {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

export default function Navbar({ dark, setDark, setMobileSidebarOpen }) {
  const { currentUser, handleLogout } = usePosh()
  const user = currentUser || {}
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-200/70 bg-white/80 px-4 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/80 sm:px-6">
      <button
        onClick={() => setMobileSidebarOpen(true)}
        className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5 lg:hidden"
        aria-label="Open sidebar"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="flex-1" />

      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          onClick={() => setDark(!dark)}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5"
          aria-label="Toggle dark mode"
        >
          {dark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
        </button>

        <button
          onClick={() => navigate('/notifications')}
          className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5"
          aria-label="Notifications"
        >
          <Bell className="h-[18px] w-[18px]" />
        </button>

        <div className="mx-1 h-8 w-px bg-slate-200 dark:bg-white/10" />

        <button
          onClick={() => navigate('/my-profile')}
          className="flex items-center gap-2.5 rounded-xl py-1.5 pl-1.5 pr-3 hover:bg-slate-100 dark:hover:bg-white/5"
        >
          <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-[#2563EB] text-xs font-semibold text-white">
            {user.profileImage?.url
              ? <img src={user.profileImage.url} alt="" className="h-8 w-8 object-cover" />
              : getInitials(user.fullName)
            }
          </div>
          <div className="hidden text-left leading-tight sm:block">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-100">{user.fullName || 'User'}</p>
            <Badge variant="default" className="mt-0.5 px-1.5 py-0 text-[10px]">
              {getRoleLabel(user.role)}
            </Badge>
          </div>
        </button>
      </div>
    </header>
  )
}

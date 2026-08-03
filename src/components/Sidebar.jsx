import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutGrid, FileText, FolderKanban, Users2, Gavel, ShieldCheck,
  BarChart3, ScrollText, Bell, Settings, LogOut, ChevronLeft,
  ShieldHalf, PlusCircle, ClipboardList, User, MessageSquare, FolderOpen
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePosh } from '@/context/PoshContext'
import { getRoleLabel } from '@/lib/auth'

// Navigation map keyed by backend role enum
const NAV_MAP = {
  COMPANY_OWNER: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
    { to: '/posh-admins', label: 'POSH Admin Management', icon: Users2 },
    { to: '/owner-complaints', label: 'POSH Admin Complaints', icon: FileText },
    { to: '/reports-analytics', label: 'Reports & Analytics', icon: BarChart3 },
    { to: '/notifications', label: 'Notifications', icon: Bell },
    { to: '/settings', label: 'Company Settings', icon: Settings },
    { to: '/my-profile', label: 'My Profile', icon: User },
  ],
  POSH_ADMIN: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
    { to: '/complaints/new', label: 'Submit Own Complaint', icon: PlusCircle },
    { to: '/my-complaints', label: 'Track Own Complaint', icon: ClipboardList },
    { to: '/employees', label: 'Employee Management', icon: Users2 },
    { to: '/committee', label: 'Committee', icon: ShieldCheck },
    { to: '/complaints', label: 'Complaints', icon: FileText },
    { to: '/cases', label: 'Cases Workspace', icon: FolderKanban },
    { to: '/hearings', label: 'Hearings & Schedule', icon: Gavel },
    { to: '/recommendations', label: 'Recommendations', icon: ClipboardList },
    { to: '/reports', label: 'Reports & Charts', icon: BarChart3 },
    { to: '/audit-logs', label: 'Audit Logs', icon: ScrollText },
    { to: '/notifications', label: 'Notifications', icon: Bell },
    { to: '/settings', label: 'System Settings', icon: Settings },
  ],
  HR_SPOC: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
    { to: '/employees', label: 'Employee Management', icon: Users2 },
    { to: '/complaints', label: 'Complaints', icon: FileText },
    { to: '/cases', label: 'Cases Workspace', icon: FolderKanban },
    { to: '/notifications', label: 'Notifications', icon: Bell },
    { to: '/my-profile', label: 'My Profile', icon: User },
  ],
  EMPLOYEE: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
    { to: '/complaints/new', label: 'Submit Complaint', icon: PlusCircle },
    { to: '/my-complaints', label: 'Track Complaint', icon: ClipboardList },
    { to: '/my-documents', label: 'My Documents', icon: FolderOpen },
    { to: '/notifications', label: 'Notifications', icon: Bell },
    { to: '/help', label: 'Help Center', icon: MessageSquare },
    { to: '/my-profile', label: 'My Profile', icon: User },
  ],
  IC_MEMBER: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
    { to: '/cases', label: 'Assigned Cases', icon: FolderKanban },
    { to: '/hearings', label: 'Hearings Calendar', icon: Gavel },
    { to: '/recommendations', label: 'Recommendations', icon: ClipboardList },
    { to: '/notifications', label: 'Notifications', icon: Bell },
    { to: '/my-profile', label: 'My Profile', icon: User },
  ],
  EXTERNAL_MEMBER: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
    { to: '/cases', label: 'Assigned Cases', icon: FolderKanban },
    { to: '/hearings', label: 'Meeting Schedule', icon: Gavel },
    { to: '/recommendations', label: 'Recommendations', icon: ClipboardList },
    { to: '/notifications', label: 'Notifications', icon: Bell },
    { to: '/my-profile', label: 'My Profile', icon: User },
  ],
  LEGAL: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
    { to: '/cases', label: 'Cases for Review', icon: FolderKanban },
    { to: '/notifications', label: 'Notifications', icon: Bell },
    { to: '/my-profile', label: 'My Profile', icon: User },
  ],
}

function getInitials(name = '') {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

export default function Sidebar({ mobileSidebarOpen, setMobileSidebarOpen }) {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const { currentUser, handleLogout } = usePosh()
  const user = currentUser || {}
  const nav = NAV_MAP[user.role] || NAV_MAP.EMPLOYEE

  return (
    <>
      {/* Mobile backdrop */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <motion.aside
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ type: 'spring', stiffness: 260, damping: 28 }}
        className={cn(
          "relative shrink-0 flex-col border-r border-slate-200/70 bg-white dark:border-white/10 dark:bg-slate-900 lg:flex",
          mobileSidebarOpen 
            ? "fixed inset-y-0 left-0 z-50 flex shadow-2xl" 
            : "hidden lg:flex"
        )}
      >
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 border-b border-slate-100 px-4 dark:border-white/5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#2563EB] shadow-lg">
          <ShieldHalf className="h-5 w-5 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="truncate text-sm font-bold text-slate-800 dark:text-white">Sentinel POSH</p>
            <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              {getRoleLabel(user.role)}
            </p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2.5 py-3">
        {nav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setMobileSidebarOpen(false)}
            className={({ isActive }) =>
              cn(
                'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-blue-50 text-[#2563EB] dark:bg-blue-500/10 dark:text-blue-300'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-slate-100'
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="active-pill"
                    className="absolute left-0 h-6 w-1 rounded-r-full bg-[#2563EB]"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon className="h-[18px] w-[18px] shrink-0" />
                {!collapsed && <span className="flex-1 truncate">{label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User card */}
      {!collapsed && (
        <div className="mx-3 my-2 flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50/50 p-2.5 dark:border-white/5 dark:bg-white/5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#2563EB] text-xs font-semibold text-white">
            {user.profileImage?.url
              ? <img src={user.profileImage.url} alt="" className="h-8 w-8 rounded-full object-cover" />
              : getInitials(user.fullName)
            }
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-slate-800 dark:text-white">{user.fullName || 'User'}</p>
            <p className="truncate text-[10px] text-slate-400">{user.email || ''}</p>
          </div>
        </div>
      )}

      {/* Logout */}
      <div className="border-t border-slate-200/70 p-2.5 dark:border-white/10">
        <button
          onClick={() => handleLogout(navigate)}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-500/10 dark:hover:text-red-400"
        >
          <LogOut className="h-[18px] w-[18px] shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="absolute -right-3 top-16 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm transition-transform hover:text-[#2563EB] dark:border-white/10 dark:bg-slate-800"
      >
        <ChevronLeft className={cn('h-3.5 w-3.5 transition-transform', collapsed && 'rotate-180')} />
      </button>
    </motion.aside>
    </>
  )
}

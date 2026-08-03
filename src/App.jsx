import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'

import { getUser } from '@/lib/auth'
import Login from '@/pages/Auth/Login'
import ForgotPassword from '@/pages/Auth/ForgotPassword'
import ResetPassword from '@/pages/Auth/ResetPassword'
import CreatePassword from '@/pages/Auth/CreatePassword'
import DashboardLayout from '@/layouts/DashboardLayout'
import Dashboard from '@/pages/Dashboard/Dashboard'
import OwnerDashboard from '@/pages/Dashboard/OwnerDashboard'
import ComplaintList from '@/pages/Complaints/ComplaintList'
import ComplaintForm from '@/pages/Complaints/ComplaintForm'
import CaseDetails from '@/pages/Cases/CaseDetails'
import Committee from '@/pages/Committee/Committee'
import Hearings from '@/pages/Hearings/Hearings'
import Evidence from '@/pages/Evidence/Evidence'
import Documents from '@/pages/Documents/Documents'
import Communications from '@/pages/Communications/Communications'
import Tasks from '@/pages/Tasks/Tasks'
import Reports from '@/pages/Reports/Reports'
import AuditLogs from '@/pages/AuditLogs/AuditLogs'
import Notifications from '@/pages/Notifications/Notifications'
import ArchivePage from '@/pages/Archive/Archive'
import SettingsPage from '@/pages/Settings/Settings'
import MyComplaints from '@/pages/Employee/MyComplaints'
import MyDocuments from '@/pages/Employee/MyDocuments'
import MyProfile from '@/pages/Employee/MyProfile'
import OwnerComplaints from '@/pages/Complaints/OwnerComplaints'

// Newly created modules
import EmployeeManagement from '@/pages/EmployeeManagement/EmployeeManagement'
import Recommendations from '@/pages/Recommendations/Recommendations'
import HelpCenter from '@/pages/Help/HelpCenter'
import POSHAdmins from '@/pages/POSHAdmins/POSHAdmins'
import ReportsAnalytics from '@/pages/ReportsAnalytics/ReportsAnalytics'

function RequireAuth({ element }) {
  const user = getUser()
  if (!user) return <Navigate to="/login" replace />
  return element
}

function AdminOrCommittee({ element, allowedRoles = [] }) {
  const user = getUser()
  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'EMPLOYEE') return <Navigate to="/dashboard" replace />
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }
  return element
}

export default function App() {
  return (
    <>
      <Toaster position="top-right" richColors closeButton />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/auth/create-password" element={<CreatePassword />} />
        <Route path="/auth/reset-password" element={<ResetPassword />} />

        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/notifications" element={<Notifications />} />

          {/* Employee-only routes */}
          <Route path="/my-complaints" element={<MyComplaints />} />
          <Route path="/my-documents" element={<MyDocuments />} />
          <Route path="/my-profile" element={<MyProfile />} />
          <Route path="/help" element={<HelpCenter />} />

          {/* Shared: complaint form (employee can raise, admin can view) */}
          <Route path="/complaints/new" element={<ComplaintForm />} />

          {/* Admin-only / Committee-only routes */}
          <Route path="/complaints" element={<AdminOrCommittee element={<ComplaintList />} allowedRoles={['POSH_ADMIN', 'HR_SPOC']} />} />
          <Route path="/cases" element={<AdminOrCommittee element={<ComplaintList />} allowedRoles={['POSH_ADMIN', 'HR_SPOC', 'IC_MEMBER', 'EXTERNAL_MEMBER', 'LEGAL']} />} />
          <Route path="/cases/:id" element={<RequireAuth element={<CaseDetails />} />} />
          <Route path="/committee" element={<AdminOrCommittee element={<Committee />} allowedRoles={['POSH_ADMIN']} />} />
          <Route path="/hearings" element={<AdminOrCommittee element={<Hearings />} allowedRoles={['POSH_ADMIN', 'IC_MEMBER', 'EXTERNAL_MEMBER']} />} />
          <Route path="/evidence" element={<AdminOrCommittee element={<Evidence />} allowedRoles={['POSH_ADMIN', 'IC_MEMBER', 'EXTERNAL_MEMBER']} />} />
          <Route path="/documents" element={<AdminOrCommittee element={<Documents />} allowedRoles={['POSH_ADMIN', 'HR_SPOC', 'IC_MEMBER', 'EXTERNAL_MEMBER', 'LEGAL']} />} />
          <Route path="/communications" element={<AdminOrCommittee element={<Communications />} allowedRoles={['POSH_ADMIN', 'HR_SPOC']} />} />
          <Route path="/tasks" element={<AdminOrCommittee element={<Tasks />} allowedRoles={['POSH_ADMIN', 'HR_SPOC', 'IC_MEMBER', 'EXTERNAL_MEMBER']} />} />
          <Route path="/reports" element={<AdminOrCommittee element={<Reports />} allowedRoles={['POSH_ADMIN', 'HR_SPOC']} />} />
          <Route path="/employees" element={<AdminOrCommittee element={<EmployeeManagement />} allowedRoles={['POSH_ADMIN', 'HR_SPOC']} />} />
          <Route path="/users" element={<Navigate to="/employees" replace />} />
          <Route path="/recommendations" element={<AdminOrCommittee element={<Recommendations />} allowedRoles={['POSH_ADMIN', 'IC_MEMBER', 'EXTERNAL_MEMBER']} />} />
          <Route path="/audit-logs" element={<AdminOrCommittee element={<AuditLogs />} allowedRoles={['POSH_ADMIN']} />} />
          <Route path="/archive" element={<AdminOrCommittee element={<ArchivePage />} allowedRoles={['POSH_ADMIN']} />} />
          <Route path="/settings" element={<AdminOrCommittee element={<SettingsPage />} allowedRoles={['POSH_ADMIN', 'COMPANY_OWNER']} />} />
          
          {/* COMPANY_OWNER specific routes */}
          <Route path="/dashboard" element={<RequireAuth element={<OwnerDashboard />} />} />
          <Route path="/posh-admins" element={<RequireAuth element={<POSHAdmins />} />} />
          <Route path="/owner-complaints" element={<RequireAuth element={<OwnerComplaints />} />} />
          <Route path="/reports-analytics" element={<RequireAuth element={<ReportsAnalytics />} />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  )
}

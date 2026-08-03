import React from 'react'
import { usePosh } from '@/context/PoshContext'
import AdminDashboard from './AdminDashboard'
import EmployeeDashboard from './EmployeeDashboard'
import IcDashboard from './IcDashboard'
import ExternalDashboard from './ExternalDashboard'
import OwnerDashboard from './OwnerDashboard'

export default function Dashboard() {
  const { currentUser } = usePosh()
  const role = currentUser?.role

  switch (role) {
    case 'COMPANY_OWNER':
      return <OwnerDashboard />
    case 'POSH_ADMIN':
    case 'HR_SPOC':
      return <AdminDashboard />
    case 'IC_MEMBER':
      return <IcDashboard />
    case 'EXTERNAL_MEMBER':
      return <ExternalDashboard />
    case 'LEGAL':
      return <IcDashboard />
    default:
      return <EmployeeDashboard />
  }
}

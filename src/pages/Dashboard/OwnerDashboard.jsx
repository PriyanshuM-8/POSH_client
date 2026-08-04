import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  LayoutGrid, Users, ShieldAlert, FileText, Award, TrendingUp,
  Activity, CheckCircle, RefreshCw, UserPlus, Search, Edit,
  Trash2, Mail, Phone, AlertTriangle, Building2, Scale, Loader2 
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/Dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { SkeletonCard, SkeletonTable } from '@/components/ui/Skeleton'
import EmptyState from '@/components/ui/EmptyState'
import { usePosh } from '@/context/PoshContext'
import { deleteUserService, updateUserService } from '@/services/userService'
import { invitePoshAdminService, forgotPasswordService } from '@/services/authService'
import { getDashboardService } from '@/services/dashboardService'
import { assignAdminToComplaintService } from '@/services/complaintService'
import { toast } from 'sonner'
import Swal from 'sweetalert2'

export default function OwnerDashboard() {
  const { currentUser } = usePosh()
  const [cases, setCases] = useState([])
  const [complaints, setComplaints] = useState([])
  const [users, setUsers] = useState([])
  const [statusCounts, setStatusCounts] = useState({})
  const [unassignedComplaints, setUnassignedComplaints] = useState([])
  const [adminComplaints, setAdminComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [adminLoading, setAdminLoading] = useState(false)
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateAdminModal, setShowCreateAdminModal] = useState(false)
  const [showEditAdminModal, setShowEditAdminModal] = useState(false)
  const [editingAdminId, setEditingAdminId] = useState(null)
  const [activityLog, setActivityLog] = useState([])
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalPoshAdmins: 0,
    totalComplaints: 0,
    activeCases: 0,
    closedCases: 0,
    complianceScore: 100,
  })

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    department: '',
    designation: '',
  })

  const [editFormData, setEditFormData] = useState({
    fullName: '',
    phone: '',
    department: '',
    designation: '',
    status: 'ACTIVE'
  })

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getDashboardService()

      const poshAdminsData = (data.poshAdmins || []).map(u => ({ ...u, role: 'POSH_ADMIN' }))
      const recentCasesData = data.recentCases || []

      setUsers(poshAdminsData)
      setStatusCounts(data.statusCounts || {})
      setUnassignedComplaints(data.unassignedAdminComplaints || [])
      setAdminComplaints(data.adminComplaints || [])

      const pendingCases = data.pendingCases || 0
      const resolvedCases = data.resolvedCases || 0
      const totalCases = pendingCases + resolvedCases

      setStats({
        totalEmployees: data.totalEmployees || 0,
        totalPoshAdmins: poshAdminsData.length,
        totalComplaints: data.totalComplaints || 0,
        activeCases: pendingCases,
        closedCases: resolvedCases,
        complianceScore: totalCases > 0
          ? Math.round((resolvedCases / totalCases) * 100)
          : 100,
      })

      generateActivityLog(poshAdminsData, recentCasesData)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data.')
    } finally {
      setLoading(false)
    }
  }

  const generateActivityLog = (usersData, casesData) => {
    const activities = []

    usersData.slice(0, 5).forEach(user => {
      if (user.role === 'POSH_ADMIN') {
        activities.push({
          type: 'POSH Admin Added',
          description: `${user.fullName} was added as POSH Admin`,
          timestamp: user.createdAt,
          icon: UserPlus,
          color: 'from-emerald-500 to-teal-600',
        })
      }
    })

    casesData.slice(0, 5).forEach(c => {
      activities.push({
        type: 'Case Created',
        description: `Case ${c.caseId || c._id?.slice(-8).toUpperCase()} was created`,
        timestamp: c.createdAt,
        icon: FileText,
        color: 'from-blue-500 to-indigo-600',
      })
    })

    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    setActivityLog(activities.slice(0, 8))
  }

  useEffect(() => { fetchData() }, [])

  const handleCreateAdmin = async () => {
    setAdminLoading(true);
    try {
      const res = await invitePoshAdminService(formData)
      setSent(false)
      toast.success('POSH Admin invitation sent successfully!')
      setShowCreateAdminModal(false)
      setFormData({ fullName: '', email: '', phone: '', department: '', designation: '' })
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create POSH Admin')
    }
  }

  const openEditModal = (admin) => {
    setEditingAdminId(admin._id)
    setEditFormData({
      fullName: admin.fullName || '',
      phone: admin.phone || '',
      department: admin.department || '',
      designation: admin.designation || '',
      status: admin.status || 'ACTIVE'
    })
    setShowEditAdminModal(true)
  }

  const handleEditAdmin = async () => {
    try {
      const payload = {
        fullName: editFormData.fullName,
        department: editFormData.department || '',
        designation: editFormData.designation || '',
        status: editFormData.status,
      }
      if (editFormData.phone) {
        payload.phone = editFormData.phone.replace(/[\s\-\(\)]/g, '')
      } else {
        payload.phone = ''
      }
      await updateUserService(editingAdminId, payload)
      toast.success('POSH Admin details updated successfully!')
      setShowEditAdminModal(false)
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update POSH Admin')
    }
  }

  const handleResendMail = async (admin) => {
    const isPending = admin.status === 'PENDING'
    Swal.fire({
      title: isPending ? 'Resend Invitation?' : 'Send Password Reset?',
      text: isPending 
        ? `Do you want to resend the invitation email to ${admin.fullName}?`
        : `Do you want to send a password reset email to ${admin.fullName}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#2563EB',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, send it!',
      cancelButtonText: 'Cancel',
      background: document.documentElement.classList.contains('dark') ? '#1E293B' : '#FFFFFF',
      color: document.documentElement.classList.contains('dark') ? '#F3F4F6' : '#1F2937',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          if (isPending) {
            await invitePoshAdminService({
              fullName: admin.fullName,
              email: admin.email,
              phone: admin.phone || '',
              department: admin.department || '',
              designation: admin.designation || '',
            })
            toast.success('Invitation email resent successfully!')
          } else {
            await forgotPasswordService({ email: admin.email })
            toast.success('Password reset email sent successfully!')
          }
        } catch (err) {
          toast.error(err.response?.data?.message || 'Failed to send email')
        }
      }
    })
  }

  const handleDeleteAdmin = async (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You want to delete this POSH Administrator. This action cannot be undone!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      background: document.documentElement.classList.contains('dark') ? '#1E293B' : '#FFFFFF',
      color: document.documentElement.classList.contains('dark') ? '#F3F4F6' : '#1F2937',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteUserService(id)
          Swal.fire({
            title: 'Deleted!',
            text: 'POSH Admin has been deleted successfully.',
            icon: 'success',
            background: document.documentElement.classList.contains('dark') ? '#1E293B' : '#FFFFFF',
            color: document.documentElement.classList.contains('dark') ? '#F3F4F6' : '#1F2937',
          })
          fetchData()
        } catch (err) {
          Swal.fire({
            title: 'Error!',
            text: err.response?.data?.message || 'Failed to delete POSH Admin',
            icon: 'error',
            background: document.documentElement.classList.contains('dark') ? '#1E293B' : '#FFFFFF',
            color: document.documentElement.classList.contains('dark') ? '#F3F4F6' : '#1F2937',
          })
        }
      }
    })
  }

  const handleAssignAdmin = async (complaintId, adminId) => {
    if (!adminId) {
      toast.error('Please select a POSH Admin to assign.')
      return
    }
    try {
      await assignAdminToComplaintService(complaintId, { adminId })
      toast.success('Complaint assigned successfully!')
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign POSH Admin.')
    }
  }

  const handleInitiateExternal = async (complaintId) => {
    Swal.fire({
      title: 'Initiate External Workflow?',
      text: 'This will route the investigation to external compliance workflows and notify the complainant.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, initiate external workflow',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#2563EB',
      cancelButtonColor: '#6B7280',
      background: document.documentElement.classList.contains('dark') ? '#1E293B' : '#FFFFFF',
      color: document.documentElement.classList.contains('dark') ? '#F3F4F6' : '#1F2937',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await assignAdminToComplaintService(complaintId, { isExternalWorkflow: true })
          toast.success('External compliance workflow initiated!')
          fetchData()
        } catch (err) {
          toast.error(err.response?.data?.message || 'Failed to initiate external workflow.')
        }
      }
    })
  }

  const filteredUsers = users.filter(u =>
    (u.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const poshAdmins = filteredUsers.filter(u => u.role === 'POSH_ADMIN')

  if (error) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <AlertTriangle className="h-10 w-10 text-red-400" />
        <p className="text-sm text-slate-500">{error}</p>
        <Button variant="outline" onClick={fetchData}><RefreshCw className="h-4 w-4" /> Retry</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Executive Dashboard</h1>
          <p className="mt-0.5 text-sm text-slate-500">Company-wide compliance overview</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="success" dot className="px-3 py-1 text-xs">COMPANY OWNER</Badge>
          <Button size="sm" onClick={() => setShowCreateAdminModal(true)}>
            <UserPlus className="h-4 w-4" /> Create POSH Admin
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard label="Total Employees" value={stats.totalEmployees} icon={Users} color="from-blue-500 to-indigo-600" />
            <StatCard label="POSH Admins" value={stats.totalPoshAdmins} icon={ShieldAlert} color="from-emerald-500 to-teal-600" />
            <StatCard label="Total Complaints" value={stats.totalComplaints} icon={FileText} color="from-amber-500 to-orange-600" />
            <StatCard label="Active Cases" value={stats.activeCases} icon={Activity} color="from-rose-500 to-pink-600" />
            <StatCard label="Closed Cases" value={stats.closedCases} icon={CheckCircle} color="from-cyan-500 to-sky-600" />
            <StatCard label="Compliance Score" value={`${stats.complianceScore}%`} icon={TrendingUp} color="from-violet-500 to-purple-600" />
          </>
        )}
      </div>

      {/* POSH Admin Complaints & Self-Incidents Panel */}
      {adminComplaints.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-slate-800 dark:text-white">
            <Scale className="h-5 w-5 text-indigo-500" />
            <h2 className="text-sm font-bold uppercase tracking-wider">POSH Admin Complaints & Self-Incidents</h2>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {adminComplaints.map((c) => {
              // Get active POSH Admins that are NOT the complainant
              const otherActiveAdmins = users.filter(
                (admin) => admin.isActive && admin._id !== c.complainant?._id
              );

              const isUnassigned = !c.assignedAdmin && c.status === "PENDING_REVIEW";
              const isExternal = !c.assignedAdmin && c.status !== "PENDING_REVIEW";

              return (
                <Card key={c._id} className={`border border-slate-200 dark:border-white/5 ${isUnassigned ? 'border-rose-200 dark:border-rose-950 bg-rose-50/10 dark:bg-rose-950/5' : ''}`}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start flex-wrap gap-2">
                      <div>
                        <CardTitle className="text-sm font-bold text-slate-855 dark:text-slate-200">{c.title}</CardTitle>
                        <CardDescription className="text-xs mt-1">
                          Filed by POSH Admin: <strong>{c.complainant?.fullName}</strong> ({c.complainant?.email}) on {new Date(c.createdAt).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <div>
                        {c.assignedAdmin ? (
                          <Badge variant="success" className="text-[10px]">ASSIGNED</Badge>
                        ) : isExternal ? (
                          <Badge variant="info" className="text-[10px]">EXTERNAL WORKFLOW</Badge>
                        ) : (
                          <Badge variant="danger" className="text-[10px]">UNASSIGNED / ACTION REQUIRED</Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 pb-4 space-y-4">
                    <p className="text-xs text-slate-550 dark:text-slate-400 bg-white dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-white/5">
                      {c.description}
                    </p>
                    
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        {c.assignedAdmin ? (
                          <span className="text-xs text-slate-600 dark:text-slate-300">
                            🔒 Assigned to: <strong>{c.assignedAdmin.fullName}</strong> ({c.assignedAdmin.email})
                          </span>
                        ) : isExternal ? (
                          <span className="text-xs text-slate-600 dark:text-slate-300">
                            🌐 Investigation routed via <strong>External Compliance Workflow</strong>
                          </span>
                        ) : (
                          <>
                            <span className="text-xs font-semibold text-slate-500">Assign to Admin:</span>
                            {otherActiveAdmins.length > 0 ? (
                              <div className="flex items-center gap-2">
                                <select
                                  id={`select-admin-${c._id}`}
                                  className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                                >
                                  <option value="">Select POSH Admin...</option>
                                  {otherActiveAdmins.map((admin) => (
                                    <option key={admin._id} value={admin._id}>
                                      {admin.fullName} ({admin.department || 'No Dept'})
                                    </option>
                                  ))}
                                </select>
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    const selectEl = document.getElementById(`select-admin-${c._id}`);
                                    handleAssignAdmin(c._id, selectEl?.value);
                                  }}
                                  className="text-xs font-semibold"
                                >
                                  Assign
                                </Button>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400 italic">No other active POSH Admins found. Please create one.</span>
                            )}
                          </>
                        )}
                      </div>

                      {isUnassigned && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleInitiateExternal(c._id)}
                          className="text-xs font-semibold border border-slate-200 hover:border-slate-300 dark:border-white/5"
                        >
                          Initiate External Workflow
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Analytics Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Complaint Status Breakdown */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Complaint Status Overview</CardTitle>
            <CardDescription>Distribution of complaints across all stages</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="h-64 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
            ) : (
              <div className="space-y-3">
                {[
                  { label: 'Open', count: statusCounts['OPEN'] || 0, color: 'bg-blue-500' },
                  { label: 'Under Investigation', count: statusCounts['UNDER_INVESTIGATION'] || 0, color: 'bg-amber-500' },
                  { label: 'Legal Review', count: statusCounts['LEGAL_REVIEW'] || 0, color: 'bg-purple-500' },
                  { label: 'Closed', count: statusCounts['CLOSED'] || 0, color: 'bg-emerald-500' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-4">
                    <div className="flex w-24 items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <div className={`h-3 w-3 rounded-full ${item.color}`} />
                      {item.label}
                    </div>
                    <div className="flex-1 rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className={`h-2 rounded-full ${item.color}`}
                        style={{ width: `${(item.count / ((stats.activeCases + stats.closedCases) || 1)) * 100}%` }}
                      />
                    </div>
                    <span className="w-12 text-right text-sm font-medium text-slate-700 dark:text-slate-300">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Compliance Score */}
        <Card>
          <CardHeader>
            <CardTitle>Compliance Score</CardTitle>
            <CardDescription>Overall compliance health</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-8">
            {loading ? (
              <div className="h-32 w-32 animate-pulse rounded-full bg-slate-100 dark:bg-slate-800" />
            ) : (
              <div className="relative h-40 w-40">
                <svg className="h-full w-full" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke={stats.complianceScore > 80 ? '#10b981' : stats.complianceScore > 50 ? '#f59e0b' : '#ef4444'}
                    strokeWidth="3"
                    strokeDasharray={`${stats.complianceScore}, 100`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-slate-800 dark:text-white">{stats.complianceScore}%</span>
                  <span className="text-xs text-slate-500">Compliant</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* POSH Admin Management */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>POSH Administrators</CardTitle>
            <CardDescription>Manage your organization's compliance team</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search admins..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <SkeletonTable rows={5} cols={6} />
          ) : poshAdmins.length === 0 ? (
            <EmptyState
              title="No POSH Admins"
              description="Create your first POSH Admin to manage complaints"
              action={() => setShowCreateAdminModal(true)}
              actionLabel="Create POSH Admin"
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-medium text-slate-500">Admin</TableHead>
                    <TableHead className="font-medium text-slate-500">Email</TableHead>
                    <TableHead className="font-medium text-slate-500">Phone</TableHead>
                    <TableHead className="font-medium text-slate-500">Department</TableHead>
                    <TableHead className="font-medium text-slate-500">Status</TableHead>
                    <TableHead className="font-medium text-slate-500 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {poshAdmins.map((admin) => (
                    <TableRow
                      key={admin._id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2563EB] to-indigo-600 text-xs font-semibold text-white">
                            {admin.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-white">{admin.fullName}</p>
                            <p className="text-xs text-slate-500">{admin.designation || 'Admin'}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-400">{admin.email || '-'}</TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-400">{admin.phone || '-'}</TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-400">{admin.department || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={admin.status === 'ACTIVE' ? 'success' : 'warning'}>
                          {admin.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            onClick={() => openEditModal(admin)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            onClick={() => handleResendMail(admin)}
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteAdmin(admin._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest organization-wide events</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-3 p-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
                    <div className="h-3 w-1/2 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : activityLog.length === 0 ? (
            <EmptyState title="No recent activity" description="Activity will appear here as events occur" />
          ) : (
            <div className="space-y-4 p-5">
              {activityLog.map((activity, i) => {
                const Icon = activity.icon
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start gap-4"
                  >
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${activity.color} text-white shadow-sm`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium text-slate-800 dark:text-white">{activity.description}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(activity.timestamp).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                      </p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create POSH Admin Modal */}
      <Dialog open={showCreateAdminModal} onOpenChange={setShowCreateAdminModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create POSH Admin</DialogTitle>
            <DialogDescription>
              Invite a new POSH administrator to manage complaints and investigations
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">First Name</label>
                <Input
                  placeholder="John"
                  value={formData.fullName.split(' ')[0] || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    fullName: `${e.target.value} ${formData.fullName.split(' ')[1] || ''}`
                  })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Last Name</label>
                <Input
                  placeholder="Doe"
                  value={formData.fullName.split(' ')[1] || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    fullName: `${formData.fullName.split(' ')[0] || ''} ${e.target.value}`
                  })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
              <Input
                type="email"
                placeholder="admin@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone</label>
                <Input
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Department</label>
                <Input
                  placeholder="HR"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Designation</label>
              <Input
                placeholder="POSH Admin"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateAdminModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateAdmin} disabled={!formData.email} 
             
             className={sent?"bg-green-600 hover:bg-green-700 text-white":""}
            >
              {adminLoading?(
                <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                 Sending...
                </>
              ):sent?(
                 "Invitation Sent ✓"
              ):(
                "Send Invitation"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit POSH Admin Modal */}
      <Dialog open={showEditAdminModal} onOpenChange={setShowEditAdminModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit POSH Admin</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
              <Input
                placeholder="Ravi Teja"
                value={editFormData.fullName}
                onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone</label>
                <Input
                  placeholder="+91 98765 43210"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Department</label>
                <Input
                  placeholder="HR"
                  value={editFormData.department}
                  onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Designation</label>
              <Input
                placeholder="POSH Admin"
                value={editFormData.designation}
                onChange={(e) => setEditFormData({ ...editFormData, designation: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Status</label>
              <select
                value={editFormData.status}
                onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                className="flex h-11 w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-3.5 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 shadow-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-500/20"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="SUSPENDED">SUSPENDED</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditAdminModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditAdmin} disabled={!editFormData.fullName}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <motion.div whileHover={{ y: -4 }}>
      <Card className="overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
              <p className="mt-1 text-3xl font-bold text-slate-800 dark:text-white">{value}</p>
            </div>
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${color} text-white shadow-lg`}>
              <Icon className="h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

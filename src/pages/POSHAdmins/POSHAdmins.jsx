import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Users2, PlusCircle, Search, Filter, MoreVertical, Mail, Phone, 
  Edit, Trash2, ShieldCheck, UserPlus, AlertTriangle, RefreshCw
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog'
import EmptyState from '@/components/ui/EmptyState'
import { usePosh } from '@/context/PoshContext'
import { getAllUsersService, deleteUserService, updateUserService } from '@/services/userService'
import { invitePoshAdminService, forgotPasswordService } from '@/services/authService'
import { toast } from 'sonner'
import Swal from 'sweetalert2'

export default function POSHAdmins() {
  const { currentUser } = usePosh()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateAdminModal, setShowCreateAdminModal] = useState(false)
  const [showEditAdminModal, setShowEditAdminModal] = useState(false)
  const [editingAdminId, setEditingAdminId] = useState(null)
  
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
      const usersRes = await getAllUsersService({ limit: 100 })
      setUsers(usersRes?.users || usersRes || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleCreateAdmin = async () => {
    try {
      const res = await invitePoshAdminService(formData)
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
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">POSH Admin Management</h1>
          <p className="mt-0.5 text-sm text-slate-500">Manage your organization's compliance administrators</p>
        </div>
        <Button onClick={() => setShowCreateAdminModal(true)}>
          <PlusCircle className="h-4 w-4" /> Create POSH Admin
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>All POSH Administrators</CardTitle>
            <p className="text-sm text-slate-500">{poshAdmins.length} POSH Admins found</p>
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
            <div className="p-5">
              <div className="h-8 w-3/4 animate-pulse rounded bg-slate-100 dark:bg-slate-800 mb-4" />
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-3/4 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
                      <div className="h-3 w-1/2 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
                      <TableCell className="text-slate-600 dark:text-slate-400">{admin.email}</TableCell>
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

      {/* Create POSH Admin Modal */}
      <Dialog open={showCreateAdminModal} onOpenChange={setShowCreateAdminModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create POSH Admin</DialogTitle>
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
            <Button onClick={handleCreateAdmin} disabled={!formData.email}>
              Send Invitation
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
                placeholder="John Doe"
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

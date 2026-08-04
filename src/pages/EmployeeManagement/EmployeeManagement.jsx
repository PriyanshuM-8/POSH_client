import React, { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Filter, Plus, Edit2, Trash2, ChevronLeft, ChevronRight,
  User, Mail, Phone, Building2, UserCheck, ShieldAlert, RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { SkeletonTable } from '@/components/ui/Skeleton'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import { usePosh } from '@/context/PoshContext'
import { getAllUsersService, createUserService, updateUserService, deleteUserService, changeUserRoleService } from '@/services/userService'
import { toast } from 'sonner'
import Swal from 'sweetalert2'

const PAGE_SIZE = 10

export default function EmployeeManagement() {
  const { currentUser } = usePosh()

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')
  const [deptFilter, setDeptFilter] = useState('All')
  const [page, setPage] = useState(1)

  const [showAdd, setShowAdd] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editingEmp, setEditingEmp] = useState(null)

  const [form, setForm] = useState({ 
    fullName: '', 
    email: '', 
    role: 'EMPLOYEE', 
    department: 'Sales', 
    designation: '', 
    phone: '' 
  })

  const departments = ['All', 'Sales', 'Engineering', 'Operations', 'Finance', 'HR', 'Marketing']

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getAllUsersService({ limit: 100 })
      const rawUsers = res?.users || res || []
      const filteredRoster = rawUsers.filter(u => u.role !== 'COMPANY_OWNER')
      setUsers(filteredRoster)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load employees.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const filtered = useMemo(() => {
    return users.filter(e => {
      const matchQuery = (e.fullName || '').toLowerCase().includes(query.toLowerCase()) || 
                        (e.email || '').toLowerCase().includes(query.toLowerCase()) ||
                        (e.employeeId || '').toLowerCase().includes(query.toLowerCase())
      const matchDept = deptFilter === 'All' || e.department === deptFilter
      return matchQuery && matchDept
    })
  }, [users, query, deptFilter])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleAddSubmit = async (e) => {
    e.preventDefault()
    if (!form.fullName || !form.email || !form.designation) return
    try {
      const user = await createUserService({
        fullName: form.fullName,
        email: form.email,
        role: form.role,
        department: form.department,
        designation: form.designation,
        phone: form.phone,
      })
      toast.success('Employee added successfully.')
      setShowAdd(false)
      setForm({ fullName: '', email: '', role: 'EMPLOYEE', department: 'Sales', designation: '', phone: '' })
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add employee.')
    }
  }

  const handleEditClick = (emp) => {
    setEditingId(emp._id)
    setEditingEmp(emp)
    setForm({
      fullName: emp.fullName,
      email: emp.email,
      role: emp.role,
      department: emp.department,
      designation: emp.designation,
      phone: emp.phone || '',
    })
    setShowEdit(true)
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    if (!form.fullName || !form.email || !form.designation) return
    try {
      const sanitizedPhone = form.phone ? form.phone.replace(/[\s\-\(\)]/g, '') : ''

      const payload = {
        fullName: form.fullName,
        department: form.department,
        designation: form.designation,
        phone: sanitizedPhone || null,
      }

      await updateUserService(editingId, payload)

      if (editingEmp && form.role !== editingEmp.role) {
        await changeUserRoleService(editingId, { role: form.role })
      }

      toast.success('Employee updated successfully.')
      setShowEdit(false)
      setForm({ fullName: '', email: '', role: 'EMPLOYEE', department: 'Sales', designation: '', phone: '' })
      setEditingId(null)
      setEditingEmp(null)
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update employee.')
    }
  }

  const handleDeleteClick = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this employee record? This action is irreversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete Record',
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      background: document.documentElement.classList.contains('dark') ? '#1E293B' : '#FFFFFF',
      color: document.documentElement.classList.contains('dark') ? '#F3F4F6' : '#1F2937',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteUserService(id)
          toast.success('Employee deleted successfully.')
          fetchData()
        } catch (err) {
          toast.error(err.response?.data?.message || 'Failed to delete employee.')
        }
      }
    })
  }

  if (error) {
    return <ErrorState status={500} message={error} onRetry={fetchData} />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Employee Roster</h1>
          <p className="mt-0.5 text-sm text-slate-500">Manage organization directory and governance access levels.</p>
        </div>
        <Button onClick={() => { setForm({ fullName: '', email: '', role: 'EMPLOYEE', department: 'Sales', designation: '', phone: '' }); setShowAdd(true) }}>
          <Plus className="h-4 w-4" /> Add Employee
        </Button>
      </div>

      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={e => { setQuery(e.target.value); setPage(1) }}
                placeholder="Search name, email, employee ID..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-3 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {departments.map(d => (
                <button
                  key={d}
                  onClick={() => { setDeptFilter(d); setPage(1) }}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                    deptFilter === d
                      ? 'bg-[#2563EB] text-white shadow-sm'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-400'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <SkeletonTable rows={6} cols={6} />
            ) : filtered.length === 0 ? (
              <EmptyState
                title="No employees found"
                description="Try adjusting your search or filter criteria."
              />
            ) : (
              <table className="w-full min-w-[800px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400 dark:border-white/10">
                    <th className="py-2.5 pr-4 font-medium">Employee</th>
                    <th className="py-2.5 pr-4 font-medium">Department</th>
                    <th className="py-2.5 pr-4 font-medium">Designation</th>
                    <th className="py-2.5 pr-4 font-medium">Role Access</th>
                    <th className="py-2.5 pr-4 font-medium">Joined On</th>
                    <th className="py-2.5 pr-4 font-medium">Status</th>
                    <th className="py-2.5 pr-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((emp) => (
                    <tr key={emp._id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/40 dark:border-white/5">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#2563EB]/10 text-xs font-semibold text-[#2563EB] dark:bg-white/5 dark:text-blue-300">
                            {emp.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-slate-100">{emp.fullName}</p>
                            <p className="text-xs text-slate-400 font-mono">{emp.employeeId || '—'} · {emp.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-slate-600 dark:text-slate-300 font-medium">{emp.department}</td>
                      <td className="py-3 pr-4 text-slate-600 dark:text-slate-300">{emp.designation}</td>
                      <td className="py-3 pr-4">
                        <Badge variant={emp.role === 'EMPLOYEE' ? 'neutral' : emp.role === 'POSH_ADMIN' ? 'danger' : 'info'}>
                          {emp.role.replace(/_/g, ' ')}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4 text-slate-400 text-xs font-medium">{new Date(emp.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</td>
                      <td className="py-3 pr-4">
                        <Badge variant={emp.isActive ? 'success' : 'neutral'} dot>{emp.isActive ? 'Active' : 'Inactive'}</Badge>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEditClick(emp)} className="h-8 w-8">
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(emp._id)} className="h-8 w-8 text-red-500 hover:text-red-700">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="flex items-center justify-between pt-3 text-sm text-slate-400 border-t border-slate-50 dark:border-white/5">
            <span>Page {page} of {pageCount}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft className="h-4 w-4" /> Previous
              </Button>
              <Button variant="outline" size="sm" disabled={page === pageCount} onClick={() => setPage(p => p + 1)}>
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal: Add Employee */}
      <AnimatePresence>
        {showAdd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-800"
            >
              <CardHeader className="p-0 pb-4">
                <CardTitle>Add Employee Record</CardTitle>
                <CardDescription>Enter demographic details and governance credentials access</CardDescription>
              </CardHeader>
              <form onSubmit={handleAddSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input label="Full Name" required placeholder="John Doe" value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} />
                  <Input label="Work Email" type="email" required placeholder="john.doe@company.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                  
                  <div className="w-full">
                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Department</label>
                    <select
                      value={form.department}
                      onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                      className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-200 focus:outline-none"
                    >
                      {departments.filter(d => d !== 'All').map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>

                  <div className="w-full">
                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Governance Role</label>
                    <select
                      value={form.role}
                      onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                      className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-200 focus:outline-none"
                    >
                      <option value="EMPLOYEE">Employee</option>
                      <option value="IC_MEMBER">IC Member</option>
                      <option value="EXTERNAL_MEMBER">External Member</option>
                    </select>
                  </div>

                  <Input label="Designation" placeholder="e.g. Lead Counsel" required value={form.designation} onChange={e => setForm(f => ({ ...f, designation: e.target.value }))} />
                  <Input label="Phone Number" placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                </div>

                <div className="flex justify-end gap-2 border-t border-slate-50 pt-4 dark:border-white/5">
                  <Button type="button" variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
                  <Button type="submit">Provision Employee</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Edit Employee */}
      <AnimatePresence>
        {showEdit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-800"
            >
              <CardHeader className="p-0 pb-4">
                <CardTitle>Edit Employee Details</CardTitle>
                <CardDescription>Modify roster or directory access levels</CardDescription>
              </CardHeader>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input label="Full Name" required placeholder="John Doe" value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} />
                  <Input label="Work Email" type="email" disabled placeholder="john.doe@company.com" value={form.email} />
                  
                  <div className="w-full">
                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Department</label>
                    <select
                      value={form.department}
                      onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                      className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-200 focus:outline-none"
                    >
                      {departments.filter(d => d !== 'All').map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>

                  <div className="w-full">
                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Governance Role</label>
                    <select
                      value={form.role}
                      onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                      className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-200 focus:outline-none"
                    >
                      <option value="EMPLOYEE">Employee</option>
                      <option value="POSH_ADMIN">POSH Admin</option>
                      <option value="IC_MEMBER">IC Member</option>
                      <option value="EXTERNAL_MEMBER">External Member</option>
                    </select>
                  </div>

                  <Input label="Designation" placeholder="e.g. Lead Counsel" required value={form.designation} onChange={e => setForm(f => ({ ...f, designation: e.target.value }))} />
                  <Input label="Phone Number" placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                </div>

                <div className="flex justify-end gap-2 border-t border-slate-50 pt-4 dark:border-white/5">
                  <Button type="button" variant="outline" onClick={() => setShowEdit(false)}>Cancel</Button>
                  <Button type="submit">Save Changes</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

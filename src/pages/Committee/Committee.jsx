import React, { useEffect, useState } from 'react'
import { Plus, Scale, Users2, ShieldCheck, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { SkeletonCard, SkeletonTable } from '@/components/ui/Skeleton'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import { usePosh } from '@/context/PoshContext'
import { getAllCommitteesService, createCommitteeService } from '@/services/committeeService'
import { getAllUsersService } from '@/services/userService'
import { toast } from 'sonner'

const roleTone = {
  'Chairperson (IC)': 'default',
  'Internal Member': 'info',
  'External Member': 'warning',
}

export default function Committee() {
  const { currentUser } = usePosh()

  const [committees, setCommittees] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [creating, setCreating] = useState(false)

  const [form, setForm] = useState({ 
    name: '', 
    description: '', 
    presidingOfficer: '', 
    internalMembers: [], 
    externalMember: '' 
  })

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [committeesRes, usersRes] = await Promise.all([
        getAllCommitteesService({ limit: 50 }),
        getAllUsersService({ limit: 100 }).catch(() => ({ users: [] })),
      ])
      setCommittees(committeesRes?.committees || committeesRes || [])
      setUsers(usersRes?.users || usersRes || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load committees.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const availableChairpersons = users.filter(e => e.role === 'POSH_ADMIN' || e.role === 'IC_MEMBER')
  const availableMembers = users.filter(e => e.role === 'IC_MEMBER')
  const availableExternal = users.filter(e => e.role === 'EXTERNAL_MEMBER')

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.name || !form.presidingOfficer || !form.externalMember) return

    // Construct the backend payload members list format:
    // 1. Chairperson entry (Presiding Officer)
    const membersList = [
      { user: form.presidingOfficer, role: 'CHAIRPERSON' },
      { user: form.externalMember, role: 'EXTERNAL_MEMBER' }
    ]

    // 2. Add other internal members from the selected list
    form.internalMembers.forEach(memberId => {
      // Avoid duplicate chairperson in internal members if user selected it in both places
      if (memberId !== form.presidingOfficer) {
        membersList.push({ user: memberId, role: 'IC_MEMBER' })
      }
    })

    // Validate composition: backend requires min 3 members
    if (membersList.length < 3) {
      toast.error('Committee must have at least 3 members (including Chairperson, NGO Member, and Internal Members).')
      return
    }

    setCreating(true)
    try {
      await createCommitteeService({
        name: form.name,
        description: form.description,
        chairperson: form.presidingOfficer,
        members: membersList,
      })
      toast.success('Committee created successfully.')
      setShowAdd(false)
      setForm({ name: '', description: '', presidingOfficer: '', internalMembers: [], externalMember: '' })
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create committee.')
    } finally {
      setCreating(false)
    }
  }

  const handleToggleMember = (id) => {
    setForm(prev => {
      const exists = prev.internalMembers.includes(id)
      const next = exists ? prev.internalMembers.filter(m => m !== id) : [...prev.internalMembers, id]
      return { ...prev, internalMembers: next }
    })
  }

  if (error) {
    return <ErrorState status={500} message={error} onRetry={fetchData} />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Internal Committees</h1>
          <p className="mt-0.5 text-sm text-slate-500">Manage IC composition, case workloads, and statutory compliance status.</p>
        </div>
        <Button onClick={() => setShowAdd(true)}>
          <Plus className="h-4 w-4" /> Create Committee
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
        ) : committees.length === 0 ? (
          <div className="col-span-full">
            <EmptyState
              title="No committees found"
              description="Create your first Internal Committee to get started."
              action={() => setShowAdd(true)}
              actionLabel="Create Committee"
            />
          </div>
        ) : (
          committees.map((m) => (
            <Card key={m._id} className="group hover:-translate-y-0.5 hover:shadow-md transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <p className="font-mono text-[10px] font-bold text-[#2563EB] uppercase tracking-wider">{m._id?.slice(-8).toUpperCase()}</p>
                  <CardTitle className="text-base font-semibold text-slate-800 dark:text-white mt-0.5">{m.name}</CardTitle>
                </div>
                <Badge variant={m.status === 'ACTIVE' ? 'success' : 'neutral'}>{m.status}</Badge>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <p className="text-xs text-slate-500">{m.description || 'Statutory Internal Committee panel.'}</p>
                
                <div className="border-t border-slate-50 pt-2 space-y-2 dark:border-white/5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Presiding Officer:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{m.chairperson?.fullName || m.presidingOfficer || '—'}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">External Member:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      {m.members?.find(mem => mem.role === 'EXTERNAL_MEMBER')?.user?.fullName || m.externalMember || '—'}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Internal Members:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      {m.members?.filter(mem => mem.role === 'IC_MEMBER').map(mem => mem.user?.fullName).join(', ') || m.internalMembers?.join(', ') || '—'}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs border-t border-slate-50/50 pt-2 dark:border-white/5">
                    <span className="text-slate-400">Active Cases:</span>
                    <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-200">
                      <Scale className="h-3.5 w-3.5" /> {m.cases || 0} active
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modal: Create Committee */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-800">
            <CardHeader className="p-0 pb-4">
              <CardTitle>Create Committee Board</CardTitle>
              <CardDescription>Setup statutory committee boards matching legal criteria</CardDescription>
            </CardHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <Input
                label="Committee Name"
                placeholder="e.g. Committee C"
                required
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              />
              <Input
                label="Description"
                placeholder="Corporate compliance board description"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="w-full">
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Presiding Officer</label>
                  <select
                    value={form.presidingOfficer}
                    onChange={e => setForm(f => ({ ...f, presidingOfficer: e.target.value }))}
                    className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-200 focus:outline-none"
                    required
                  >
                    <option value="">Select female presiding officer</option>
                    {availableChairpersons.map(c => <option key={c._id} value={c._id}>{c.fullName} ({c.role})</option>)}
                  </select>
                </div>

                <div className="w-full">
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">External NGO Member</label>
                  <select
                    value={form.externalMember}
                    onChange={e => setForm(f => ({ ...f, externalMember: e.target.value }))}
                    className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-200 focus:outline-none"
                    required
                  >
                    <option value="">Select NGO member</option>
                    {availableExternal.map(c => <option key={c._id} value={c._id}>{c.fullName}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Internal Committee Members (select min 2)</label>
                <div className="grid grid-cols-2 gap-2 border border-slate-100 rounded-xl p-3 max-h-32 overflow-y-auto dark:border-white/5">
                  {availableMembers.map(m => {
                    const isChecked = form.internalMembers.includes(m._id)
                    return (
                      <button
                        key={m._id}
                        type="button"
                        onClick={() => handleToggleMember(m._id)}
                        className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold text-left transition-colors border ${
                          isChecked
                            ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-300'
                            : 'bg-slate-50 border-slate-100 text-slate-600 dark:bg-white/5 dark:border-white/5 dark:text-slate-400'
                        }`}
                      >
                        <span>{m.fullName}</span>
                        {isChecked && <ShieldCheck className="h-3 w-3" />}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-50 pt-4 dark:border-white/5">
                <Button type="button" variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
                <Button type="submit" disabled={creating}>
                  {creating ? 'Creating…' : 'Establish Board'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

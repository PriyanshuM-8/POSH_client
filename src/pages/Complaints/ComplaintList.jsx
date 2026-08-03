import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Download, FileSpreadsheet, Plus, ChevronLeft, ChevronRight,
  ShieldCheck, AlertCircle, RefreshCw, Scale,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { SkeletonTable } from '@/components/ui/Skeleton'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import { usePosh } from '@/context/PoshContext'
import { getAllComplaintsService } from '@/services/complaintService'
import { getAllCasesService } from '@/services/caseService'
import { getAllCommitteesService } from '@/services/committeeService'
import { assignCommitteeToCaseService } from '@/services/caseService'
import { toast } from 'sonner'

const STATUS_VARIANT = {
  PENDING_REVIEW: 'neutral',
  UNDER_REVIEW: 'warning',
  ACCEPTED: 'info',
  REJECTED: 'danger',
  CASE_CREATED: 'info',
  INVESTIGATION: 'warning',
  LEGAL_REVIEW: 'default',
  POSH_ADMIN_REVIEW: 'warning',
  CLOSED: 'success',
  WITHDRAWN: 'neutral',
  OPEN: 'info',
  UNDER_INVESTIGATION: 'warning',
  EVIDENCE_COLLECTION: 'warning',
  HEARING_SCHEDULED: 'warning',
  COMMITTEE_RECOMMENDATION: 'info',
  APPEALED: 'danger',
}

const PRIORITY_VARIANT = { LOW: 'neutral', MEDIUM: 'warning', HIGH: 'danger', CRITICAL: 'danger' }

const PAGE_SIZE = 10

export default function ComplaintList() {
  const navigate = useNavigate()
  const location = useLocation()
  const { currentUser } = usePosh()
  const isCasesView = location.pathname === '/cases'

  const [rows, setRows] = useState([])
  const [committees, setCommittees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Assign committee modal
  const [showAssign, setShowAssign] = useState(false)
  const [assigningId, setAssigningId] = useState(null)
  const [selectedCommittee, setSelectedCommittee] = useState('')
  const [assigning, setAssigning] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = { page, limit: PAGE_SIZE }
      if (query) params.search = query
      if (statusFilter !== 'All') params.status = statusFilter

      const [dataRes, committeesRes] = await Promise.all([
        isCasesView ? getAllCasesService(params) : getAllComplaintsService(params),
        // Only fetch committees for POSH_ADMIN and HR_SPOC
        (currentUser?.role === 'POSH_ADMIN' || currentUser?.role === 'HR_SPOC') 
          ? getAllCommitteesService({ limit: 50 }).catch(() => ({ committees: [] }))
          : Promise.resolve({ committees: [] })
      ])

      if (isCasesView) {
        setRows(dataRes?.cases || [])
        setTotalPages(dataRes?.pagination?.totalPages || 1)
      } else {
        setRows(dataRes?.complaints || [])
        setTotalPages(dataRes?.pagination?.totalPages || 1)
      }
      setCommittees(committeesRes?.committees || committeesRes || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data.')
    } finally {
      setLoading(false)
    }
  }, [isCasesView, page, query, statusFilter, currentUser?.role])

  useEffect(() => { fetchData() }, [fetchData])

  // Reset page when filters change
  useEffect(() => { setPage(1) }, [query, statusFilter, isCasesView])

  const handleAssignSubmit = async (e) => {
    e.preventDefault()
    if (!selectedCommittee) return
    setAssigning(true)
    try {
      await assignCommitteeToCaseService(assigningId, { committeeId: selectedCommittee })
      toast.success('Committee assigned successfully.')
      setShowAssign(false)
      setSelectedCommittee('')
      setAssigningId(null)
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign committee.')
    } finally {
      setAssigning(false)
    }
  }

  const complaintStatuses = ['All', 'PENDING_REVIEW', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED', 'CASE_CREATED', 'INVESTIGATION', 'LEGAL_REVIEW', 'POSH_ADMIN_REVIEW', 'CLOSED']
  const caseStatuses = ['All', 'OPEN', 'UNDER_INVESTIGATION', 'EVIDENCE_COLLECTION', 'HEARING_SCHEDULED', 'LEGAL_REVIEW', 'COMMITTEE_RECOMMENDATION', 'POSH_ADMIN_REVIEW', 'CLOSED', 'APPEALED']
  const statuses = isCasesView ? caseStatuses : complaintStatuses

  if (error) {
    return <ErrorState status={500} message={error} onRetry={fetchData} />
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
            {isCasesView ? 'Statutory Cases Workspace' : 'Complaints Registry'}
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {isCasesView ? 'Monitor active legal proceedings and resolutions' : 'Review and manage all registered complaints'}
          </p>
        </div>
        {!isCasesView && (
          <Button onClick={() => navigate('/complaints/new')}>
            <Plus className="h-4 w-4" /> New Complaint
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="space-y-4 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={isCasesView ? 'Search by case ID or status...' : 'Search by ID, title, or location...'}
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-3 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm"><Download className="h-3.5 w-3.5" /> Export</Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {statuses.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  statusFilter === s
                    ? 'bg-[#2563EB] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-400'
                }`}
              >
                {s === 'All' ? 'All' : s.replace(/_/g, ' ')}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <SkeletonTable rows={6} cols={isCasesView ? 6 : 5} />
            ) : rows.length === 0 ? (
              <EmptyState
                title={isCasesView ? 'No cases found' : 'No complaints found'}
                description="Try adjusting your search or filter criteria."
              />
            ) : (
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400 dark:border-white/10">
                    {isCasesView ? (
                      <>
                        <th className="py-2.5 pr-4 font-medium">Case ID</th>
                        <th className="py-2.5 pr-4 font-medium">Title</th>
                        <th className="py-2.5 pr-4 font-medium">Status</th>
                        <th className="py-2.5 pr-4 font-medium">Committee</th>
                        <th className="py-2.5 pr-4 font-medium">Created</th>
                        <th className="py-2.5 pr-4 font-medium">Actions</th>
                      </>
                    ) : (
                      <>
                        <th className="py-2.5 pr-4 font-medium">Complaint ID</th>
                        <th className="py-2.5 pr-4 font-medium">Title</th>
                        <th className="py-2.5 pr-4 font-medium">Status</th>
                        <th className="py-2.5 pr-4 font-medium">Priority</th>
                        <th className="py-2.5 pr-4 font-medium">Filed On</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr
                      key={row._id}
                    onClick={() => {
                      if (isCasesView) {
                        navigate(`/cases/${row._id}`)
                      } else {
                        navigate(`/cases/${row.caseRef || row._id}`)
                      }
                    }}
                      className="cursor-pointer border-b border-slate-50 last:border-0 hover:bg-slate-50/50 dark:border-white/5 dark:hover:bg-white/5"
                    >
                      {isCasesView ? (
                        <>
                          <td className="py-3 pr-4 font-mono text-xs font-semibold text-[#2563EB]">{row.caseId}</td>
                          <td className="py-3 pr-4 max-w-[200px]">
                            <p className="truncate font-medium text-slate-700 dark:text-slate-200">{row.complaint?.title || '—'}</p>
                          </td>
                          <td className="py-3 pr-4">
                            <Badge variant={STATUS_VARIANT[row.status] || 'neutral'}>{row.status?.replace(/_/g, ' ')}</Badge>
                          </td>
                          <td className="py-3 pr-4 text-slate-500">
                            {row.assignedCommittee?.name || <span className="italic text-slate-300">Unassigned</span>}
                          </td>
                          <td className="py-3 pr-4 text-slate-400 text-xs">
                            {new Date(row.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                          </td>
                          <td className="py-3 pr-4" onClick={e => e.stopPropagation()}>
                            {!row.assignedCommittee && currentUser?.role === 'POSH_ADMIN' && (
                              <Button size="sm" variant="secondary" onClick={() => { setAssigningId(row._id); setShowAssign(true) }}>
                                <Scale className="h-3.5 w-3.5" /> Assign
                              </Button>
                            )}
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="py-3 pr-4 font-mono text-xs font-semibold text-[#2563EB]">{row._id?.slice(-8).toUpperCase()}</td>
                          <td className="py-3 pr-4 max-w-[220px]">
                            <p className="truncate font-medium text-slate-700 dark:text-slate-200">{row.title}</p>
                            <p className="text-xs text-slate-400">{row.incidentLocation}</p>
                          </td>
                          <td className="py-3 pr-4">
                            <Badge variant={STATUS_VARIANT[row.status] || 'neutral'}>{row.status?.replace(/_/g, ' ')}</Badge>
                          </td>
                          <td className="py-3 pr-4">
                            <Badge variant={PRIORITY_VARIANT[row.priority] || 'neutral'}>{row.priority}</Badge>
                          </td>
                          <td className="py-3 pr-4 text-slate-400 text-xs">
                            {new Date(row.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {!loading && rows.length > 0 && (
            <div className="flex items-center justify-between pt-2 text-sm text-slate-400">
              <span>Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                  <ChevronLeft className="h-3.5 w-3.5" /> Previous
                </Button>
                <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                  Next <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assign Committee Modal */}
      <AnimatePresence>
        {showAssign && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-800"
            >
              <h3 className="text-base font-semibold text-slate-800 dark:text-white mb-1">Assign Committee</h3>
              <p className="text-xs text-slate-400 mb-4">Assign an active committee to oversee this case.</p>
              <form onSubmit={handleAssignSubmit} className="space-y-4">
                <select
                  value={selectedCommittee}
                  onChange={e => setSelectedCommittee(e.target.value)}
                  className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-200 focus:outline-none"
                  required
                >
                  <option value="">Select Committee</option>
                  {committees.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
                <div className="flex justify-end gap-2 border-t border-slate-50 pt-4 dark:border-white/5">
                  <Button type="button" variant="outline" onClick={() => setShowAssign(false)}>Cancel</Button>
                  <Button type="submit" disabled={assigning}>
                    {assigning ? 'Assigning…' : 'Confirm Assignment'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PlusCircle, Search, RefreshCw, AlertCircle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { SkeletonTable } from '@/components/ui/Skeleton'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import { usePosh } from '@/context/PoshContext'
import { getMyComplaintsService } from '@/services/complaintService'

const STATUS_VARIANT = {
  PENDING_REVIEW: 'neutral',
  UNDER_REVIEW: 'warning',
  ACCEPTED: 'info',
  REJECTED: 'danger',
  CASE_CREATED: 'info',
  OPEN: 'info',
  UNDER_INVESTIGATION: 'warning',
  EVIDENCE_COLLECTION: 'warning',
  HEARING_SCHEDULED: 'warning',
  LEGAL_REVIEW: 'default',
  COMMITTEE_RECOMMENDATION: 'warning',
  POSH_ADMIN_REVIEW: 'warning',
  CLOSED: 'success',
  WITHDRAWN: 'neutral',
}

const PRIORITY_VARIANT = { LOW: 'neutral', MEDIUM: 'warning', HIGH: 'danger', CRITICAL: 'danger' }

const WORKFLOW = [
  'Complaint Submitted',
  'Under Review',
  'Accepted',
  'Case Created',
  'Under Investigation',
  'Legal Review',
  'Admin Review',
  'Closed',
]

const STATUS_TO_STAGE = {
  // Complaint statuses
  PENDING_REVIEW: 0,
  UNDER_REVIEW: 1,
  ACCEPTED: 2,
  CASE_CREATED: 3,

  // Case statuses
  OPEN: 3,
  UNDER_INVESTIGATION: 4,
  EVIDENCE_COLLECTION: 4,
  HEARING_SCHEDULED: 4,
  LEGAL_REVIEW: 5,
  COMMITTEE_RECOMMENDATION: 6,
  POSH_ADMIN_REVIEW: 6,
  CLOSED: 7,
}

export default function MyComplaints() {
  const navigate = useNavigate()
  const { currentUser } = usePosh()

  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getMyComplaintsService({ limit: 50 })
      setComplaints(res?.complaints || res || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load your complaints.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const filtered = complaints.filter(c =>
    c._id?.toLowerCase().includes(search.toLowerCase()) ||
    c.status?.toLowerCase().includes(search.toLowerCase())
  )

  if (error) {
    return <ErrorState status={500} message={error} onRetry={fetchData} />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">My Complaints</h1>
          <p className="mt-0.5 text-sm text-slate-500 font-medium">Track progress, hearings, and compliance timelines of your reports.</p>
        </div>
        <Button onClick={() => navigate('/complaints/new')}>
          <PlusCircle className="h-4 w-4" /> Raise New Complaint
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
          <div>
            <CardTitle>All Complaints</CardTitle>
            <CardDescription>{filtered.length} complaint{filtered.length !== 1 ? 's' : ''} logged</CardDescription>
          </div>
          <div className="relative w-56">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ID or status..."
              className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-2">
          {loading ? (
            <SkeletonTable rows={4} cols={2} />
          ) : filtered.length === 0 ? (
            <EmptyState
              title="No complaints found"
              description="You haven't filed any complaints yet."
              action={() => navigate('/complaints/new')}
              actionLabel="File Complaint"
            />
          ) : (
            filtered.map((c, i) => {
              const activeStatus = c.caseRef && typeof c.caseRef === 'object' && c.caseRef.status ? c.caseRef.status : c.status;
              const currentStage = STATUS_TO_STAGE[activeStatus] ?? 0;
              return (
                <motion.div
                  key={c._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => c.caseRef ? navigate(`/cases/${c.caseRef._id || c.caseRef}`) : null}
                  className={`rounded-2xl border border-slate-100 p-5 dark:border-white/10 transition-all ${
                    c.caseRef ? 'cursor-pointer hover:bg-slate-50/60 dark:hover:bg-white/5' : ''
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-sm font-semibold text-[#2563EB]">{c._id?.slice(-8).toUpperCase()}</p>
                      <p className="mt-0.5 text-xs text-slate-400 font-medium">
                        Filed {new Date(c.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={PRIORITY_VARIANT[c.priority] || 'neutral'}>{c.priority}</Badge>
                      <Badge variant={STATUS_VARIANT[activeStatus] || 'neutral'}>{activeStatus?.replace(/_/g, ' ')}</Badge>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="mb-2 flex items-center justify-between text-xs text-slate-500 font-medium">
                      <span>Investigation Timeline</span>
                      <span>Stage {currentStage + 1} of {WORKFLOW.length}</span>
                    </div>
                    <div className="flex gap-1">
                      {WORKFLOW.map((_, idx) => (
                        <div
                          key={idx}
                          className={`h-1.5 flex-1 rounded-full transition-all ${
                            idx < currentStage ? 'bg-emerald-500' : idx === currentStage ? 'bg-[#2563EB]' : 'bg-slate-200 dark:bg-white/10'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="mt-1.5 text-xs font-semibold text-[#2563EB]">{WORKFLOW[currentStage]}</p>
                  </div>
                </motion.div>
              )
            })
          )}
        </CardContent>
      </Card>
    </div>
  )
}

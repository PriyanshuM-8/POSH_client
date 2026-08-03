import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  PlusCircle, ClipboardList, CheckCircle2, CalendarClock,
  FileText, Bell, RefreshCw, AlertTriangle,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { SkeletonCard, SkeletonTable } from '@/components/ui/Skeleton'
import EmptyState from '@/components/ui/EmptyState'
import { usePosh } from '@/context/PoshContext'
import { getDashboardService } from '@/services/dashboardService'

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

export default function EmployeeDashboard() {
  const navigate = useNavigate()
  const { currentUser } = usePosh()
  const user = currentUser || {}

  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getDashboardService()
      setDashboardData(data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load your complaints.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const complaints = dashboardData?.complaints || []
  const openCount = dashboardData?.openCount || 0
  const closedCount = dashboardData?.closedCount || 0
  const activeCase = dashboardData?.activeCase || null

  const stats = [
    { label: 'Total Complaints', value: complaints.length, icon: FileText, tone: 'from-[#2563EB] to-blue-600' },
    { label: 'Open Cases', value: openCount, icon: ClipboardList, tone: 'from-[#F59E0B] to-amber-600' },
    { label: 'Closed Cases', value: closedCount, icon: CheckCircle2, tone: 'from-[#16A34A] to-emerald-600' },
  ]

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
      {/* Welcome banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-[#1e3a8a] to-[#2563EB] p-6 text-white shadow-lg"
      >
        <div className="absolute inset-0 opacity-10 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:24px_24px]" />
        <div className="relative flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium text-blue-200">Welcome back,</p>
            <h1 className="text-2xl font-bold">{user.fullName || 'Employee'}</h1>
            <p className="mt-1 text-sm text-blue-200">{user.email} · {new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}</p>
          </div>
          <Button
            onClick={() => navigate('/complaints/new')}
            className="shrink-0 bg-white text-[#2563EB] hover:bg-blue-50 font-semibold"
          >
            <PlusCircle className="h-4 w-4" /> Raise New Complaint
          </Button>
        </div>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
          : stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} whileHover={{ y: -3 }}>
              <Card className="h-full">
                <CardContent className="p-5">
                  <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${s.tone} shadow-sm`}>
                    <s.icon className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-slate-800 dark:text-white">{s.value}</p>
                  <p className="mt-0.5 text-xs font-medium text-slate-500">{s.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))
        }
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Active complaint progress */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Active Complaint Progress</CardTitle>
            <CardDescription>
              {activeCase ? `Case: ${activeCase.caseRef?.caseId || activeCase._id?.slice(-8).toUpperCase()}` : 'No active complaint'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="h-7 w-7 rounded-full bg-slate-200 dark:bg-white/10 animate-pulse" />
                    <div className="flex-1 space-y-1.5 pt-1">
                      <div className="h-3 w-32 rounded bg-slate-200 dark:bg-white/10 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : activeCase ? (
              (() => {
                const activeStatus = activeCase.caseRef && typeof activeCase.caseRef === 'object' && activeCase.caseRef.status ? activeCase.caseRef.status : activeCase.status;
                const currentStage = STATUS_TO_STAGE[activeStatus] ?? 0;
                return (
                  <>
                    <div className="mb-5 flex flex-wrap items-center gap-2">
                      <Badge variant={STATUS_VARIANT[activeStatus] || 'neutral'}>{activeStatus?.replace(/_/g, ' ')}</Badge>
                      <Badge variant={PRIORITY_VARIANT[activeCase.priority] || 'neutral'}>{activeCase.priority}</Badge>
                      <span className="text-xs text-slate-400">Filed {new Date(activeCase.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</span>
                    </div>
                    <ol className="relative pl-2">
                      {WORKFLOW.map((stage, i) => {
                        const done = i < currentStage
                        const active = i === currentStage
                        return (
                          <li key={i} className="relative flex gap-4 pb-5 last:pb-0">
                            <div className="flex flex-col items-center">
                              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-all ${
                                done ? 'border-emerald-500 bg-emerald-500 text-white'
                                : active ? 'border-[#2563EB] bg-[#2563EB] text-white ring-4 ring-blue-100 dark:ring-blue-500/20'
                                : 'border-slate-200 bg-white text-slate-400 dark:border-white/10 dark:bg-slate-800'
                              }`}>
                                {done ? '✓' : i + 1}
                              </div>
                              {i < WORKFLOW.length - 1 && (
                                <div className={`mt-1 w-0.5 flex-1 ${done ? 'bg-emerald-400' : 'bg-slate-200 dark:bg-white/10'}`} style={{ minHeight: 20 }} />
                              )}
                            </div>
                            <div className="pb-1 pt-0.5">
                              <p className={`text-sm font-semibold ${active ? 'text-[#2563EB] dark:text-blue-400' : done ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400'}`}>
                                {stage}
                              </p>
                              {active && <p className="mt-0.5 text-xs text-slate-400">Currently under review.</p>}
                            </div>
                          </li>
                        )
                      })}
                    </ol>
                  </>
                );
              })()
            ) : (
              <EmptyState
                title="No active complaints"
                description="You have no ongoing complaints. Raise a new complaint if needed."
                action={() => navigate('/complaints/new')}
                actionLabel="Raise Complaint"
              />
            )}
          </CardContent>
        </Card>

        {/* My complaints list */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>My Complaints</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/my-complaints')} className="text-xs">View all</Button>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {loading ? (
              <SkeletonTable rows={3} cols={2} />
            ) : complaints.length === 0 ? (
              <EmptyState title="No complaints yet" />
            ) : (
              complaints.slice(0, 4).map((c) => (
                <div
                  key={c._id}
                  onClick={() => c.caseRef ? navigate(`/cases/${c.caseRef._id || c.caseRef}`) : null}
                  className="cursor-pointer rounded-xl border border-slate-100 p-3 hover:bg-slate-50/60 dark:border-white/5 dark:hover:bg-white/5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-mono text-xs font-semibold text-[#2563EB]">{c._id?.slice(-8).toUpperCase()}</p>
                    <Badge variant={STATUS_VARIANT[c.status] || 'neutral'} className="text-[10px]">{c.status?.replace(/_/g, ' ')}</Badge>
                  </div>
                  <p className="mt-1 truncate text-xs font-medium text-slate-600 dark:text-slate-300">{c.title}</p>
                  <p className="mt-0.5 text-[10px] text-slate-400">{new Date(c.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

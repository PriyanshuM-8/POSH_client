import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FolderKanban, Calendar, CheckCircle2, ChevronRight,
  ShieldCheck, AlertTriangle, RefreshCw,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { SkeletonCard, SkeletonTable } from '@/components/ui/Skeleton'
import EmptyState from '@/components/ui/EmptyState'
import { usePosh } from '@/context/PoshContext'
import { getDashboardService } from '@/services/dashboardService'

const STATUS_VARIANT = {
  OPEN: 'info',
  UNDER_INVESTIGATION: 'warning',
  EVIDENCE_COLLECTION: 'warning',
  HEARING_SCHEDULED: 'warning',
  LEGAL_REVIEW: 'default',
  COMMITTEE_RECOMMENDATION: 'info',
  POSH_ADMIN_REVIEW: 'warning',
  CLOSED: 'success',
}

const PRIORITY_VARIANT = { LOW: 'neutral', MEDIUM: 'warning', HIGH: 'danger', CRITICAL: 'danger' }

export default function ExternalDashboard() {
  const navigate = useNavigate()
  const { currentUser } = usePosh()

  const [cases, setCases] = useState([])
  const [hearings, setHearings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getDashboardService()
      setCases(data.cases || [])
      setHearings(data.hearings || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const openCases = cases.filter(c => c.status !== 'CLOSED')
  const scheduledHearings = hearings.filter(h => h.status === 'SCHEDULED' || h.status === 'Scheduled')
  const completedHearings = hearings.filter(h => h.status === 'COMPLETED' || h.status === 'Completed')

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
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 p-6 text-white shadow-lg"
      >
        <div className="absolute inset-0 opacity-10 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:24px_24px]" />
        <div className="relative flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-300">EXTERNAL COMMITTEE PORTAL</p>
            <h1 className="mt-1 text-2xl font-bold">Hello, {currentUser?.fullName}</h1>
            <p className="mt-1 text-sm text-slate-300">Independent advisor overseeing {openCases.length} active statutory investigations.</p>
          </div>
          <Badge variant="warning" dot className="bg-white/10 ring-white/10 text-white shrink-0">
            INDEPENDENT MEMBER
          </Badge>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {loading ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />) : (
          <>
            <Card>
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase">Oversight Cases</p>
                  <p className="text-2xl font-bold mt-1 text-slate-800 dark:text-white">{cases.length}</p>
                </div>
                <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center dark:bg-indigo-500/10">
                  <FolderKanban className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase">Scheduled Meetings</p>
                  <p className="text-2xl font-bold mt-1 text-slate-800 dark:text-white">{scheduledHearings.length}</p>
                </div>
                <div className="h-10 w-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center dark:bg-amber-500/10">
                  <Calendar className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase">Decisions Completed</p>
                  <p className="text-2xl font-bold mt-1 text-slate-800 dark:text-white">{completedHearings.length}</p>
                </div>
                <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center dark:bg-emerald-500/10">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Case Advisory Panel</CardTitle>
            <CardDescription>Review evidence, hearings records, and submit recommendations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {loading ? <SkeletonTable rows={4} cols={3} /> : cases.length === 0 ? (
              <EmptyState icon={ShieldCheck} title="No cases assigned" description="All current complaints resolved successfully." />
            ) : (
              cases.slice(0, 6).map(c => (
                <div
                  key={c._id}
                  onClick={() => navigate(`/cases/${c._id}`)}
                  className="group cursor-pointer rounded-2xl border border-slate-100 p-4 transition-all hover:bg-slate-50/50 dark:border-white/5 dark:hover:bg-white/5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-xs font-semibold text-[#2563EB]">{c.caseId}</p>
                      <p className="text-sm font-semibold mt-1 text-slate-800 dark:text-white">{c.complaint?.title || 'Case'}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{new Date(c.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <Badge variant={PRIORITY_VARIANT[c.complaint?.priority] || 'neutral'}>{c.complaint?.priority || 'MEDIUM'}</Badge>
                      <Badge variant={STATUS_VARIANT[c.status] || 'info'}>{c.status?.replace(/_/g, ' ')}</Badge>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-end border-t border-slate-50 pt-2 text-xs dark:border-white/5">
                    <span className="flex items-center gap-1 text-[#2563EB] font-medium group-hover:translate-x-0.5 transition-transform">
                      Enter Case Workspace <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Meeting Schedule</CardTitle>
            <CardDescription>Your advisory hearing meetings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {loading ? <SkeletonTable rows={3} cols={2} /> : scheduledHearings.length === 0 ? (
              <EmptyState title="No meetings scheduled" />
            ) : (
              scheduledHearings.slice(0, 5).map(h => (
                <div key={h._id} className="rounded-xl border border-slate-100 p-3 bg-slate-50/50 space-y-1.5 dark:border-white/5 dark:bg-white/5">
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-xs text-[#2563EB] font-semibold">{h.case?.caseId || '—'}</p>
                    <Badge variant="warning">Scheduled</Badge>
                  </div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {h.scheduledDate ? new Date(h.scheduledDate).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : '—'}
                  </p>
                  <p className="text-xs text-slate-500">{h.venue || h.location || 'Virtual'}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

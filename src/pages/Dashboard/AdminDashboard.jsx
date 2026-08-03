import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import {
  FileText, FolderOpen, Search, CalendarClock, AlertTriangle,
  CheckCircle2, Clock, ArrowUpRight, Users, TrendingUp, RefreshCw,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { SkeletonCard, SkeletonChart, SkeletonTable } from '@/components/ui/Skeleton'
import EmptyState from '@/components/ui/EmptyState'
import { useNavigate } from 'react-router-dom'
import { usePosh } from '@/context/PoshContext'
import { getDashboardService } from '@/services/dashboardService'

const STATUS_COLORS = {
  OPEN: '#2563EB',
  UNDER_INVESTIGATION: '#F59E0B',
  CLOSED: '#16A34A',
  LEGAL_REVIEW: '#8B5CF6',
  COMMITTEE_RECOMMENDATION: '#06B6D4',
  POSH_ADMIN_REVIEW: '#F97316',
}

const STATUS_VARIANT = {
  OPEN: 'info',
  UNDER_INVESTIGATION: 'warning',
  EVIDENCE_COLLECTION: 'warning',
  HEARING_SCHEDULED: 'warning',
  LEGAL_REVIEW: 'default',
  COMMITTEE_RECOMMENDATION: 'info',
  POSH_ADMIN_REVIEW: 'warning',
  CLOSED: 'success',
  APPEALED: 'danger',
  PENDING_REVIEW: 'neutral',
  UNDER_REVIEW: 'warning',
  ACCEPTED: 'info',
  REJECTED: 'danger',
  CASE_CREATED: 'info',
  INVESTIGATION: 'warning',
}

const PRIORITY_VARIANT = { HIGH: 'danger', MEDIUM: 'warning', LOW: 'neutral', CRITICAL: 'danger' }

const iconMap = [FileText, TrendingUp, FolderOpen, Search, CheckCircle2, CalendarClock, AlertTriangle, Users]
const toneMap = {
  info: 'from-[#2563EB] to-blue-600',
  warning: 'from-[#F59E0B] to-amber-600',
  success: 'from-[#16A34A] to-emerald-600',
  danger: 'from-[#DC2626] to-red-600',
  default: 'from-slate-500 to-slate-600',
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { currentUser } = usePosh()

  const [cases, setCases] = useState([])
  const [complaints, setComplaints] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getDashboardService()
      setCases(data.cases || [])
      setComplaints(data.complaints || [])
      setUsers(data.users || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  // Derived stats
  const openCases = cases.filter(c => c.status === 'OPEN').length
  const underInvestigation = cases.filter(c => c.status === 'UNDER_INVESTIGATION').length
  const legalReview = cases.filter(c => c.status === 'LEGAL_REVIEW').length
  const closedCases = cases.filter(c => c.status === 'CLOSED').length
  const pendingAdminReview = cases.filter(c => c.status === 'POSH_ADMIN_REVIEW').length
  const totalComplaints = complaints.length
  const totalEmployees = users.length

  // Build status pie from real cases
  const statusGroups = cases.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1
    return acc
  }, {})
  const statusPieData = Object.entries(statusGroups).map(([name, value]) => ({
    name,
    value,
    color: STATUS_COLORS[name] || '#94a3b8',
  }))

  const adminStats = [
    { label: 'Total Complaints', value: totalComplaints, delta: 'All registered filings', tone: 'default' },
    { label: 'Open Cases', value: openCases, delta: 'Active inquiry stages', tone: 'info' },
    { label: 'Under Investigation', value: underInvestigation, delta: 'IC proceedings active', tone: 'warning' },
    { label: 'Legal Review', value: legalReview, delta: 'Awaiting legal opinion', tone: 'default' },
    { label: 'Pending Admin Review', value: pendingAdminReview, delta: 'Awaiting final decision', tone: 'danger' },
    { label: 'Closed Cases', value: closedCases, delta: 'Resolved cases', tone: 'success' },
    { label: 'Total Employees', value: totalEmployees, delta: 'Active org roster', tone: 'default' },
  ]

// statusPieData is loaded directly from dashboardData

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
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Compliance Overview</h1>
          <p className="mt-0.5 text-sm text-slate-500">Organisation-wide snapshot — live data.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="success" dot>Live</Badge>
          <Button size="sm" onClick={() => navigate('/complaints/new')}>+ New Complaint</Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-7">
        {loading
          ? Array.from({ length: 7 }).map((_, i) => <SkeletonCard key={i} />)
          : adminStats.map((s, i) => {
              const Icon = iconMap[i] || FileText
              return (
                <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} whileHover={{ y: -3 }}>
                  <Card className="group h-full cursor-pointer overflow-hidden" onClick={() => navigate(i <= 1 ? '/complaints' : '/cases')}>
                    <CardContent className="p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${toneMap[s.tone]} shadow-sm`}>
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                        <ArrowUpRight className="h-3.5 w-3.5 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#2563EB]" />
                      </div>
                      <p className="text-2xl font-bold text-slate-800 dark:text-white">{s.value}</p>
                      <p className="mt-0.5 text-xs font-medium text-slate-500">{s.label}</p>
                      <p className="mt-2 text-[11px] text-slate-400">{s.delta}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })
        }
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Case Status Distribution</CardTitle>
            <CardDescription>Current breakdown of all cases by status</CardDescription>
          </CardHeader>
          <CardContent className="pl-0">
            {loading ? <SkeletonChart height={240} /> : statusPieData.length === 0 ? (
              <EmptyState title="No case data yet" description="Cases will appear here once complaints are processed." />
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={statusPieData} margin={{ left: 8, right: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={48}>
                    {statusPieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status Breakdown</CardTitle>
            <CardDescription>Pie view of case distribution</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? <SkeletonChart height={180} /> : statusPieData.length === 0 ? (
              <EmptyState title="No data" />
            ) : (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={statusPieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={75} paddingAngle={3}>
                      {statusPieData.map((entry, i) => <Cell key={i} fill={entry.color} stroke="none" />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {statusPieData.map((s) => (
                    <div key={s.name} className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                      <span className="truncate">{s.name}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Complaints Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Complaints</CardTitle>
            <CardDescription>Latest registered filings</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/complaints')}>View All</Button>
        </CardHeader>
        <CardContent className="overflow-x-auto pt-0">
          {loading ? <SkeletonTable rows={5} cols={6} /> : complaints.length === 0 ? (
            <EmptyState
              title="No complaints found"
              description="No complaints have been submitted yet."
              action={() => navigate('/complaints/new')}
              actionLabel="Submit First Complaint"
            />
          ) : (
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400 dark:border-white/10">
                  {['Complaint ID', 'Title', 'Status', 'Priority', 'Committee', 'Filed On'].map((h) => (
                    <th key={h} className="py-2.5 pr-4 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {complaints.map((c) => (
                  <tr
                    key={c._id}
                    onClick={() => c.caseRef ? navigate(`/cases/${encodeURIComponent(c.caseRef)}`) : null}
                    className="cursor-pointer border-b border-slate-50 last:border-0 hover:bg-slate-50/60 dark:border-white/5 dark:hover:bg-white/5"
                  >
                    <td className="py-3 pr-4 font-mono text-xs font-medium text-[#2563EB] dark:text-blue-300">
                      {c._id?.slice(-8).toUpperCase()}
                    </td>
                    <td className="py-3 pr-4 max-w-[200px]">
                      <p className="truncate font-medium text-slate-700 dark:text-slate-200">{c.title}</p>
                      <p className="text-xs text-slate-400">{c.incidentLocation}</p>
                    </td>
                    <td className="py-3 pr-4">
                      <Badge variant={STATUS_VARIANT[c.status] || 'neutral'}>{c.status?.replace(/_/g, ' ')}</Badge>
                    </td>
                    <td className="py-3 pr-4">
                      <Badge variant={PRIORITY_VARIANT[c.priority] || 'neutral'}>{c.priority}</Badge>
                    </td>
                    <td className="py-3 pr-4 text-slate-500 dark:text-slate-400">
                      {c.assignedCommittee?.name || <span className="italic text-slate-300">Unassigned</span>}
                    </td>
                    <td className="py-3 pr-4 text-slate-500 dark:text-slate-400">
                      {new Date(c.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

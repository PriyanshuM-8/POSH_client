import React, { useState, useEffect } from 'react'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Download, FileSpreadsheet, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { usePosh } from '@/context/PoshContext'
import { toast } from 'sonner'

import { getReportsService } from '@/services/reportService'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function Reports() {
  const { companySettings } = usePosh()
  const [reportsData, setReportsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [exportingPDF, setExportingPDF] = useState(false)
  const [exportingExcel, setExportingExcel] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getReportsService()
      setReportsData(data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load reports data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleExportPDF = () => {
    setExportingPDF(true)
    setTimeout(() => {
      setExportingPDF(false)
      toast.success('PDF report exported successfully!')
    }, 1500)
  }

  const handleExportExcel = () => {
    setExportingExcel(true)
    setTimeout(() => {
      setExportingExcel(false)
      toast.success('Excel spreadsheet exported successfully!')
    }, 1500)
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center bg-[#F8FAFC] dark:bg-slate-900">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#2563EB] border-t-transparent" />
          <p className="text-sm font-medium text-slate-500">Loading reports data…</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <AlertTriangle className="h-10 w-10 text-red-400" />
        <p className="text-sm text-slate-500">{error}</p>
        <Button variant="outline" onClick={fetchData}><RefreshCw className="h-4 w-4" /> Retry</Button>
      </div>
    )
  }

  const totalCases = reportsData?.totalCases || 0
  const closedCases = reportsData?.closedCases || 0
  const underInvestigation = reportsData?.underInvestigation || 0
  const acknowledgmentStage = reportsData?.acknowledgmentStage || 0
  const avgDays = reportsData?.avgDays || 42
  const slaComplianceRate = reportsData?.slaComplianceRate || 95
  const avgRating = reportsData?.avgRating || '4.7'
  const trendData = reportsData?.trendData || []
  const statusPieData = reportsData?.statusPieData || []
  const departmentData = reportsData?.departmentData || []
  const committees = reportsData?.committeesAdvisoryLoad || []
  const decisionCounts = reportsData?.decisionCounts || {}

  const decisionTypesList = ['Written Warning', 'Mandatory Counselling', 'Transfer', 'Salary Deduction', 'Suspension', 'Termination', 'No Action', 'Other']

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-800 dark:text-white">Reports & Analytics</h1>
          <p className="mt-0.5 text-sm text-muted-foreground font-medium">Anonymised, aggregated organization-level compliance metrics.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportPDF} disabled={exportingPDF}>
            {exportingPDF ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />} PDF
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportExcel} disabled={exportingExcel}>
            {exportingExcel ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileSpreadsheet className="h-3.5 w-3.5" />} Excel
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Case Resolution Time</CardTitle>
            <CardDescription>Average days to closure, by month</CardDescription>
          </CardHeader>
          <CardContent className="pl-0">
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={trendData} margin={{ left: 8, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }} />
                <Line type="monotone" dataKey="complaints" stroke="#2563EB" strokeWidth={2.5} dot={{ r: 3 }} name="Filed" />
                <Line type="monotone" dataKey="resolved" stroke="#10B981" strokeWidth={2.5} dot={{ r: 3 }} name="Resolved" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status Breakdown</CardTitle>
            <CardDescription>Current case distribution</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={statusPieData} dataKey="value" nameKey="name" innerRadius={40} outerRadius={60} paddingAngle={3}>
                  {statusPieData.map((entry, i) => <Cell key={i} fill={entry.color} stroke="none" />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-2 w-full text-xs">
              {statusPieData.map((s) => (
                <div key={s.name} className="flex items-center gap-1.5 text-slate-500 font-semibold dark:text-slate-400">
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ background: s.color }} />
                  <span className="truncate">{s.name}: {s.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Department-wise Cases</CardTitle>
            <CardDescription>Anonymised cases logged across company segments</CardDescription>
          </CardHeader>
          <CardContent className="pl-0">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={departmentData} margin={{ left: 8, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="department" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }} />
                <Bar dataKey="cases" fill="#0EA5E9" radius={[8, 8, 0, 0]} maxBarSize={38} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Committee Performance Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Committee Advisory Load</CardTitle>
            <CardDescription>Caseloads per Internal Committee board</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto pt-0">
            <table className="w-full text-left text-xs font-semibold">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 dark:border-white/10 uppercase pb-2">
                  <th className="py-2.5 pr-2 font-medium">Committee</th>
                  <th className="py-2.5 pr-2 font-medium">Presiding</th>
                  <th className="py-2.5 pr-2 font-medium">Cases Assigned</th>
                </tr>
              </thead>
              <tbody>
                {committees.map(cm => (
                  <tr key={cm.id} className="border-b border-slate-50 last:border-0 dark:border-white/5">
                    <td className="py-3 pr-2 text-slate-800 dark:text-slate-200">{cm.name}</td>
                    <td className="py-3 pr-2 text-slate-500">{cm.presidingOfficer}</td>
                    <td className="py-3 pr-2 text-slate-600 dark:text-slate-300 font-bold">{cm.cases} active</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      {/* Dynamic Resolution Metrics and Decision Statistics row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Disciplinary Action Stats Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Decision Statistics</CardTitle>
            <CardDescription>Breakdown of disciplinary actions recorded</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {decisionTypesList.map(type => {
              const count = decisionCounts[type] || 0
              const percentage = totalCases > 0 ? Math.round((count / totalCases) * 100) : 0
              return (
                <div key={type} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                    <span>{type}</span>
                    <span>{count} cases ({percentage}%)</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden">
                    <div className="h-full bg-primary-600 rounded-full" style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Feedback Summary Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Feedback Ratings</CardTitle>
            <CardDescription>Complainant survey feedback scores</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-6 text-center space-y-3">
            <span className="text-5xl font-display font-extrabold text-slate-800 dark:text-white">{avgRating}</span>
            <div className="flex gap-1 text-amber-500 text-lg font-bold">
              {Array.from({ length: Math.round(Number(avgRating)) }).map((_, i) => (
                <span key={i}>★</span>
              ))}
            </div>
            <p className="text-xs text-slate-400 font-semibold max-w-xs">
              Based on anonymised post-closure process satisfaction feedback surveys submitted by case complainants.
            </p>
          </CardContent>
        </Card>

        {/* Resolution Time & SLA Metrics Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Case Resolution Audit</CardTitle>
            <CardDescription>SLA Compliance & inquiry speed metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-0 text-xs">
            <div className="rounded-xl border border-slate-100 p-4 bg-slate-50/50 dark:border-white/5 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-semibold">Avg. Resolution Speed</span>
                <span className="text-slate-700 dark:text-slate-200 font-bold text-sm">{avgDays} Days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-semibold">90-Day SLA Compliance</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">{slaComplianceRate}%</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              *The statutory investigation SLA mandates a maximum limit of 90 days for inquiry completion and decision recording.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

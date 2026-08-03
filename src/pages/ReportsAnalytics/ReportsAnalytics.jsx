import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, FileText, Download, Filter, Calendar, TrendingUp, 
  Users, ShieldCheck, AlertTriangle, RefreshCw, Activity
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts'
import EmptyState from '@/components/ui/EmptyState'
import { usePosh } from '@/context/PoshContext'
import { getReportsService } from '@/services/reportService'
import { toast } from 'sonner'

const COLORS = ['#2563EB', '#F59E0B', '#16A34A', '#8B5CF6', '#06B6D4', '#DC2626']

export default function ReportsAnalytics() {
  const { currentUser } = usePosh()
  const [reportData, setReportData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getReportsService()
      setReportData(data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  // Calculate statistics
  const stats = {
    totalComplaints: reportData?.totalComplaints || 0,
    activeCases: (reportData?.totalCases || 0) - (reportData?.closedCases || 0),
    closedCases: reportData?.closedCases || 0,
    complianceScore: reportData?.slaComplianceRate || 100,
  }

  // Status breakdown data
  const statusData = reportData ? [
    { name: 'Acknowledgement', value: reportData.acknowledgmentStage || 0, color: '#94a3b8' },
    { name: 'Under Investigation', value: reportData.underInvestigation || 0, color: '#F59E0B' },
    { name: 'Closed', value: reportData.closedCases || 0, color: '#10B981' }
  ] : []

  // Department-wise complaints
  const departmentData = (reportData?.departmentData || []).map((d, i) => ({
    name: d.department,
    count: d.cases,
    color: COLORS[i % COLORS.length]
  }))

  // Monthly trend data
  const monthlyData = (reportData?.trendData || []).map(t => ({
    month: t.month,
    complaints: t.complaints,
    cases: t.resolved
  }))

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
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Reports & Analytics</h1>
          <p className="mt-0.5 text-sm text-slate-500">Compliance analytics and reports</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
          <Button>
            <Download className="h-4 w-4" /> Export PDF
          </Button>
        </div>
      </div>

      {/* Key Statistics */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase">Total Complaints</p>
                <p className="mt-1 text-2xl font-bold text-slate-800 dark:text-white">{stats.totalComplaints}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                <FileText className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase">Active Cases</p>
                <p className="mt-1 text-2xl font-bold text-slate-800 dark:text-white">{stats.activeCases}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                <Activity className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase">Closed Cases</p>
                <p className="mt-1 text-2xl font-bold text-slate-800 dark:text-white">{stats.closedCases}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase">Compliance Score</p>
                <p className="mt-1 text-2xl font-bold text-slate-800 dark:text-white">{stats.complianceScore}%</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Complaint Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Complaint Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {loading ? (
              <div className="h-full animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
            ) : statusData.length === 0 ? (
              <EmptyState title="No data available" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Monthly Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Complaint Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {loading ? (
              <div className="h-full animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="complaints" name="Complaints" fill="#2563EB" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="cases" name="Cases" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Department-wise Complaints */}
      <Card>
        <CardHeader>
          <CardTitle>Department-wise Complaints</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-10 w-full rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {departmentData.map((dept) => (
                <div key={dept.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full" style={{ background: dept.color }} />
                      <span className="font-medium text-slate-700 dark:text-slate-300">{dept.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-800 dark:text-white">{dept.count} complaints</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                    <div 
                      className="h-2 rounded-full" 
                      style={{ 
                        width: `${(dept.count / Math.max(...departmentData.map(d => d.count))) * 100}%`,
                        background: dept.color 
                      }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

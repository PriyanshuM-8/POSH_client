import React, { useState, useEffect, useMemo } from 'react'
import { ScrollText, Globe, Search, AlertTriangle, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { getAuditLogsService } from '@/services/auditLogService'

export default function AuditLogs() {
  const [auditLogs, setAuditLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')
  const [filterAction, setFilterAction] = useState('All')

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const logs = await getAuditLogsService()
      setAuditLogs(logs || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load audit logs.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const filteredLogs = useMemo(() => {
    return auditLogs.filter(l => {
      const matchQuery = (l.user || '').toLowerCase().includes(query.toLowerCase()) || 
                          (l.action || '').toLowerCase().includes(query.toLowerCase()) ||
                          (l.target || '').toLowerCase().includes(query.toLowerCase())
      const matchAction = filterAction === 'All' || 
                           (filterAction === 'Authentication' && (l.action || '').toLowerCase().includes('log')) ||
                           (filterAction === 'Case Actions' && ((l.action || '').toLowerCase().includes('case') || (l.action || '').toLowerCase().includes('complaint')))
      return matchQuery && matchAction
    })
  }, [auditLogs, query, filterAction])

  const actionTypes = ['All', 'Authentication', 'Case Actions']

  if (loading) {
    return (
      <div className="flex h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-[40vh] flex-col items-center justify-center gap-3">
        <AlertTriangle className="h-8 w-8 text-red-500" />
        <p className="text-sm text-slate-500">{error}</p>
        <Button size="sm" onClick={fetchData}><RefreshCw className="h-3 w-3" /> Retry</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-800 dark:text-white">Audit Logs</h1>
        <p className="mt-0.5 text-sm text-muted-foreground font-medium">Statutory system tracing index. Access logs are legally admissible.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-2 pb-0">
          <ScrollText className="h-5 w-5 text-primary-600" />
          <div>
            <CardTitle>Activity History</CardTitle>
            <CardDescription>Track modifications, actions, and credentials authorizations</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-5">
          {/* Filters */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search audit trail..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-3 text-sm focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {actionTypes.map(type => (
                <button
                  key={type}
                  onClick={() => setFilterAction(type)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                    filterAction === type
                      ? 'bg-primary-600 text-white shadow-soft'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-400'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Audit trail table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400 dark:border-white/10">
                  <th className="py-2.5 pr-4 font-medium">User Profile</th>
                  <th className="py-2.5 pr-4 font-medium">Action Log</th>
                  <th className="py-2.5 pr-4 font-medium">Target Registry</th>
                  <th className="py-2.5 pr-4 font-medium">IP Address</th>
                  <th className="py-2.5 pr-4 font-medium">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 font-medium">No audit logs found.</td>
                  </tr>
                ) : (
                  filteredLogs.map((l, i) => (
                    <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/30 dark:border-white/5">
                      <td className="py-3 pr-4 font-semibold text-slate-700 dark:text-slate-200">{l.user}</td>
                      <td className="py-3 pr-4 text-slate-600 dark:text-slate-300 font-medium">{l.action}</td>
                      <td className="py-3 pr-4 font-mono text-xs text-primary-700 dark:text-primary-300">{l.target}</td>
                      <td className="py-3 pr-4 text-slate-500 font-semibold">
                        <span className="flex items-center gap-1"><Globe className="h-3.5 w-3.5 text-slate-400" /> {l.ip}</span>
                      </td>
                      <td className="py-3 pr-4 text-slate-400 text-xs font-medium">{l.time}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

import React, { useEffect, useState } from 'react'
import { Archive as ArchiveIcon, RotateCcw, Trash2, AlertTriangle, RefreshCw } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { getAllCasesService } from '@/services/caseService'

export default function Archive() {
  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getAllCasesService({ limit: 100 })
      setCases(res?.cases || res || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load cases.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const archived = cases.filter((c) => c.status === 'CLOSED' || c.status === 'CLOSED_CASES')

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
        <h1 className="font-display text-2xl font-bold text-slate-800 dark:text-white">Archive</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">Retained per policy — restore or permanently delete with authorization.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400 dark:border-white/10">
                <th className="px-5 py-3 font-medium">Case ID</th>
                <th className="px-5 py-3 font-medium">Complainant</th>
                <th className="px-5 py-3 font-medium">Closed On</th>
                <th className="px-5 py-3 font-medium">Retention</th>
                <th className="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {archived.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 font-medium">No archived cases found.</td>
                </tr>
              ) : (
                archived.map((c) => (
                  <tr key={c._id} className="border-b border-slate-50 last:border-0 dark:border-white/5">
                    <td className="flex items-center gap-2.5 px-5 py-3.5 font-mono text-xs font-medium text-primary-700 dark:text-primary-300">
                      <ArchiveIcon className="h-4 w-4 text-slate-400" /> {c.caseId}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">{c.complainant?.fullName || '—'}</td>
                    <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">{new Date(c.updatedAt).toLocaleDateString()}</td>
                    <td className="px-5 py-3.5"><Badge variant="neutral">7 years remaining</Badge></td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-3">
                        <Button size="sm" variant="outline"><RotateCcw className="h-3.5 w-3.5" /> Restore</Button>
                        <Button size="sm" variant="destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}

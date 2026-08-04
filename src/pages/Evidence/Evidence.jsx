import React, { useEffect, useState, useMemo } from 'react'
import { ShieldCheck, UploadCloud, FileText, AlertTriangle, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { getAllCasesService } from '@/services/caseService'

export default function Evidence() {
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
      setError(err.response?.data?.message || 'Failed to load evidence index.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const evidenceItems = useMemo(() => {
    const items = []
    cases.forEach((c) => {
      if (c.evidence && c.evidence.length > 0) {
        c.evidence.forEach((ev, idx) => {
          // ev can be populated object or just an ObjectId string (fallback)
          if (typeof ev !== 'object' || !ev._id) return
          items.push({
            id: ev._id || `EV-${c.caseId}-${idx + 1}`,
            fileName: ev.originalName || ev.fileName || 'Evidence Document',
            fileUrl: ev.secureUrl || ev.url || null,
            fileType: ev.fileType || 'DOCUMENT',
            caseId: c.caseId,
            date: new Date(ev.createdAt || c.createdAt).toLocaleDateString('en-IN'),
            status: ev.isVerified ? 'Verified' : 'Pending Review',
          })
        })
      }
    })
    return items
  }, [cases])

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
        <h1 className="font-display text-2xl font-bold text-slate-800 dark:text-white">Evidence Management</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">Indexed with chain of custody — access is logged for every view.</p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-slate-200 p-10 text-center dark:border-white/10">
          <UploadCloud className="h-8 w-8 text-primary-500" />
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Drag & drop evidence files to add to the index</p>
          <p className="text-xs text-muted-foreground">Supports images, video, audio, and documents · Encrypted storage</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Evidence Index</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {evidenceItems.length === 0 ? (
            <div className="col-span-full py-8 text-center text-slate-400 font-medium text-sm">No evidence documents indexed yet.</div>
          ) : (
            evidenceItems.map((e) => (
              <div key={e.id} className="rounded-xl border border-slate-100 p-4 transition-shadow hover:shadow-card dark:border-white/10">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-500/10">
                  <FileText className="h-5 w-5 text-primary-600" />
                </div>
                <p className="font-mono text-xs font-semibold text-primary-700 dark:text-primary-300">Case ID: {e.caseId}</p>
                <p className="mt-0.5 text-sm font-medium text-slate-700 dark:text-slate-200 truncate" title={e.fileName}>{e.fileName}</p>
                <p className="text-xs text-muted-foreground">Uploaded: {e.date}</p>
                <div className="mt-2.5 flex items-center justify-between">
                  <Badge variant={e.status === 'Verified' ? 'success' : 'warning'} className="text-[10px]">{e.status}</Badge>
                  {e.fileUrl && e.fileUrl !== '#' && (
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => window.open(e.fileUrl, '_blank')}>View</Button>
                  )}
                  <ShieldCheck className="h-3.5 w-3.5 text-slate-300" />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}

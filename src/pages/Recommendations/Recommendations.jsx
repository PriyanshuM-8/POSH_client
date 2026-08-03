import React, { useEffect, useState, useMemo } from 'react'
import { ClipboardList, ShieldCheck, AlertCircle, ArrowRight, RefreshCw, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useNavigate } from 'react-router-dom'
import { getAllCasesService } from '@/services/caseService'

export default function Recommendations() {
  const navigate = useNavigate()
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
      setError(err.response?.data?.message || 'Failed to load recommendations.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Collect all recommendations across all cases
  const allRecommendations = useMemo(() => {
    const items = []
    cases.forEach((c) => {
      if (c.committeeRecommendation && c.committeeRecommendation.decision) {
        items.push({
          caseId: c._id,
          caseCode: c.caseId,
          caseTitle: c.complaint?.title || `Case ${c.caseId}`,
          role: 'IC_COMMITTEE',
          text: c.committeeRecommendation.remarks || `Decision: ${c.committeeRecommendation.decision}`,
          author: c.committeeRecommendation.recommendedBy?.fullName || 'Committee Chairperson',
          date: c.committeeRecommendation.recommendedAt
            ? new Date(c.committeeRecommendation.recommendedAt).toLocaleDateString()
            : new Date(c.createdAt).toLocaleDateString()
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
        <h1 className="font-display text-2xl font-bold text-slate-800 dark:text-white">Recommendations Center</h1>
        <p className="mt-0.5 text-sm text-muted-foreground font-medium">Consolidated index of committee advisory logs and case resolution findings.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Consolidated recommendations table */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Committee Advisory Log</CardTitle>
            <CardDescription>Advisory entries filed by internal and external independent members</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            {allRecommendations.length > 0 ? (
              <div className="space-y-3">
                {allRecommendations.map((rec, idx) => (
                  <div key={idx} className="rounded-xl border border-slate-100 p-4 space-y-2 dark:border-white/5 bg-slate-50/20">
                    <div className="flex items-center justify-between">
                      <p className="font-mono text-xs font-semibold text-primary-600 cursor-pointer" onClick={() => navigate(`/cases/${rec.caseId}`)}>
                        Case: {rec.caseCode}
                      </p>
                      <Badge variant="neutral">{rec.role}</Badge>
                    </div>
                    <p className="text-xs text-slate-400 font-semibold">{rec.caseTitle}</p>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium mt-1.5 dark:text-slate-300">
                      &ldquo;{rec.text}&rdquo;
                    </p>
                    <div className="flex justify-between items-center text-[10px] text-slate-400 pt-2 border-t border-slate-50/50 dark:border-white/5 font-semibold">
                      <span>Advisory filed by: {rec.author}</span>
                      <span>{rec.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center border border-dashed border-slate-100 rounded-2xl dark:border-white/5">
                <AlertCircle className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-600">No recommendations filed</p>
                <p className="text-xs text-slate-400">Committees have not submitted advisory entries for active cases yet.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Panel of cases awaiting reviews */}
        <Card>
          <CardHeader>
            <CardTitle>Case Advisory Audit</CardTitle>
            <CardDescription>Cases requiring recommendations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {cases.filter(c => c.status !== 'CLOSED').map(c => (
              <div key={c._id} className="rounded-xl border border-slate-100 p-3 space-y-1 bg-slate-50/50 dark:border-white/5 dark:bg-white/5">
                <p className="font-mono text-xs text-primary-600 font-semibold">{c.caseId}</p>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{c.complaint?.title || `Case ${c.caseId}`}</p>
                <p className="text-[10px] text-slate-400">Status: {c.status} · Recommendation: {c.committeeRecommendation?.decision ? 'Filed' : 'None'}</p>
                
                <div className="pt-2 flex justify-end">
                  <Button size="xs" variant="secondary" className="h-7 text-[10px] py-1 font-semibold" onClick={() => navigate(`/cases/${c._id}`)}>
                    Open Workspace <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

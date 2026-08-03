import React, { useEffect, useState } from 'react'
import { CalendarPlus, MapPin, Users, FileText, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { SkeletonCard, SkeletonTable } from '@/components/ui/Skeleton'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import { usePosh } from '@/context/PoshContext'
import { getAllHearingsService, scheduleHearingService } from '@/services/hearingService'
import { getAllCasesService } from '@/services/caseService'
import { toast } from 'sonner'

export default function Hearings() {
  const { currentUser } = usePosh()

  const [hearings, setHearings] = useState([])
  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showSchedule, setShowSchedule] = useState(false)
  const [scheduling, setScheduling] = useState(false)

  const [form, setForm] = useState({
    caseId: '',
    scheduledDate: '',
    scheduledTime: '',
    venue: '',
    type: 'Virtual',
    agenda: ''
  })

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [hearingsRes, casesRes] = await Promise.all([
        getAllHearingsService({ limit: 50 }),
        getAllCasesService({ limit: 50 }).catch(() => ({ cases: [] })),
      ])
      setHearings(hearingsRes?.hearings || hearingsRes || [])
      setCases(casesRes?.cases || casesRes || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load hearings.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const activeCases = cases.filter(c => c.status !== 'CLOSED')

  const handleScheduleSubmit = async (e) => {
    e.preventDefault()
    if (!form.caseId || !form.scheduledDate || !form.scheduledTime || !form.venue) return
    setScheduling(true)
    try {
      const hearing = await scheduleHearingService({
        case: form.caseId,
        scheduledDate: form.scheduledDate,
        scheduledTime: form.scheduledTime,
        venue: form.venue,
        type: form.type,
        agenda: form.agenda,
      })
      toast.success('Hearing scheduled successfully.')
      setShowSchedule(false)
      setForm({ caseId: '', scheduledDate: '', scheduledTime: '', venue: '', type: 'Virtual', agenda: '' })
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to schedule hearing.')
    } finally {
      setScheduling(false)
    }
  }

  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().toLocaleString('en-IN', { month: 'long' })
  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1)

  if (error) {
    return <ErrorState status={500} message={error} onRetry={fetchData} />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Hearings Calendar</h1>
          <p className="mt-0.5 text-sm text-slate-500 font-medium">Schedule inquiry sessions, record minutes, and track case attendance.</p>
        </div>
        <Button onClick={() => setShowSchedule(true)}>
          <CalendarPlus className="h-4 w-4" /> Schedule Session
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <CardHeader className="p-0">
            <CardTitle>Inquiry Hearings</CardTitle>
            <CardDescription>Review statutory sessions schedules</CardDescription>
          </CardHeader>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            ) : hearings.length === 0 ? (
              <div className="col-span-full">
                <EmptyState
                  title="No hearings scheduled"
                  description="Schedule your first inquiry session to get started."
                  action={() => setShowSchedule(true)}
                  actionLabel="Schedule Session"
                />
              </div>
            ) : (
              hearings.map((h, i) => (
                <Card key={h._id} className="group hover:-translate-y-0.5 hover:shadow-md transition-all">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <p className="font-mono text-xs font-semibold text-[#2563EB]">{h._id?.slice(-8).toUpperCase()} · {h.case?.caseId || '—'}</p>
                    <Badge variant={h.status === 'COMPLETED' ? 'success' : 'warning'}>{h.status?.replace(/_/g, ' ')}</Badge>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-0">
                    <p className="text-base font-bold text-slate-800 dark:text-white">
                      {h.scheduledDate ? new Date(h.scheduledDate).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : '—'}
                    </p>
                    <p className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                      <MapPin className="h-3.5 w-3.5" /> {h.venue || h.location || 'Virtual'}
                    </p>
                    <p className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                      <Users className="h-3.5 w-3.5" /> {h.attendees?.length || 0} Attendees
                    </p>

                    <div className="bg-slate-50 dark:bg-white/5 p-2 rounded-lg">
                      <p className="text-[11px] text-slate-500 leading-relaxed">{h.agenda}</p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{currentMonth} {currentYear}</CardTitle>
            <CardDescription>Statutory sessions overview calendar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(d => <span key={d}>{d}</span>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {daysInMonth.map(day => {
                const hasHearing = hearings.some(h => h.scheduledDate && new Date(h.scheduledDate).getDate() === day)
                return (
                  <div
                    key={day}
                    className={`flex h-8 w-full items-center justify-center rounded-lg text-xs font-semibold border ${hasHearing
                        ? 'bg-blue-50 border-blue-200 text-blue-700 font-bold dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-300'
                        : 'bg-transparent border-transparent text-slate-600 dark:text-slate-400'
                      }`}
                  >
                    {day}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal: Schedule Hearing */}
      {showSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full h-screen
          max-w-md overflow-y-auto rounded-2xl bg-white p-8 shadow-xl dark:bg-slate-800">
            <CardHeader className="p-1 pb-4">
              <CardTitle className="text-black text-2xl">Schedule Inquiry Session</CardTitle>
              <CardDescription>Setup details for official legal inquiry session</CardDescription>
            </CardHeader>
            <form onSubmit={handleScheduleSubmit} className="space-y-4">
              <div className="w-full">
                <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">Select Case</label>
                <select
                  value={form.caseId}
                  onChange={e => setForm(f => ({ ...f, caseId: e.target.value }))}
                  className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-200 focus:outline-none"
                  required
                >
                  <option value="">Select Case</option>
                  {activeCases.map(c => <option key={c._id} value={c._id}>{c.caseId} - {c.complaint?.title || 'Case'}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input label="Session Date" type="date" required value={form.scheduledDate} onChange={e => setForm(f => ({ ...f, scheduledDate: e.target.value }))} />
                <Input label="Session Time" type="time" required value={form.scheduledTime} onChange={e => setForm(f => ({ ...f, scheduledTime: e.target.value }))} />
              </div>

              <Input label="Location / Room" placeholder="e.g. Conference Room 3 or Zoom Link" required value={form.venue} onChange={e => setForm(f => ({ ...f, venue: e.target.value }))} />

              <div className="w-full">
                <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">Session Mode</label>
                <select
                  value={form.type}
                  onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                  className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-200 focus:outline-none"
                >
                  <option value="Virtual">Virtual Session</option>
                  <option value="In-Person">In-Person Session</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">Agenda / Details</label>
                <textarea
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                  placeholder="Statement recording, testimonials examination..."
                  value={form.agenda}
                  onChange={e => setForm(f => ({ ...f, agenda: e.target.value }))}
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-50 pt-4 dark:border-white/5">
                <Button type="button" variant="outline" onClick={() => setShowSchedule(false)}>Cancel</Button>
                <Button type="submit" disabled={scheduling}>
                  {scheduling ? 'Scheduling…' : 'Schedule Session'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

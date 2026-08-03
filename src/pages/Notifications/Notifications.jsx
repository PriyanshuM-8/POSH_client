import React, { useEffect, useState } from 'react'
import { Bell, AlertTriangle, Info, CalendarClock, ShieldAlert, RefreshCw } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { SkeletonTable } from '@/components/ui/Skeleton'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import { usePosh } from '@/context/PoshContext'
import { getMyNotificationsService, markAllNotificationsReadService } from '@/services/notificationService'
import { toast } from 'sonner'

const iconMap = { reminder: CalendarClock, escalation: ShieldAlert, info: Info }
const toneMap = { 
  reminder: 'text-[#2563EB] bg-blue-50 dark:bg-blue-500/10 dark:text-blue-300', 
  escalation: 'text-red-500 bg-red-50 dark:bg-red-500/10 dark:text-red-300', 
  info: 'text-sky-600 bg-sky-50 dark:bg-sky-500/10 dark:text-sky-300' 
}

export default function Notifications() {
  const { currentUser } = usePosh()
  const user = currentUser || {}

  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getMyNotificationsService({ limit: 50 })
      setNotifications(res?.notifications || res || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load notifications.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleMarkAll = async () => {
    try {
      await markAllNotificationsReadService()
      toast.success('All notifications marked as read.')
      fetchData()
    } catch (err) {
      toast.error('Failed to mark notifications as read.')
    }
  }

  if (error) {
    return <ErrorState status={500} message={error} onRetry={fetchData} />
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Notifications</h1>
          <p className="mt-0.5 text-sm text-slate-500 font-medium">Hearings, escalations, and case updates related to your role.</p>
        </div>
        <Button variant="ghost" size="sm" onClick={handleMarkAll} className="text-xs font-semibold text-[#2563EB] hover:text-blue-700">
          Mark all as read
        </Button>
      </div>

      <Card>
        <CardContent className="divide-y divide-slate-100 p-0 dark:divide-white/10">
          {loading ? (
            <SkeletonTable rows={5} cols={2} />
          ) : notifications.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Bell className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold">All caught up!</p>
              <p className="text-xs text-slate-400">No active notifications for your role.</p>
            </div>
          ) : (
            notifications.map((n, i) => {
              const Icon = iconMap[n.type] || Info
              return (
                <div key={i} className={`flex items-start gap-3 p-4 transition-colors hover:bg-slate-50/50 dark:hover:bg-white/5 ${n.unread ? 'bg-blue-50/30 dark:bg-blue-500/5' : ''}`}>
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${toneMap[n.type] || toneMap['info']}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-slate-700 dark:text-slate-200">{n.title}</p>
                      {n.unread && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#2563EB]" />}
                    </div>
                    <p className="mt-0.5 text-xs text-slate-400 font-medium">{n.description || n.desc}</p>
                  </div>
                  {n.type === 'escalation' && <Badge variant="danger" className="shrink-0 text-[10px]">Action needed</Badge>}
                </div>
              )
            })
          )}
        </CardContent>
      </Card>
    </div>
  )
}

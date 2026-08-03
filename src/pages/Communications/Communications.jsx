import React from 'react'
import { Mail, Send, Clock, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

const templates = ['Acknowledgement Notice', 'Committee Assignment Notice', 'Hearing Notice', 'Reminder', 'Closure Communication']

const history = [
  { to: 'Confidential (E-2291)', subject: 'Acknowledgement — POSH-2026-0142', time: '2 days ago', status: 'Delivered' },
  { to: 'Confidential (R-1187)', subject: 'Hearing Notice — POSH-2026-0142', time: '1 day ago', status: 'Delivered' },
  { to: 'Committee A', subject: 'Case Assignment — POSH-2026-0142', time: '3 days ago', status: 'Read' },
]

export default function Communications() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-1">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-800 dark:text-white">Communications</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Templates & sent history.</p>
        </div>
        <Card>
          <CardHeader><CardTitle>Templates</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {templates.map((t) => (
              <button key={t} className="flex w-full items-center gap-2.5 rounded-xl border border-slate-100 px-3.5 py-2.5 text-left text-sm text-slate-600 transition-colors hover:border-primary-200 hover:bg-primary-50/50 dark:border-white/10 dark:text-slate-300">
                <FileText className="h-4 w-4 text-primary-500" /> {t}
              </button>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2">
        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Communication History</CardTitle>
            <Button size="sm"><Send className="h-3.5 w-3.5" /> New Message</Button>
          </CardHeader>
          <CardContent>
            <ol className="relative space-y-5 border-l border-slate-200 pl-5 dark:border-white/10">
              {history.map((h, i) => (
                <li key={i} className="relative">
                  <span className="absolute -left-[25px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary-600 ring-4 ring-white dark:ring-navy-800">
                    <Mail className="h-2.5 w-2.5 text-white" />
                  </span>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{h.subject}</p>
                    <Badge variant={h.status === 'Read' ? 'success' : 'info'}>{h.status}</Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">To: {h.to}</p>
                  <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-400"><Clock className="h-3 w-3" /> {h.time}</p>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

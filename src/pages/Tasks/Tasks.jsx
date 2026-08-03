import React from 'react'
import { Plus, Clock, AlertCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

const columns = [
  {
    key: 'todo', title: 'To Do', color: 'bg-slate-300', tasks: [
      { title: 'Review complaint intake — POSH-0141', owner: 'HR SPOC', priority: 'Medium' },
      { title: 'Prepare committee brief', owner: 'A. Sharma', priority: 'Low' },
    ],
  },
  {
    key: 'progress', title: 'In Progress', color: 'bg-primary-500', tasks: [
      { title: 'Review evidence log — POSH-0142', owner: 'A. Sharma', priority: 'High' },
      { title: 'Draft hearing notice — POSH-0140', owner: 'HR SPOC', priority: 'Medium' },
    ],
  },
  {
    key: 'overdue', title: 'Overdue', color: 'bg-danger', tasks: [
      { title: 'Escalate SLA breach — POSH-0137', owner: 'POSH Admin', priority: 'High' },
    ],
  },
  {
    key: 'done', title: 'Completed', color: 'bg-success', tasks: [
      { title: 'Closure report — POSH-0139', owner: 'IC Chair', priority: 'Low' },
      { title: 'Archive case — POSH-0136', owner: 'POSH Admin', priority: 'Low' },
    ],
  },
]

const priorityVariant = { High: 'danger', Medium: 'warning', Low: 'neutral' }

export default function Tasks() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-800 dark:text-white">Task Management</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Track ownership, priority, and progress across all cases.</p>
        </div>
        <Button><Plus className="h-4 w-4" /> New Task</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {columns.map((col) => (
          <div key={col.key} className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <span className={`h-2 w-2 rounded-full ${col.color}`} />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{col.title}</p>
              <span className="ml-auto text-xs text-muted-foreground">{col.tasks.length}</span>
            </div>
            <div className="space-y-3">
              {col.tasks.map((t, i) => (
                <Card key={i} className="cursor-pointer hover:-translate-y-0.5 hover:shadow-card">
                  <CardContent className="space-y-2.5 p-4">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{t.title}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{t.owner}</span>
                      <Badge variant={priorityVariant[t.priority]}>{t.priority}</Badge>
                    </div>
                    {col.key === 'overdue' && (
                      <p className="flex items-center gap-1 text-[11px] text-danger"><AlertCircle className="h-3 w-3" /> 3 days overdue</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

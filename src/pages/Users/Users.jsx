import React from 'react'
import { UserPlus, Mail } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { usePosh } from '@/context/PoshContext'

export default function Users() {
  const { employees } = usePosh()

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-800 dark:text-white">Users & Roles</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Employee, HR SPOC, POSH Admin, IC Members, External, Legal, Super Admin.</p>
        </div>
        <Button><UserPlus className="h-4 w-4" /> Invite User</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {employees.map((u) => (
          <Card key={u.email || u.id} className="hover:-translate-y-0.5 hover:shadow-card">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-accent text-sm font-semibold text-white">
                  {u.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-800 dark:text-white">{u.name}</p>
                  <p className="flex items-center gap-1 truncate text-xs text-muted-foreground"><Mail className="h-3 w-3" /> {u.email}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <Badge variant="default">{u.role}</Badge>
                <Badge variant={u.status === 'Active' ? 'success' : 'neutral'}>{u.status}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

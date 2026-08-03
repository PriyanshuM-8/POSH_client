import React from 'react'
import { Folder, FileText, Search, Download, History } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

const folders = [
  { name: 'Active Cases', count: 34 },
  { name: 'Committee Orders', count: 12 },
  { name: 'Notices & Communications', count: 58 },
  { name: 'Closed Case Reports', count: 71 },
  { name: 'Policy Documents', count: 6 },
  { name: 'Training Records', count: 20 },
]

const files = [
  { name: 'POSH_Policy_v3.2.pdf', size: '1.2 MB', version: 'v3.2', updated: 'Jul 20, 2026' },
  { name: 'Committee_Order_0142.pdf', size: '340 KB', version: 'v1.0', updated: 'Jul 20, 2026' },
  { name: 'Hearing_Notice_0140.pdf', size: '210 KB', version: 'v1.1', updated: 'Jul 18, 2026' },
]

export default function Documents() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-800 dark:text-white">Document Repository</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Secure storage with version control and controlled access.</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input placeholder="Search documents…" className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-9 pr-3 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 dark:border-white/10 dark:bg-white/5" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {folders.map((f) => (
          <Card key={f.name} className="cursor-pointer hover:-translate-y-0.5 hover:shadow-card">
            <CardContent className="flex flex-col items-center gap-2 p-5 text-center">
              <Folder className="h-8 w-8 text-primary-500" fill="currentColor" fillOpacity={0.12} />
              <p className="text-xs font-medium text-slate-700 dark:text-slate-200">{f.name}</p>
              <span className="text-[11px] text-muted-foreground">{f.count} files</span>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400 dark:border-white/10">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Size</th>
                <th className="px-5 py-3 font-medium">Version</th>
                <th className="px-5 py-3 font-medium">Updated</th>
                <th className="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {files.map((f) => (
                <tr key={f.name} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 dark:border-white/5 dark:hover:bg-white/5">
                  <td className="flex items-center gap-2.5 px-5 py-3.5 font-medium text-slate-700 dark:text-slate-200">
                    <FileText className="h-4 w-4 text-primary-500" /> {f.name}
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">{f.size}</td>
                  <td className="px-5 py-3.5"><Badge variant="neutral">{f.version}</Badge></td>
                  <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">{f.updated}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-3 text-slate-400">
                      <Download className="h-4 w-4 cursor-pointer hover:text-primary-600" />
                      <History className="h-4 w-4 cursor-pointer hover:text-primary-600" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}

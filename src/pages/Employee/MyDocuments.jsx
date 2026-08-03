import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, Download, Upload, AlertTriangle, RefreshCw } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { getMyDocumentsService } from '@/services/userService'

const typeVariant = { Complaint: 'default', Evidence: 'warning', Notice: 'info', Report: 'success' }

export default function MyDocuments() {
  const [myDocuments, setMyDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const docs = await getMyDocumentsService()
      setMyDocuments(docs || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load documents.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

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
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-800 dark:text-white">My Documents</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Documents related to your complaints.</p>
        </div>
        <Button variant="outline"><Upload className="h-4 w-4" /> Upload Document</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Documents</CardTitle>
          <CardDescription>{myDocuments.length} documents</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          {myDocuments.length === 0 ? (
            <p className="text-center py-6 text-slate-400 font-medium text-sm">No documents found.</p>
          ) : (
            myDocuments.map((doc, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-center justify-between rounded-xl border border-slate-100 p-4 dark:border-white/10"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-500/10">
                    <FileText className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">{doc.size} · Uploaded {doc.uploaded}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={typeVariant[doc.type] || 'neutral'}>{doc.type}</Badge>
                  <Button variant="ghost" size="icon" onClick={() => doc.url && doc.url !== '#' && window.open(doc.url, '_blank')}><Download className="h-4 w-4" /></Button>
                </div>
              </motion.div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}

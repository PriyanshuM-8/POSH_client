import React from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw, WifiOff, ShieldOff, ServerCrash } from 'lucide-react'
import { Button } from './Button'

const errorConfig = {
  401: { icon: ShieldOff, title: 'Session Expired', description: 'Your session has expired. Please sign in again.' },
  403: { icon: ShieldOff, title: 'Access Denied', description: 'You do not have permission to view this resource.' },
  404: { icon: AlertTriangle, title: 'Not Found', description: 'The requested resource could not be found.' },
  500: { icon: ServerCrash, title: 'Server Error', description: 'Something went wrong on our end. Please try again.' },
  network: { icon: WifiOff, title: 'No Connection', description: 'Unable to reach the server. Check your network connection.' },
}

export default function ErrorState({ status, message, onRetry }) {
  const config = errorConfig[status] || errorConfig[500]
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-500/10">
        <Icon className="h-8 w-8 text-red-500" />
      </div>
      <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200">{config.title}</h3>
      <p className="mt-1.5 max-w-xs text-sm text-slate-400">{message || config.description}</p>
      {onRetry && (
        <Button variant="outline" className="mt-5 gap-2" onClick={onRetry}>
          <RefreshCw className="h-4 w-4" /> Try Again
        </Button>
      )}
    </motion.div>
  )
}

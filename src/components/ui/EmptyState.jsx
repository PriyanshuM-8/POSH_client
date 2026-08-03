import React from 'react'
import { motion } from 'framer-motion'
import { Inbox } from 'lucide-react'
import { Button } from './Button'

export default function EmptyState({ icon: Icon = Inbox, title, description, action, actionLabel }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-white/5">
        <Icon className="h-8 w-8 text-slate-400" />
      </div>
      <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-xs text-sm text-slate-400">{description}</p>
      )}
      {action && actionLabel && (
        <Button className="mt-5" onClick={action}>{actionLabel}</Button>
      )}
    </motion.div>
  )
}

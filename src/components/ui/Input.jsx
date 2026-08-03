import React from 'react'
import { cn } from '@/lib/utils'

export const Input = React.forwardRef(({ className, label, error, icon: Icon, ...props }, ref) => (
  <div className="w-full">
    {label && <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>}
    <div className="relative">
      {Icon && <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />}
      <input
        ref={ref}
        className={cn(
          'flex h-11 w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-3.5 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 shadow-sm transition-colors focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-500/20 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed dark:disabled:bg-slate-900/50 dark:disabled:text-slate-500',
          Icon && 'pl-9',
          error && 'border-danger focus:border-danger focus:ring-red-100',
          className
        )}
        {...props}
      />
    </div>
    {error && <p className="mt-1 text-xs text-danger">{error}</p>}
  </div>
))
Input.displayName = 'Input'

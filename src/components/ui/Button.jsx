import React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default: 'bg-primary-600 text-white shadow-soft hover:bg-primary-700 hover:shadow-glow',
        secondary: 'bg-primary-50 text-primary-700 hover:bg-primary-100 dark:bg-white/5 dark:text-primary-300 dark:hover:bg-white/10',
        outline: 'border border-slate-200 dark:border-white/10 bg-transparent hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200',
        ghost: 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300',
        destructive: 'bg-danger text-white hover:bg-red-600 shadow-soft',
        success: 'bg-success text-white hover:bg-emerald-600 shadow-soft',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 px-3 text-xs rounded-lg',
        lg: 'h-12 px-6 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
)

const Button = React.forwardRef(({ className, variant, size, ...props }, ref) => (
  <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
))
Button.displayName = 'Button'

export { Button, buttonVariants }

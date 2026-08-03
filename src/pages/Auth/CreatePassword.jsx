import React, { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { Lock, ShieldHalf, Eye, EyeOff, Check, X, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createPasswordService } from '@/services/authService'
import { toast } from 'sonner'

export default function CreatePassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [showPass, setShowPass] = useState(false)
  const [showConfirmPass, setShowConfirmPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const [success, setSuccess] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { password: '', confirmPassword: '' }
  })

  const passwordValue = watch('password', '')

  const rules = [
    { label: 'At least 8 characters', test: (val) => val.length >= 8 },
    { label: 'One uppercase letter', test: (val) => /[A-Z]/.test(val) },
    { label: 'One lowercase letter', test: (val) => /[a-z]/.test(val) },
    { label: 'One number', test: (val) => /[0-9]/.test(val) },
    { label: 'One special character', test: (val) => /[@$!%*?&#^()_\-+=]/.test(val) },
  ]

  const onSubmit = async (data) => {
    if (!token) {
      setApiError('Invitation token is missing or invalid. Please request a new invitation from your administrator.')
      return
    }

    // Check custom rules
    const allRulesPassed = rules.every(r => r.test(data.password))
    if (!allRulesPassed) {
      setApiError('Password does not meet all security requirements.')
      return
    }

    setApiError('')
    setLoading(true)
    try {
      await createPasswordService({
        token,
        password: data.password,
        confirmPassword: data.confirmPassword
      })
      setSuccess(true)
      toast.success('Account password created successfully! Please sign in.')
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create password. The link may have expired or already been used.'
      setApiError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full bg-[#F8FAFC]">
      {/* Left: form */}
      <div className="flex w-full flex-col justify-center px-6 py-12 sm:px-10 lg:w-1/2 lg:px-20">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mx-auto w-full max-w-sm"
        >
          <div className="mb-8 flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2563EB] shadow-lg">
              <ShieldHalf className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-base text-slate-800">Sentinel POSH</p>
              <p className="text-xs text-slate-500">Prevention of Sexual Harassment Management System</p>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-slate-800">Create password</h1>
          <p className="mt-1.5 text-sm text-slate-500">Set a secure password to activate your Sentinel POSH account.</p>

          {success ? (
            <div className="mt-8 space-y-6">
              <div className="rounded-lg bg-green-50 border border-green-200 p-4">
                <p className="text-sm font-medium text-green-800">Password Created</p>
                <p className="mt-1 text-xs text-green-600">
                  Your password has been set. You can now use your email and password to log in.
                </p>
              </div>
              <Link to="/login" className="flex items-center justify-center w-full rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-medium text-white shadow-lg hover:bg-blue-700">
                Go to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
              {!token && (
                <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-3 text-xs text-yellow-800">
                  Warning: No invitation token found in URL. Make sure you copied the full link from the email.
                </div>
              )}

              <div className="relative">
                <Input
                  label="New password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter your password"
                  icon={Lock}
                  {...register('password', { required: 'Password is required' })}
                  error={errors.password?.message}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-600"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <div className="relative">
                <Input
                  label="Confirm password"
                  type={showConfirmPass ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  icon={Lock}
                  {...register('confirmPassword', {
                    required: 'Confirm password is required',
                    validate: (value) => value === passwordValue || 'Passwords do not match'
                  })}
                  error={errors.confirmPassword?.message}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass((s) => !s)}
                  className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Password Rules Checklist */}
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-3.5 space-y-2">
                <p className="text-xs font-semibold text-slate-600">Password Requirements:</p>
                <div className="grid grid-cols-1 gap-1.5">
                  {rules.map((rule, idx) => {
                    const passed = rule.test(passwordValue)
                    return (
                      <div key={idx} className="flex items-center gap-2 text-xs text-slate-500">
                        {passed ? (
                          <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        ) : (
                          <X className="h-3.5 w-3.5 text-slate-300 shrink-0" />
                        )}
                        <span className={passed ? 'text-slate-700 font-medium' : ''}>{rule.label}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {apiError && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-600 font-medium"
                >
                  {apiError}
                </motion.p>
              )}

              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Saving password…
                  </span>
                ) : 'Create Password'}
              </Button>
            </form>
          )}

          <p className="mt-8 text-center text-xs text-slate-400">
            Protected by role-based access control &amp; audit logging. Unauthorized access is prohibited.
          </p>
        </motion.div>
      </div>

      {/* Right: branding panel */}
      <div className="relative hidden w-1/2 items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-[#1e3a8a] to-[#2563EB] lg:flex">
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:28px_28px]" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 max-w-md px-10 text-white"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-medium ring-1 ring-white/20 backdrop-blur">
            <ShieldCheck className="h-3.5 w-3.5" /> Confidential by design
          </div>
          <h2 className="text-3xl font-bold leading-tight">
            Secure POSH Case Management for Modern Organizations.
          </h2>
          <p className="mt-4 text-sm text-white/70">
            Streamline the complete POSH investigation lifecycle with secure workflows, audit trails, role-based access, and confidential case management.
          </p>
        </motion.div>
      </div>
    </div>
  )
}

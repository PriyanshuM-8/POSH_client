import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { Mail, Lock, ShieldHalf, Eye, EyeOff, ShieldCheck, Gavel, FolderLock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { usePosh } from '@/context/PoshContext'
import { loginService } from '@/services/authService'

export default function Login() {
  const navigate = useNavigate()
  const { login } = usePosh()
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { email: '', password: '', rememberMe: false }
  })

  const onSubmit = async (data) => {
    setApiError('')
    setLoading(true)
    try {
      const { accessToken, user } = await loginService({ email: data.email, password: data.password })
      login(accessToken, user, data.rememberMe)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid email or password.'
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

          <h1 className="text-2xl font-bold text-slate-800">Welcome back</h1>
          <p className="mt-1.5 text-sm text-slate-500">Sign in securely to access your organization's POSH compliance workspace.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
            <Input
              label="Work email"
              type="email"
              placeholder="you@company.com"
              icon={Mail}
              autoComplete="email"
              {...register('email', { required: 'Email is required' })}
              error={errors.email?.message}
            />
            <div className="relative">
              <Input
                label="Password"
                type={showPass ? 'text' : 'password'}
                placeholder="Enter your password"
                icon={Lock}
                autoComplete="current-password"
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

            {apiError && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-600 font-medium"
              >
                {apiError}
              </motion.p>
            )}

            <div className="flex items-center justify-between pt-1">
             
              <Link to="/forgot-password" className="text-sm font-medium text-[#2563EB] hover:text-blue-700">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Signing in…
                </span>
              ) : 'Sign In'}
            </Button>
          </form>

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
          <div className="mt-10 grid grid-cols-1 gap-3">
            {[
              { icon: FolderLock, text: 'Securely store complaints, evidence, and investigation documents.' },
              { icon: Gavel, text: 'Never miss legally required POSH investigation deadlines.' },
              { icon: ShieldCheck, text: 'Access only the modules and information permitted for your role.' },
            ].map(({ icon: Icon, text }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.12 }}
                className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3 ring-1 ring-white/10 backdrop-blur"
              >
                <Icon className="h-4 w-4 shrink-0 text-blue-200" />
                <span className="text-sm text-white/85">{text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

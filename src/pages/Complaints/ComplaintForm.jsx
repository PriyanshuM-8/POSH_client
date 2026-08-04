import React, { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  User, Building2, CalendarDays, MapPin, FileText, Users, UploadCloud,
  Check, ChevronRight, ChevronLeft, X, CheckCircle2, ShieldCheck,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { usePosh } from '@/context/PoshContext'
import { raiseComplaintService, uploadEvidenceService } from '@/services/complaintService'

const steps = [
  { title: 'Demographics', icon: User },
  { title: 'Incident details', icon: CalendarDays },
  { title: 'Witness statements', icon: Users },
  { title: 'Evidence index', icon: UploadCloud },
  { title: 'Legally verify', icon: FileText },
]

function StepIndicator({ current }) {
  return (
    <div className="mb-8 flex items-center">
      {steps.map((s, i) => {
        const Icon = s.icon
        const done = i < current
        const active = i === current
        return (
          <React.Fragment key={s.title}>
            <div className="flex flex-col items-center gap-2">
              <motion.div
                animate={{ scale: active ? 1.08 : 1 }}
                className={`flex h-11 w-11 items-center justify-center rounded-full border-2 transition-colors ${
                  done ? 'border-[#2563EB] bg-[#2563EB] text-white'
                  : active ? 'border-[#2563EB] bg-white text-[#2563EB] shadow-sm dark:bg-slate-800'
                  : 'border-slate-200 bg-white text-slate-300 dark:border-white/10 dark:bg-slate-800'
                }`}
              >
                {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </motion.div>
              <span className={`hidden text-[11px] font-semibold sm:block ${active ? 'text-[#2563EB]' : 'text-slate-400'}`}>{s.title}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`mx-1.5 h-0.5 flex-1 rounded-full transition-colors sm:mx-3 ${done ? 'bg-[#2563EB]' : 'bg-slate-200 dark:bg-white/10'}`} />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

function Dropzone({ files, setFiles }) {
  const onDrop = useCallback((accepted) => {
    setFiles(f => [...f, ...accepted])
    toast.success(`${accepted.length} file(s) added.`)
  }, [setFiles])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  return (
    <div>
      <div
        {...getRootProps()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition-colors ${
          isDragActive ? 'border-[#2563EB] bg-blue-50 dark:bg-blue-500/10' : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5'
        }`}
      >
        <input {...getInputProps()} />
        <UploadCloud className="mb-3 h-8 w-8 text-[#2563EB]" />
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Drag & drop evidence or documents here</p>
        <p className="mt-1 text-xs text-slate-400">or click to browse — secure, encrypted upload</p>
      </div>
      {files.length > 0 && (
        <div className="mt-3 space-y-2">
          {files.map((f, i) => (
            <div key={i} className="flex items-center justify-between rounded-xl border border-slate-100 px-3.5 py-2.5 text-sm dark:border-white/10">
              <span className="truncate text-slate-600 dark:text-slate-300 font-medium">{f.name} ({(f.size / 1024 / 1024).toFixed(2)} MB)</span>
              <button type="button" onClick={() => setFiles(fl => fl.filter((_, idx) => idx !== i))} className="text-slate-400 hover:text-red-500">
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ComplaintForm() {
  const navigate = useNavigate()
  const { currentUser } = usePosh()
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      anonymous: false,
      respondentType: 'OTHER',
      respondentName: '',
      respondentDept: '',
      title: '',
      description: '',
      incidentDate: '',
      incidentLocation: '',
      witnessName: '',
      witnessContact: '',
      witnessStatement: '',
    }
  })

  const [step, setStep] = useState(0)
  const [files, setFiles] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [generatedId, setGeneratedId] = useState('')

  const values = watch()

  const next = () => setStep(s => Math.min(s + 1, steps.length - 1))
  const prev = () => setStep(s => Math.max(s - 1, 0))

  const onSubmit = async (data) => {
    setSubmitting(true)
    try {
      const payload = {
        title: data.title,
        description: data.description,
        incidentDate: data.incidentDate,
        incidentLocation: data.incidentLocation,
        isAnonymous: data.anonymous,
        respondentType: 'OTHER',
        otherRespondent: {
          fullName: data.respondentName,
          department: data.respondentDept || 'Unknown',
        },
        witnesses: data.witnessName ? [{
          name: data.witnessName,
          contactInfo: data.witnessContact || null,
          statement: data.witnessStatement || null,
        }] : [],
      }

      const complaint = await raiseComplaintService(payload)

      // Upload evidence files if any
      if (files.length > 0 && complaint?._id) {
        const formData = new FormData()
        files.forEach(f => formData.append('evidence', f))
        await uploadEvidenceService(complaint._id, formData).catch(() => {
          toast.warning('Complaint submitted but evidence upload failed. You can upload later.')
        })
      }

      setGeneratedId(complaint?._id?.slice(-8).toUpperCase() || 'N/A')
      setSuccess(true)
      toast.success('Complaint submitted successfully.')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit complaint.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">File POSH Complaint</h1>
        <p className="mt-0.5 text-sm text-slate-500">Every report is encrypted and strictly limited to internal committee verification.</p>
      </div>

      <Card>
        <CardContent className="p-6 sm:p-8">
          <StepIndicator current={step} />

          <form onSubmit={handleSubmit(onSubmit)}>
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {step === 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3.5 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                      <input
                        type="checkbox"
                        id="anonymous"
                        className="h-4 w-4 rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB]"
                        {...register('anonymous')}
                      />
                      <label htmlFor="anonymous" className="text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer">
                        File Anonymously (Hides your identity from committee until investigation warrants verification)
                      </label>
                    </div>
                    <Input
                      label="Complaint Title"
                      placeholder="Brief title describing the incident"
                      required
                      {...register('title', { required: 'Title is required' })}
                      error={errors.title?.message}
                    />
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Input
                        label="Respondent Full Name"
                        placeholder="Name of the person involved"
                        icon={User}
                        required
                        {...register('respondentName', { required: 'Respondent name is required' })}
                        error={errors.respondentName?.message}
                      />
                      <Input
                        label="Respondent's Department"
                        placeholder="e.g. Operations"
                        icon={Building2}
                        {...register('respondentDept')}
                      />
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Input
                        label="Incident Date"
                        type="date"
                        required
                        icon={CalendarDays}
                        {...register('incidentDate', { required: 'Incident date is required' })}
                        error={errors.incidentDate?.message}
                      />
                      <Input
                        label="Incident Location"
                        placeholder="e.g. 4th floor cafeteria"
                        icon={MapPin}
                        required
                        {...register('incidentLocation', { required: 'Location is required' })}
                        error={errors.incidentLocation?.message}
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">Incident Description</label>
                      <textarea
                        rows={6}
                        required
                        placeholder="Provide as detailed a description as possible of the events..."
                        className="w-full rounded-xl border border-slate-200 bg-white p-3.5 text-sm shadow-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                        {...register('description', { required: 'Description is required' })}
                      />
                      {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>}
                    </div>
                  </>
                )}

                {step === 2 && (
                  <>
                    <p className="text-xs text-slate-500">List any eyewitnesses who can support your account (optional).</p>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Input label="Witness Full Name" placeholder="Full name" icon={Users} {...register('witnessName')} />
                      <Input label="Witness Contact" placeholder="Email or phone" icon={Building2} {...register('witnessContact')} />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">Witness Statement</label>
                      <textarea
                        rows={4}
                        placeholder="What did the witness observe?"
                        className="w-full rounded-xl border border-slate-200 bg-white p-3.5 text-sm shadow-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                        {...register('witnessStatement')}
                      />
                    </div>
                  </>
                )}

                {step === 3 && (
                  <>
                    <Dropzone files={files} setFiles={setFiles} />
                    <p className="flex items-center gap-1.5 text-xs text-slate-400">
                      <ShieldCheck className="h-3.5 w-3.5" /> Files are encrypted and audit-logged on access.
                    </p>
                  </>
                )}

                {step === 4 && (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-white/5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Filing Mode</p>
                      <p className="mt-1 font-semibold text-slate-700 dark:text-slate-200">
                        {values.anonymous ? 'Anonymous intake mode selected.' : 'Standard demographics logging mode.'}
                      </p>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <ReviewItem label="Complaint Title" value={values.title || '—'} />
                      <ReviewItem label="Respondent" value={values.respondentName || '—'} />
                      <ReviewItem label="Incident Date" value={values.incidentDate || '—'} />
                      <ReviewItem label="Location" value={values.incidentLocation || '—'} />
                    </div>
                    <ReviewItem label="Description" value={values.description || '—'} />
                    <ReviewItem label="Evidence Files" value={`${files.length} file(s) attached`} />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-5 dark:border-white/10">
              <div />
              <div className="flex gap-2">
                {step > 0 && (
                  <Button type="button" variant="outline" onClick={prev}><ChevronLeft className="h-4 w-4" /> Back</Button>
                )}
                {step < steps.length - 1 ? (
                  <Button type="button" onClick={next}>Next <ChevronRight className="h-4 w-4" /></Button>
                ) : (
                  <Button type="submit" variant="success" disabled={submitting}>
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Submitting…
                      </span>
                    ) : (
                      <><Check className="h-4 w-4" /> Submit Complaint</>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <AnimatePresence>
        {success && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-xl dark:bg-slate-800"
            >
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-500/10">
                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Complaint Submitted</h3>
              <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                Your POSH complaint has been registered with ID: <span className="font-mono font-semibold text-[#2563EB]">{generatedId}</span>. The internal committee has been notified.
              </p>
              <Button className="mt-6 w-full" onClick={() => navigate('/my-complaints')}>Track My Complaint</Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ReviewItem({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3.5 dark:bg-white/5 border border-slate-100 dark:border-white/5">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-200 leading-relaxed">{value}</p>
    </div>
  )
}

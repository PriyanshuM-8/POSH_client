import React, { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Building2, ShieldCheck, FileText, Paperclip, Gavel,
  MessageSquare, ClipboardList, Check, AlertCircle,
  Calendar, Users, Info, RefreshCw, Download, Lock, Unlock, Archive, Send, FileCheck,
  Eye, Image as ImageIcon, FileAudio, Video, ExternalLink, X as XIcon, ZoomIn, File as FileIcon
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { SkeletonTimeline } from '@/components/ui/Skeleton'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import { usePosh } from '@/context/PoshContext'
import {
  getCaseByIdService,
  assignCommitteeToCaseService,
  reviewEvidenceService,
  reviewRecommendationService,
  archiveCaseService,
  submitFeedbackService,
  recordCommitteeRecommendationService,
  closeCaseService,
  downloadFinalOrderPDFService
} from '@/services/caseService'
import { getComplaintByIdService, acceptComplaintService, rejectComplaintService } from '@/services/complaintService'
import { getAllCommitteesService } from '@/services/committeeService'
import { getAllHearingsService, scheduleHearingService, updateHearingService } from '@/services/hearingService'
import { toast } from 'sonner'
import Swal from 'sweetalert2'
import api from '@/lib/api'

const tabs = [
  { key: 'summary', label: 'Summary', icon: FileText },
  { key: 'evidence', label: 'Evidence', icon: ShieldCheck },
  { key: 'hearings', label: 'Hearings', icon: Gavel },
  { key: 'documents', label: 'Documents', icon: Paperclip },
  { key: 'recommendations', label: 'Recommendations', icon: ClipboardList },
]

const STATUS_VARIANT = {
  OPEN: 'info',
  UNDER_INVESTIGATION: 'warning',
  EVIDENCE_COLLECTION: 'warning',
  HEARING_SCHEDULED: 'warning',
  LEGAL_REVIEW: 'default',
  COMMITTEE_RECOMMENDATION: 'info',
  POSH_ADMIN_REVIEW: 'warning',
  CLOSED: 'success',
  APPEALED: 'danger',
}

const PRIORITY_VARIANT = { LOW: 'neutral', MEDIUM: 'warning', HIGH: 'danger', CRITICAL: 'danger' }

const WORKFLOW = [
  'Complaint Submitted',
  'Under Review',
  'Accepted',
  'Case Created',
  'Under Investigation',
  'Hearings & Trial',
  'Committee Decision',
  'Admin Approval',
  'Closed',
]

const STATUS_TO_STAGE = {
  PENDING_REVIEW: 0,
  UNDER_REVIEW: 1,
  ACCEPTED: 2,
  CASE_CREATED: 3,
  OPEN: 3,
  UNDER_INVESTIGATION: 4,
  EVIDENCE_COLLECTION: 4,
  HEARING_SCHEDULED: 5,
  LEGAL_REVIEW: 5,
  COMMITTEE_RECOMMENDATION: 6,
  POSH_ADMIN_REVIEW: 7,
  CLOSED: 8,
}

export default function CaseDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentUser } = usePosh()
  const formatApiError = (err, defaultMsg) => {
    const errorData = err.response?.data
    if (errorData?.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
      return errorData.errors.join(', ')
    }
    return errorData?.message || defaultMsg
  }

  const [caseData, setCaseData] = useState(null)
  const [complaint, setComplaint] = useState(null)
  const [hearings, setHearings] = useState([])
  const [committees, setCommittees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tab, setTab] = useState('summary')

  // Local Action States
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState([])
  const [uploadDescription, setUploadDescription] = useState('')

  // Inline forms toggles
  const [showHearingForm, setShowHearingForm] = useState(false)
  const [hearingType, setHearingType] = useState('PRELIMINARY')
  const [hearingDateTime, setHearingDateTime] = useState('')
  const [hearingMode, setHearingMode] = useState('Virtual')
  const [hearingVenue, setHearingVenue] = useState('')
  const [hearingAgenda, setHearingAgenda] = useState('')

  // Complete hearing inline form
  const [completingHearingId, setCompletingHearingId] = useState(null)
  const [hearingOutcome, setHearingOutcome] = useState('')
  const [hearingMinutes, setHearingMinutes] = useState('')

  // Committee Recommendation form
  const [recDecision, setRecDecision] = useState('WRITTEN_WARNING')
  const [recRemarks, setRecRemarks] = useState('')
  const [recActionReq, setRecActionReq] = useState(false)
  const [recFollowUpReq, setRecFollowUpReq] = useState(false)

  // Closure form
  const [closeFinalDecision, setCloseFinalDecision] = useState('')
  const [closeActionTaken, setCloseActionTaken] = useState('WRITTEN_WARNING')
  const [closeRemarks, setCloseRemarks] = useState('')
  const [closeEffectiveDate, setCloseEffectiveDate] = useState('')

  // Feedback form
  const [feedbackText, setFeedbackText] = useState('')

  const [downloadingPDF, setDownloadingPDF] = useState(false)

  // ─── Evidence Lightbox ────────────────────────────────────────────
  const [lightbox, setLightbox] = useState(null) // { url, name, type }

  const handleDownloadPDF = async () => {
    setDownloadingPDF(true)
    try {
      await downloadFinalOrderPDFService(caseData._id, caseData.caseId)
      toast.success('Official Final Order PDF downloaded successfully!')
    } catch (err) {
      console.error(err)
      toast.error('Failed to download final order PDF.')
    } finally {
      setDownloadingPDF(false)
    }
  }

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      let caseRes = null
      try {
        caseRes = await getCaseByIdService(id)
      } catch (e) {
        // Case not found
      }

      const caseObj = caseRes?.case || caseRes

      if (caseObj) {
        if (caseObj._id !== id) {
          navigate(`/cases/${caseObj._id}`, { replace: true })
          return
        }

        setCaseData(caseObj)
        setComplaint(caseObj.complaint)

        const [hearingsRes, committeesRes] = await Promise.all([
          getAllHearingsService({ case: caseObj._id }).catch(() => ({ hearings: [] })),
          (currentUser?.role === 'POSH_ADMIN')
            ? getAllCommitteesService({ limit: 50 }).catch(() => ({ committees: [] }))
            : Promise.resolve({ committees: [] })
        ])

        setHearings(hearingsRes?.hearings || hearingsRes || [])
        setCommittees(committeesRes?.committees || committeesRes || [])
      } else {
        const complaintRes = await getComplaintByIdService(id)
        setCaseData(null)
        setComplaint(complaintRes?.complaint || complaintRes)
        setHearings([])
        setCommittees([])
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load case details.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [id])

  const handleAccept = async () => {
    Swal.fire({
      title: 'Accept Complaint',
      html: `
        <div style="text-align: left;">
          <label style="display: block; font-size: 14px; font-weight: 600; margin-bottom: 6px;">Select Priority</label>
          <select id="swal-priority" class="swal2-input" style="width: 100%; margin: 0 0 16px 0; box-sizing: border-box; border-radius: 8px;">
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
            <option value="HIGH">HIGH</option>
            <option value="CRITICAL">CRITICAL</option>
          </select>
          <label style="display: block; font-size: 14px; font-weight: 600; margin-bottom: 6px;">Remarks (Optional)</label>
          <textarea id="swal-remarks" class="swal2-textarea" placeholder="Enter review remarks..." style="width: 100%; margin: 0; box-sizing: border-box; border-radius: 8px; height: 100px;"></textarea>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Accept & Create Case',
      confirmButtonColor: '#10B981',
      cancelButtonColor: '#6B7280',
      background: document.documentElement.classList.contains('dark') ? '#1E293B' : '#FFFFFF',
      color: document.documentElement.classList.contains('dark') ? '#F3F4F6' : '#1F2937',
      preConfirm: () => {
        const priority = document.getElementById('swal-priority').value
        const remarks = document.getElementById('swal-remarks').value
        return { priority, remarks }
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await acceptComplaintService(id, result.value)
          toast.success('Complaint accepted and Case created successfully!')
          if (res?.case?._id || res?._id) {
            navigate(`/cases/${res.case?._id || res._id}`, { replace: true })
          } else {
            fetchData()
          }
        } catch (err) {
          toast.error(formatApiError(err, 'Failed to accept complaint.'))
        }
      }
    })
  }

  const handleReject = async () => {
    Swal.fire({
      title: 'Reject Complaint',
      html: `
        <div style="text-align: left;">
          <label style="display: block; font-size: 14px; font-weight: 600; margin-bottom: 6px;">Rejection Reason (Mandatory, min 10 chars)</label>
          <textarea id="swal-reason" class="swal2-textarea" placeholder="Enter reason for rejection..." style="width: 100%; margin: 0; box-sizing: border-box; border-radius: 8px; height: 120px;"></textarea>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Reject Complaint',
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      background: document.documentElement.classList.contains('dark') ? '#1E293B' : '#FFFFFF',
      color: document.documentElement.classList.contains('dark') ? '#F3F4F6' : '#1F2937',
      preConfirm: () => {
        const reason = document.getElementById('swal-reason').value
        if (!reason || reason.trim().length < 10) {
          Swal.showValidationMessage('Rejection reason must be at least 10 characters long')
          return false
        }
        return { rejectionReason: reason }
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await rejectComplaintService(id, result.value)
          toast.success('Complaint rejected successfully.')
          fetchData()
        } catch (err) {
          toast.error(formatApiError(err, 'Failed to reject complaint.'))
        }
      }
    })
  }

  const handleAssignCommittee = async () => {
    if (!committees || committees.length === 0) {
      toast.error('No active committees found. Please create a committee first.')
      return
    }

    const optionsHtml = committees
      .map(c => `<option value="${c._id}">${c.name}</option>`)
      .join('')

    Swal.fire({
      title: 'Assign Committee',
      html: `
        <div style="text-align: left;">
          <label style="display: block; font-size: 14px; font-weight: 600; margin-bottom: 6px;">Select Committee</label>
          <select id="swal-committee" class="swal2-input" style="width: 100%; margin: 0; box-sizing: border-box; border-radius: 8px;">
            <option value="">Select Committee</option>
            ${optionsHtml}
          </select>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Confirm Assignment',
      confirmButtonColor: '#2563EB',
      cancelButtonColor: '#6B7280',
      background: document.documentElement.classList.contains('dark') ? '#1E293B' : '#FFFFFF',
      color: document.documentElement.classList.contains('dark') ? '#F3F4F6' : '#1F2937',
      preConfirm: () => {
        const committeeId = document.getElementById('swal-committee').value
        if (!committeeId) {
          Swal.showValidationMessage('Please select a committee')
          return false
        }
        return { committeeId }
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await assignCommitteeToCaseService(id, result.value)
          toast.success('Committee assigned successfully.')
          fetchData()
        } catch (err) {
          toast.error(formatApiError(err, 'Failed to assign committee.'))
        }
      }
    })
  }

  // ─── Evidence Reviews ──────────────────────────────────────────
  const handleEvidenceReview = (status) => {
    Swal.fire({
      title: status === 'APPROVED' ? 'Approve Submitted Evidence' : 'Request Additional Evidence',
      input: 'textarea',
      inputPlaceholder: status === 'APPROVED' ? 'Enter review notes (optional)...' : 'Clearly detail what documents or evidence are requested from the employee...',
      showCancelButton: true,
      confirmButtonText: status === 'APPROVED' ? 'Approve Evidence' : 'Send Request',
      confirmButtonColor: status === 'APPROVED' ? '#10B981' : '#F59E0B',
      cancelButtonColor: '#6B7280',
      background: document.documentElement.classList.contains('dark') ? '#1E293B' : '#FFFFFF',
      color: document.documentElement.classList.contains('dark') ? '#F3F4F6' : '#1F2937',
      inputValidator: (value) => {
        if (status === 'MORE_REQUIRED' && (!value || !value.trim())) {
          return 'Remarks are mandatory when requesting more evidence!'
        }
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await reviewEvidenceService(caseData._id, { status, remarks: result.value })
          toast.success(status === 'APPROVED' ? 'Evidence marked APPROVED successfully!' : 'Evidence request dispatched.')
          fetchData()
        } catch (err) {
          toast.error(formatApiError(err, 'Failed to update evidence review status.'))
        }
      }
    })
  }

  const handleUploadEvidence = async (e) => {
    e.preventDefault()
    if (uploadingFiles.length === 0) {
      toast.error('Please choose at least one file.')
      return
    }

    const formData = new FormData()
    for (let i = 0; i < uploadingFiles.length; i++) {
      formData.append('evidence', uploadingFiles[i])
    }
    formData.append('description', uploadDescription)

    setUploading(true)
    try {
      await api.post(`/complaints/${encodeURIComponent(complaint._id)}/evidence`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      toast.success('Additional evidence uploaded successfully!')
      setUploadingFiles([])
      setUploadDescription('')
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Evidence upload failed.')
    } finally {
      setUploading(false)
    }
  }

  // ─── Inquiry Hearings ──────────────────────────────────────────
  const handleScheduleHearing = async (e) => {
    e.preventDefault()
    if (!hearingDateTime) {
      toast.error('Please select date and time')
      return
    }
    setSubmitting(true)
    try {
      await scheduleHearingService({
        caseId: caseData._id,
        hearingType,
        scheduledAt: hearingDateTime,
        venue: hearingVenue,
        isVirtual: hearingMode === 'Virtual',
        agenda: hearingAgenda
      })
      toast.success('Hearing scheduled successfully and notifications dispatched!')
      setShowHearingForm(false)
      setHearingVenue('')
      setHearingAgenda('')
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to schedule hearing.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCompleteHearing = async (hearingId) => {
    if (!hearingOutcome || !hearingMinutes) {
      toast.error('Please fill both outcome and minutes.')
      return
    }
    setSubmitting(true)
    try {
      await updateHearingService(hearingId, {
        status: 'COMPLETED',
        outcome: hearingOutcome,
        notes: hearingMinutes,
        conductedAt: new Date()
      })
      toast.success('Hearing completed and Case stage automatically progressed!')
      setCompletingHearingId(null)
      setHearingOutcome('')
      setHearingMinutes('')
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update hearing.')
    } finally {
      setSubmitting(false)
    }
  }

  // ─── Recommendations ──────────────────────────────────────────
  const handleRecordRecommendation = async (e) => {
    e.preventDefault()
    if (!recRemarks.trim()) {
      toast.error('Remarks/Investigation summary is required')
      return
    }
    setSubmitting(true)
    try {
      await recordCommitteeRecommendationService(caseData._id, {
        decision: recDecision,
        remarks: recRemarks,
        actionRequired: recActionReq,
        followUpRequired: recFollowUpReq
      })
      toast.success('Committee recommendation recorded and forwarded to POSH Admin!')
      setRecRemarks('')
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit recommendation.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRecommendationReview = (status) => {
    Swal.fire({
      title: status === 'APPROVED' ? 'Approve Recommendation' : status === 'RETURNED' ? 'Return to Committee' : 'Reject Recommendation',
      input: 'textarea',
      inputPlaceholder: 'Enter review feedback or remarks...',
      showCancelButton: true,
      confirmButtonText: 'Submit Decision',
      confirmButtonColor: status === 'APPROVED' ? '#10B981' : status === 'RETURNED' ? '#F59E0B' : '#EF4444',
      cancelButtonColor: '#6B7280',
      background: document.documentElement.classList.contains('dark') ? '#1E293B' : '#FFFFFF',
      color: document.documentElement.classList.contains('dark') ? '#F3F4F6' : '#1F2937',
      inputValidator: (value) => {
        if (['RETURNED', 'REJECTED'].includes(status) && (!value || !value.trim())) {
          return 'Remarks are required for returned or rejected decisions!'
        }
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await reviewRecommendationService(caseData._id, { status, remarks: result.value })
          toast.success(`Recommendation successfully ${status.toLowerCase()}!`)
          fetchData()
        } catch (err) {
          toast.error(formatApiError(err, 'Failed to review recommendation.'))
        }
      }
    })
  }

  // ─── Case Closure ──────────────────────────────────────────────
  const handleCloseCase = async (e) => {
    e.preventDefault()
    if (!closeRemarks.trim()) {
      toast.error('Closing remarks are required')
      return
    }
    setSubmitting(true)
    try {
      await closeCaseService(caseData._id, {
        closingRemarks: closeRemarks,
        closureReason: closeRemarks,
        finalDecision: closeFinalDecision,
        actionTaken: closeActionTaken,
        effectiveDate: closeEffectiveDate
      })
      toast.success('Case closed successfully and locked!')
      fetchData()
    } catch (err) {
      toast.error(formatApiError(err, 'Failed to close case.'))
    } finally {
      setSubmitting(false)
    }
  }

  // ─── Employee Feedback ─────────────────────────────────────────
  const handleFeedbackSubmit = async (e) => {
    e.preventDefault()
    if (feedbackText.trim().length < 10) {
      toast.error('Feedback must be at least 10 characters long')
      return
    }
    setSubmitting(true)
    try {
      await submitFeedbackService(caseData._id, { feedback: feedbackText })
      toast.success('Thank you for your confidential feedback!')
      setFeedbackText('')
      fetchData()
    } catch (err) {
      toast.error(formatApiError(err, 'Failed to submit feedback.'))
    } finally {
      setSubmitting(false)
    }
  }

  // ─── Case Archiving ────────────────────────────────────────────
  const handleArchiveCase = async () => {
    Swal.fire({
      title: 'Archive Case?',
      text: 'This will move the case to read-only archive status. This action is irreversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Archive Case',
      confirmButtonColor: '#6D28D9',
      cancelButtonColor: '#6B7280',
      background: document.documentElement.classList.contains('dark') ? '#1E293B' : '#FFFFFF',
      color: document.documentElement.classList.contains('dark') ? '#F3F4F6' : '#1F2937'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await archiveCaseService(caseData._id)
          toast.success('Case archived successfully.')
          fetchData()
        } catch (err) {
          toast.error(formatApiError(err, 'Failed to archive case.'))
        }
      }
    })
  }

  const currentStatus = caseData?.status || complaint?.status
  const currentStage = STATUS_TO_STAGE[currentStatus] ?? 0
  const assignedCommittee = caseData?.assignedCommittee

  // Helper authorization checks
  const isMemberOfCommittee = (() => {
    if (!assignedCommittee) return false
    const uid = currentUser?._id?.toString()
    if (!uid) return false
    // Check members array (handles both populated objects and raw ObjectIds)
    const inMembers = assignedCommittee.members?.some(m => {
      const mId = (m.user?._id || m.user)?.toString()
      return mId === uid
    })
    // Check chairperson field (can be populated object or ObjectId)
    const isChairperson = (assignedCommittee.chairperson?._id || assignedCommittee.chairperson)?.toString() === uid
    return inMembers || isChairperson
  })()

  const isAuthorizedForEvidence = currentUser?.role === 'POSH_ADMIN' ||
    currentUser?.role === 'IC_MEMBER' ||
    currentUser?.role === 'EXTERNAL_MEMBER' ||
    isMemberOfCommittee ||
    caseData?.complainant === currentUser?._id || caseData?.complainant?._id?.toString() === currentUser?._id?.toString() ||
    caseData?.respondent === currentUser?._id || caseData?.respondent?._id?.toString() === currentUser?._id?.toString() ||
    complaint?.complainant === currentUser?._id || complaint?.complainant?._id?.toString() === currentUser?._id?.toString()


  // Deduplicated merged evidence list (case + complaint, unique by _id)
  const allEvidence = useMemo(() => {
    const merged = [
      ...(caseData?.evidence || []),
      ...(complaint?.evidence || []),
    ]
    const seen = new Set()
    return merged.filter(e => {
      if (!e || typeof e !== 'object' || !e._id) return false
      const id = e._id?.toString()
      if (seen.has(id)) return false
      seen.add(id)
      return true
    })
  }, [caseData?.evidence, complaint?.evidence])

  // Helper: get file category from fileType or mimeType
  const getFileCategory = (ev) => {
    const t = (ev.fileType || '').toUpperCase()
    const m = (ev.mimeType || '').toLowerCase()
    if (t === 'IMAGE' || m.startsWith('image/')) return 'IMAGE'
    if (t === 'PDF' || m === 'application/pdf') return 'PDF'
    if (t === 'AUDIO' || m.startsWith('audio/')) return 'AUDIO'
    if (t === 'VIDEO' || m.startsWith('video/')) return 'VIDEO'
    return 'DOCUMENT'
  }


  if (error) {
    return <ErrorState status={500} message={error} onRetry={fetchData} />
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-32 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
        <SkeletonTimeline items={8} />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 h-96 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          <div className="space-y-4">
            <div className="h-64 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
            <div className="h-48 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (!caseData && !complaint) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-center p-6">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Record Not Found</h2>
        <p className="mt-1.5 text-sm text-slate-400 max-w-sm">No case or complaint file matching ID "{id}" was found.</p>
        <Button className="mt-6" onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
      </div>
    )
  }

  const caseId = caseData?.caseId || complaint?._id?.slice(-8).toUpperCase()
  const title = caseData?.complaint?.title || complaint?.title || 'Case File'
  const priority = caseData?.complaint?.priority || complaint?.priority || 'MEDIUM'

  return (
    <div className="space-y-6">
      {/* Dynamic Status/Archive Callout Banner */}
      {caseData?.isArchived && (
        <div className="flex items-center gap-3 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/30 p-4.5 rounded-2xl text-indigo-800 dark:text-indigo-300">
          <Archive className="h-5 w-5 shrink-0 text-indigo-600" />
          <div className="text-xs">
            <p className="font-bold">📁 Statutory Record Archived</p>
            <p className="mt-0.5">This case file has been closed, finalized, and archived. All content is now strictly read-only.</p>
          </div>
        </div>
      )}

      {caseData?.status === 'CLOSED' && !caseData?.isArchived && (
        <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 p-4.5 rounded-2xl text-emerald-800 dark:text-emerald-300">
          <FileCheck className="h-5 w-5 shrink-0 text-emerald-600" />
          <div className="text-xs">
            <p className="font-bold">✓ Case Finalized and Closed</p>
            <p className="mt-0.5">This case is officially closed. Complainant process feedback is open, and administrative archiving can proceed.</p>
          </div>
        </div>
      )}

      {caseData?.evidenceReviewStatus === 'MORE_REQUIRED' && (
        <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 p-4.5 rounded-2xl text-amber-800 dark:text-amber-300">
          <Info className="h-5 w-5 shrink-0 text-amber-600" />
          <div className="text-xs">
            <p className="font-bold">⚠ Additional Evidence Requested</p>
            <p className="mt-0.5">The committee has requested more documents. Case status changed to <strong>Evidence Collection</strong>.</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
        <div>
          <p className="font-mono text-xs font-bold text-[#2563EB]">{caseId}</p>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{title}</h1>
          <p className="text-sm text-slate-400 mt-1">Status: <span className="font-bold text-slate-700 dark:text-slate-200">{currentStatus?.replace(/_/g, ' ')}</span></p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <Badge variant={PRIORITY_VARIANT[priority] || 'neutral'}>{priority}</Badge>
          <Badge variant="info">Stage {currentStage + 1} / {WORKFLOW.length}</Badge>
          
          {currentUser?.role === 'POSH_ADMIN' && !caseData && (complaint?.status === 'PENDING_REVIEW' || complaint?.status === 'UNDER_REVIEW') && (
            <div className="flex items-center gap-2 ml-2">
              <Button size="sm" variant="success" onClick={handleAccept}>
                Accept & Create Case
              </Button>
              <Button size="sm" variant="destructive" onClick={handleReject}>
                Reject
              </Button>
            </div>
          )}

          {currentUser?.role === 'POSH_ADMIN' && caseData && !assignedCommittee && (
            <div className="flex items-center gap-2 ml-2">
              <Button size="sm" onClick={handleAssignCommittee}>
                Assign Committee
              </Button>
            </div>
          )}

          {currentUser?.role === 'POSH_ADMIN' && caseData?.status === 'CLOSED' && !caseData?.isArchived && (
            <Button size="sm" variant="purple" onClick={handleArchiveCase} className="bg-purple-600 hover:bg-purple-700 text-white ml-2">
              <Archive className="mr-1.5 h-4 w-4" /> Archive Case
            </Button>
          )}
        </div>
      </div>

      {/* Workflow Progress */}
      <Card className="shadow-sm border-slate-100 dark:border-white/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-400">Statutory Workflow</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 overflow-x-auto">
          <div className="flex items-center gap-2 min-w-max">
            {WORKFLOW.map((stageName, idx) => {
              const active = idx === currentStage
              const done = idx < currentStage
              return (
                <React.Fragment key={idx}>
                  <div className="flex flex-col items-center gap-1.5 min-w-[90px]">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold ${
                      done ? 'border-emerald-500 bg-emerald-500 text-white'
                      : active ? 'border-[#2563EB] bg-[#2563EB] text-white ring-4 ring-blue-100 dark:ring-blue-500/20'
                      : 'border-slate-200 bg-white text-slate-400 dark:border-white/10 dark:bg-slate-800'
                    }`}>
                      {done ? '✓' : idx + 1}
                    </div>
                    <span className={`text-[10px] font-semibold ${active ? 'text-[#2563EB]' : 'text-slate-400'}`}>{stageName}</span>
                  </div>
                  {idx < WORKFLOW.length - 1 && (
                    <div className={`h-0.5 w-6 rounded-full ${done ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-white/10'}`} />
                  )}
                </React.Fragment>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card className="shadow-sm border-slate-100 dark:border-white/5">
            <CardContent className="p-0">
              <div className="flex overflow-x-auto border-b border-slate-100 dark:border-white/10">
                {tabs.map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setTab(key)}
                    className={`flex shrink-0 items-center gap-2 border-b-2 px-5 py-4 text-sm font-semibold transition-colors ${
                      tab === key ? 'border-[#2563EB] text-[#2563EB]' : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <Icon className="h-4.5 w-4.5" /> {label}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {/* Tab 1: Summary */}
                {tab === 'summary' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm dark:bg-white/10">
                          <User className="h-4.5 w-4.5 text-[#2563EB]" />
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Complainant</p>
                          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mt-0.5">
                            {caseData?.complainant?.fullName || complaint?.complainant?.fullName || 'Confidential'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm dark:bg-white/10">
                          <User className="h-4.5 w-4.5 text-[#2563EB]" />
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Respondent</p>
                          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mt-0.5">
                            {caseData?.otherRespondent?.fullName || complaint?.otherRespondent?.fullName || 'Confidential'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm dark:bg-white/10">
                          <Building2 className="h-4.5 w-4.5 text-[#2563EB]" />
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Incident Location</p>
                          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mt-0.5">{complaint?.incidentLocation}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm dark:bg-white/10">
                          <Calendar className="h-4.5 w-4.5 text-[#2563EB]" />
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Incident Date</p>
                          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mt-0.5">{complaint?.incidentDate}</p>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-50 dark:border-white/5 pt-4">
                      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Incident Description</p>
                      <p className="rounded-xl bg-slate-50/70 p-5 text-sm leading-relaxed text-slate-600 dark:bg-white/5 dark:text-slate-300 border border-slate-100/50 dark:border-white/5">
                        {complaint?.description || 'No description provided.'}
                      </p>
                    </div>

                    {/* Case Closure Record Panel */}
                    {caseData?.closure?.closedAt && (
                      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/20 p-5 dark:border-emerald-500/20 space-y-3">
                        <h3 className="text-sm font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
                          <FileCheck className="h-4.5 w-4.5" /> Final Decision & Settlement order
                        </h3>
                        <div className="grid grid-cols-2 gap-4 text-xs pt-1">
                          <div>
                            <p className="font-semibold text-slate-400 uppercase tracking-wider">Final Decision</p>
                            <p className="font-bold text-slate-700 dark:text-slate-200 mt-0.5">{caseData.closure.finalDecision || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-400 uppercase tracking-wider">Action Taken</p>
                            <p className="font-bold text-slate-700 dark:text-slate-200 mt-0.5">{caseData.closure.actionTaken || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-400 uppercase tracking-wider">Effective Date</p>
                            <p className="font-bold text-slate-700 dark:text-slate-200 mt-0.5">
                              {caseData.closure.effectiveDate ? new Date(caseData.closure.effectiveDate).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className="border-t border-emerald-100/50 pt-2 text-xs">
                          <p className="font-semibold text-slate-400">Closing Remarks</p>
                          <p className="text-slate-600 dark:text-slate-300 mt-0.5 italic">"{caseData.closure.closingRemarks}"</p>
                        </div>
                        <div className="pt-3 border-t border-emerald-100/50 flex justify-start">
                          <Button
                            onClick={handleDownloadPDF}
                            disabled={downloadingPDF}
                            className="bg-[#2563EB] hover:bg-blue-600 text-white font-semibold text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all"
                          >
                            <Download className="h-3.5 w-3.5" />
                            {downloadingPDF ? 'Downloading...' : 'Download Official Final Order PDF'}
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Record Decision Admin Form */}
                    {currentUser?.role === 'POSH_ADMIN' && caseData?.recommendationReviewStatus === 'APPROVED' && caseData?.status !== 'CLOSED' && (
                      <Card className="border-emerald-500/20 bg-emerald-50/5">
                        <CardHeader>
                          <CardTitle className="text-sm font-bold uppercase tracking-wider text-emerald-600">Record Final Decision & Close Case</CardTitle>
                          <CardDescription className="text-xs">Statutory requirement: Record organization's decision based on approved recommendation.</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <form onSubmit={handleCloseCase} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                              <div>
                                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Final Outcome/Decision</label>
                                <Input
                                  required
                                  value={closeFinalDecision}
                                  onChange={(e) => setCloseFinalDecision(e.target.value)}
                                  placeholder="e.g. Complaint Upheld"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Action Taken</label>
                                <select
                                  value={closeActionTaken}
                                  onChange={(e) => setCloseActionTaken(e.target.value)}
                                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-1 focus:ring-[#2563EB] focus:outline-none"
                                >
                                  <option value="NO_ACTION">No Action</option>
                                  <option value="WARNING">Warning</option>
                                  <option value="WRITTEN_WARNING">Written Warning</option>
                                  <option value="SUSPENSION">Suspension</option>
                                  <option value="TERMINATION">Termination</option>
                                  <option value="OTHER">Other</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Effective Date</label>
                                <Input
                                  type="date"
                                  required
                                  value={closeEffectiveDate}
                                  onChange={(e) => setCloseEffectiveDate(e.target.value)}
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Closing Remarks (Min 10 chars)</label>
                              <textarea
                                required
                                value={closeRemarks}
                                onChange={(e) => setCloseRemarks(e.target.value)}
                                placeholder="Enter closing details and remarks..."
                                className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-1 focus:ring-[#2563EB] focus:outline-none"
                                rows={3}
                              />
                            </div>
                            <Button type="submit" size="sm" variant="success" loading={submitting}>
                              Record final decision and Close Case
                            </Button>
                          </form>
                        </CardContent>
                      </Card>
                    )}

                    {/* Employee Confidential Feedback Panel */}
                    {caseData?.status === 'CLOSED' && (
                      <div className="border-t border-slate-100 dark:border-white/5 pt-5 space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Confidential Process Feedback</h4>
                        {caseData.feedback ? (
                          <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl text-xs space-y-1">
                            <p className="font-semibold text-slate-400">Submitted Feedback</p>
                            <p className="text-slate-600 dark:text-slate-300 mt-1 italic">"{caseData.feedback}"</p>
                          </div>
                        ) : (
                          <>
                            {currentUser?._id === caseData.complainant?._id || currentUser?._id === caseData.complainant ? (
                              <form onSubmit={handleFeedbackSubmit} className="space-y-3">
                                <p className="text-xs text-slate-400">We care about your safety and experience. Please rate or describe your experience with the investigation and statutory process.</p>
                                <textarea
                                  value={feedbackText}
                                  onChange={(e) => setFeedbackText(e.target.value)}
                                  placeholder="Tell us about your experience..."
                                  className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  rows={3}
                                />
                                <Button type="submit" size="sm" loading={submitting} className="bg-blue-600 hover:bg-blue-700 text-white">
                                  Submit Feedback
                                </Button>
                              </form>
                            ) : (
                              <p className="text-xs text-slate-400 italic">No feedback submitted yet by the complainant.</p>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 2: Evidence */}
                {tab === 'evidence' && (
                  <div className="space-y-6">
                    {!isAuthorizedForEvidence ? (
                      <div className="flex flex-col items-center justify-center p-12 text-center">
                        <Lock className="h-10 w-10 text-red-500/70 mb-3" />
                        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Access Restricted</h4>
                        <p className="text-xs text-slate-400 mt-1 max-w-sm">Only authorized committee members and organization POSH administrators have permission to review case evidence.</p>
                      </div>
                    ) : (
                      <>
                        {/* ── Header Row ───────────────────────────────── */}
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Submitted Case Evidence</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">{allEvidence.length} file(s) attached</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400">Review Status:</span>
                            <Badge variant={caseData?.evidenceReviewStatus === 'APPROVED' ? 'success' : caseData?.evidenceReviewStatus === 'MORE_REQUIRED' ? 'warning' : 'neutral'}>
                              {caseData?.evidenceReviewStatus || 'PENDING'}
                            </Badge>
                          </div>
                        </div>

                        {/* ── Review Action Banner (Committee + Admin) ── */}
                        {caseData && caseData.evidenceReviewStatus === 'PENDING' && (
                          currentUser?.role === 'POSH_ADMIN' ||
                          currentUser?.role === 'IC_MEMBER' ||
                          currentUser?.role === 'EXTERNAL_MEMBER' ||
                          isMemberOfCommittee
                        ) && (
                          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/30 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex items-start gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-500/20">
                                <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div className="text-xs">
                                <p className="font-bold text-slate-800 dark:text-slate-200">Evidence Awaiting Review</p>
                                <p className="text-slate-500 mt-0.5">Review all files below. Approve if sufficient or request modifications from the complainant.</p>
                              </div>
                            </div>
                            <div className="flex gap-2 shrink-0">
                              <Button size="sm" variant="success" onClick={() => handleEvidenceReview('APPROVED')}>
                                <Check className="h-3.5 w-3.5" /> Approve Evidence
                              </Button>
                              <Button size="sm" variant="warning" onClick={() => handleEvidenceReview('MORE_REQUIRED')}>
                                Request More
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* ── Already Approved Banner ───────────────── */}
                        {caseData?.evidenceReviewStatus === 'APPROVED' && (
                          <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/30 p-4">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-500/20">
                              <Check className="h-4 w-4 text-emerald-600" />
                            </div>
                            <div className="text-xs">
                              <p className="font-bold text-emerald-800 dark:text-emerald-300">Evidence Approved</p>
                              <p className="text-emerald-600 dark:text-emerald-400 mt-0.5">All submitted evidence has been reviewed and approved by the committee.</p>
                            </div>
                          </div>
                        )}

                        {/* ── More Required Banner + Upload Form ───── */}
                        {caseData?.evidenceReviewStatus === 'MORE_REQUIRED' && (
                          <div className="rounded-2xl border-2 border-dashed border-amber-300 dark:border-amber-500/30 bg-amber-50/30 dark:bg-amber-900/5 p-5 space-y-4">
                            <div className="flex items-start gap-3">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-500/20">
                                <RefreshCw className="h-4 w-4 text-amber-600" />
                              </div>
                              <div className="text-xs">
                                <h4 className="font-bold text-amber-800 dark:text-amber-400">Additional Evidence Requested</h4>
                                <p className="text-slate-500 mt-0.5">The committee has requested more documents. Please upload the required files.</p>
                              </div>
                            </div>
                            {(currentUser?._id === caseData?.complainant?._id || currentUser?._id === caseData?.complainant) && (
                              <form onSubmit={handleUploadEvidence} className="space-y-3">
                                <input
                                  type="file"
                                  multiple
                                  required
                                  onChange={(e) => setUploadingFiles(e.target.files)}
                                  className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                                />
                                <textarea
                                  placeholder="Describe the additional evidence being uploaded..."
                                  value={uploadDescription}
                                  onChange={(e) => setUploadDescription(e.target.value)}
                                  className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                                  rows={3}
                                />
                                <Button type="submit" size="sm" loading={uploading} className="bg-amber-600 hover:bg-amber-700 text-white">
                                  Submit Additional Evidence
                                </Button>
                              </form>
                            )}
                          </div>
                        )}

                        {/* ── Evidence File Cards ───────────────────── */}
                        {allEvidence.length > 0 ? (
                          <div className="grid grid-cols-1 gap-3">
                            {allEvidence.map((ev, i) => {
                              const category = getFileCategory(ev)
                              const fileUrl = ev.secureUrl || ev.url || null
                              const fileName = ev.originalName || ev.fileName || 'Evidence File'
                              const uploaderName = ev.uploadedBy?.fullName || 'Anonymous'
                              const uploadDate = ev.createdAt ? new Date(ev.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : '—'
                              const fileSize = ev.fileSize ? `${(ev.fileSize / 1024).toFixed(1)} KB` : '—'

                              // Category-specific config
                              const categoryConfig = {
                                IMAGE:    { icon: ImageIcon,  bg: 'bg-violet-100 dark:bg-violet-500/15', iconColor: 'text-violet-600 dark:text-violet-400', badge: 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300', label: 'Image' },
                                PDF:      { icon: FileText,   bg: 'bg-red-100 dark:bg-red-500/15',     iconColor: 'text-red-600 dark:text-red-400',     badge: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300',     label: 'PDF' },
                                AUDIO:    { icon: FileAudio,  bg: 'bg-emerald-100 dark:bg-emerald-500/15', iconColor: 'text-emerald-600 dark:text-emerald-400', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300', label: 'Audio' },
                                VIDEO:    { icon: Video,      bg: 'bg-blue-100 dark:bg-blue-500/15',   iconColor: 'text-blue-600 dark:text-blue-400',   badge: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',   label: 'Video' },
                                DOCUMENT: { icon: FileIcon,   bg: 'bg-amber-100 dark:bg-amber-500/15', iconColor: 'text-amber-600 dark:text-amber-400', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300', label: 'Document' },
                              }
                              const cfg = categoryConfig[category]
                              const CatIcon = cfg.icon

                              return (
                                <div key={ev._id || i} className="rounded-2xl border border-slate-100 dark:border-white/5 bg-white dark:bg-slate-800/50 shadow-sm overflow-hidden">
                                  {/* ── Image Thumbnail Preview ─────── */}
                                  {category === 'IMAGE' && fileUrl && (
                                    <div
                                      className="relative w-full h-44 bg-slate-100 dark:bg-slate-700 cursor-zoom-in overflow-hidden group"
                                      onClick={() => setLightbox({ url: fileUrl, name: fileName, type: 'IMAGE' })}
                                    >
                                      <img
                                        src={fileUrl}
                                        alt={fileName}
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        onError={(e) => { e.target.style.display = 'none' }}
                                      />
                                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-full p-2">
                                          <ZoomIn className="h-5 w-5 text-slate-700" />
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {/* ── Video Preview ───────────────── */}
                                  {category === 'VIDEO' && fileUrl && (
                                    <div className="w-full bg-black">
                                      <video
                                        src={fileUrl}
                                        controls
                                        className="w-full max-h-52 object-contain"
                                        preload="metadata"
                                      />
                                    </div>
                                  )}

                                  {/* ── Audio Player ────────────────── */}
                                  {category === 'AUDIO' && fileUrl && (
                                    <div className="px-4 pt-4 pb-2">
                                      <audio
                                        src={fileUrl}
                                        controls
                                        className="w-full h-10"
                                        preload="metadata"
                                      />
                                    </div>
                                  )}

                                  {/* ── File Info Row ────────────────── */}
                                  <div className="flex items-center justify-between p-4 gap-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${cfg.bg}`}>
                                        <CatIcon className={`h-5 w-5 ${cfg.iconColor}`} />
                                      </div>
                                      <div className="min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[240px]" title={fileName}>
                                            {fileName}
                                          </p>
                                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${cfg.badge}`}>
                                            {cfg.label}
                                          </span>
                                          {ev.isVerified && (
                                            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                                              <ShieldCheck className="h-2.5 w-2.5" /> Verified
                                            </span>
                                          )}
                                        </div>
                                        {ev.description && (
                                          <p className="text-xs text-slate-500 mt-0.5 truncate">{ev.description}</p>
                                        )}
                                        <p className="text-[10px] text-slate-400 mt-0.5">
                                          {fileSize} · By: <span className="font-medium">{uploaderName}</span> · {uploadDate}
                                        </p>
                                      </div>
                                    </div>

                                    {/* ── Action Buttons ───────────────── */}
                                    <div className="flex items-center gap-1.5 shrink-0">
                                      {/* View / Open button */}
                                      {fileUrl && category === 'IMAGE' && (
                                        <button
                                          onClick={() => setLightbox({ url: fileUrl, name: fileName, type: 'IMAGE' })}
                                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-violet-50 text-violet-700 hover:bg-violet-100 dark:bg-violet-500/10 dark:text-violet-300 dark:hover:bg-violet-500/20 transition-colors"
                                          title="Preview Image"
                                        >
                                          <Eye className="h-3.5 w-3.5" /> Preview
                                        </button>
                                      )}
                                      {fileUrl && (category === 'PDF' || category === 'DOCUMENT') && (
                                        <a
                                          href={fileUrl}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-500/20 transition-colors"
                                          title="Open File"
                                        >
                                          <ExternalLink className="h-3.5 w-3.5" /> Open
                                        </a>
                                      )}
                                      {/* Download button — always shown */}
                                      {fileUrl && (
                                        <a
                                          href={fileUrl}
                                          download={fileName}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="inline-flex items-center justify-center h-8 w-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 transition-colors"
                                          title="Download"
                                        >
                                          <Download className="h-3.5 w-3.5" />
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        ) : (
                          <EmptyState title="No evidence files submitted" description="No evidence attachments have been added to this case yet." />
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* ─── Image Lightbox Modal ────────────────────────────── */}
                <AnimatePresence>
                  {lightbox && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
                      onClick={() => setLightbox(null)}
                    >
                      <motion.div
                        initial={{ scale: 0.92, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.92, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center"
                        onClick={e => e.stopPropagation()}
                      >
                        {/* Close button */}
                        <button
                          onClick={() => setLightbox(null)}
                          className="absolute -top-3 -right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-lg text-slate-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                          <XIcon className="h-4 w-4" />
                        </button>
                        {/* Image */}
                        <img
                          src={lightbox.url}
                          alt={lightbox.name}
                          className="max-h-[80vh] max-w-full rounded-2xl object-contain shadow-2xl"
                        />
                        {/* Caption bar */}
                        <div className="mt-3 flex items-center justify-between w-full max-w-xl px-2">
                          <p className="text-sm font-medium text-white/80 truncate">{lightbox.name}</p>
                          <a
                            href={lightbox.url}
                            download={lightbox.name}
                            target="_blank"
                            rel="noreferrer"
                            className="ml-3 shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/10 text-white hover:bg-white/20 transition-colors"
                          >
                            <Download className="h-3.5 w-3.5" /> Download
                          </a>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>



                {/* Tab 3: Hearings */}
                {tab === 'hearings' && (
                  <div className="space-y-6">
                    {caseData?.evidenceReviewStatus !== 'APPROVED' ? (
                      <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed rounded-2xl border-slate-200 dark:border-white/5 bg-slate-50/5">
                        <Lock className="h-10 w-10 text-slate-300 dark:text-slate-600 mb-3" />
                        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Hearings Section Locked</h4>
                        <p className="text-xs text-slate-400 mt-1 max-w-sm">Inquiry hearings can only be scheduled once all submitted evidence has been reviewed and approved by the committee.</p>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-center">
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Scheduled Inquiry Hearings</p>
                          {(currentUser?.role === 'POSH_ADMIN' || isMemberOfCommittee) && !caseData?.isArchived && caseData?.status !== 'CLOSED' && (
                            <Button size="sm" onClick={() => setShowHearingForm(!showHearingForm)}>
                              {showHearingForm ? 'Cancel' : 'Schedule Hearing'}
                            </Button>
                          )}
                        </div>

                        {/* Inline schedule hearing form */}
                        {showHearingForm && (
                          <Card className="border-blue-500/20 bg-blue-50/5">
                            <CardHeader>
                              <CardTitle className="text-sm font-bold text-slate-800 dark:text-white">Schedule Inquiry Session</CardTitle>
                              <CardDescription className="text-xs">Fill details to schedule a new POSH investigation hearing.</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <form onSubmit={handleScheduleHearing} className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Session Type</label>
                                    <select
                                      value={hearingType}
                                      onChange={(e) => setHearingType(e.target.value)}
                                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-1 focus:ring-[#2563EB] focus:outline-none"
                                    >
                                      <option value="PRELIMINARY">Preliminary Hearing</option>
                                      <option value="EVIDENCE_RECORDING">Evidence Recording</option>
                                      <option value="CROSS_EXAMINATION">Cross Examination</option>
                                      <option value="FINAL">Final Hearing</option>
                                      <option value="SPECIAL">Special Hearing</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Scheduled Date & Time</label>
                                    <Input
                                      type="datetime-local"
                                      required
                                      value={hearingDateTime}
                                      onChange={(e) => setHearingDateTime(e.target.value)}
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Mode</label>
                                    <select
                                      value={hearingMode}
                                      onChange={(e) => setHearingMode(e.target.value)}
                                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-1 focus:ring-[#2563EB] focus:outline-none"
                                    >
                                      <option value="Virtual">Virtual (Online Link)</option>
                                      <option value="In-Person">In-Person (Venue Address)</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Meeting Link / Room Venue</label>
                                    <Input
                                      required
                                      value={hearingVenue}
                                      onChange={(e) => setHearingVenue(e.target.value)}
                                      placeholder={hearingMode === 'Virtual' ? 'e.g. Google Meet or Teams link' : 'e.g. Conference Room A, 4th Floor'}
                                    />
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Agenda / Notes</label>
                                  <textarea
                                    required
                                    value={hearingAgenda}
                                    onChange={(e) => setHearingAgenda(e.target.value)}
                                    placeholder="Enter hearing objectives, rules, or agenda..."
                                    className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-1 focus:ring-[#2563EB] focus:outline-none"
                                    rows={3}
                                  />
                                </div>
                                <Button type="submit" size="sm" loading={submitting}>
                                  Schedule Hearing Session
                                </Button>
                              </form>
                            </CardContent>
                          </Card>
                        )}

                        {hearings.length > 0 ? (
                          <div className="space-y-4">
                            {hearings.map(h => (
                              <div key={h._id} className="rounded-2xl border border-slate-100 p-5 dark:border-white/5 space-y-3 bg-slate-50/20">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-mono text-xs font-bold text-[#2563EB]">HEARING #{h.hearingNumber}</p>
                                    <p className="text-xs text-slate-400 mt-0.5">{h.hearingType?.replace(/_/g, ' ')}</p>
                                  </div>
                                  <Badge variant={h.status === 'COMPLETED' ? 'success' : 'warning'}>
                                    {h.status?.replace(/_/g, ' ')}
                                  </Badge>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1 text-slate-600 dark:text-slate-300">
                                  <p>📅 <strong>Date:</strong> {h.scheduledAt ? new Date(h.scheduledAt).toLocaleString() : '—'}</p>
                                  <p>📍 <strong>Venue:</strong> {(() => {
                                    const link = h.meetingLink || h.venue;
                                    const isAbsoluteUrl = link && (link.startsWith('http://') || link.startsWith('https://'));
                                    if (h.isVirtual && isAbsoluteUrl) {
                                      return (
                                        <a href={link} target="_blank" rel="noreferrer" className="text-[#2563EB] hover:underline font-bold">
                                          Open Link
                                        </a>
                                      )
                                    }
                                    return h.venue || 'N/A';
                                  })()}</p>
                                </div>
                                {h.notes && (
                                  <div className="border-t border-slate-100/50 pt-2.5 text-xs">
                                    <p className="font-semibold text-slate-400 uppercase tracking-wider">Agenda</p>
                                    <p className="text-slate-600 dark:text-slate-300 mt-1 italic">"{h.notes}"</p>
                                  </div>
                                )}
                                {h.status === 'COMPLETED' && h.outcome && (
                                  <div className="border-t border-slate-100/50 pt-2.5 text-xs">
                                    <p className="font-semibold text-slate-400 uppercase tracking-wider">Minutes & Outcome</p>
                                    <p className="text-slate-600 dark:text-slate-300 mt-1 font-bold">Outcome: {h.outcome}</p>
                                    {h.notes && <p className="text-slate-500 mt-1">Notes: {h.notes}</p>}
                                  </div>
                                )}

                                {/* Inline Completion form for committee/admin */}
                                {h.status !== 'COMPLETED' && (currentUser?.role === 'POSH_ADMIN' || isMemberOfCommittee) && !caseData?.isArchived && caseData?.status !== 'CLOSED' && (
                                  <div className="border-t border-slate-100/50 pt-3 mt-1 flex flex-col gap-2">
                                    {completingHearingId === h._id ? (
                                      <div className="space-y-3 pt-1">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                          <div>
                                            <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Outcome Summary</label>
                                            <Input
                                              required
                                              value={hearingOutcome}
                                              onChange={(e) => setHearingOutcome(e.target.value)}
                                              placeholder="e.g. Cross examination finished"
                                            />
                                          </div>
                                          <div>
                                            <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Session Minutes (Notes)</label>
                                            <Input
                                              required
                                              value={hearingMinutes}
                                              onChange={(e) => setHearingMinutes(e.target.value)}
                                              placeholder="e.g. Witnesses were heard and records filed"
                                            />
                                          </div>
                                        </div>
                                        <div className="flex gap-2">
                                          <Button size="sm" variant="success" onClick={() => handleCompleteHearing(h._id)} loading={submitting}>
                                            Save Outcomes
                                          </Button>
                                          <Button size="sm" variant="neutral" onClick={() => setCompletingHearingId(null)}>
                                            Cancel
                                          </Button>
                                        </div>
                                      </div>
                                    ) : (
                                      <Button size="sm" variant="neutral" onClick={() => setCompletingHearingId(h._id)} className="w-fit self-end">
                                        Mark Conducted & Complete
                                      </Button>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <EmptyState title="No hearings conducted yet" description="All planned sessions will be listed here." />
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Tab 4: Documents */}
                {tab === 'documents' && (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {[
                      { name: 'Complaint_Filing.pdf', size: '154 KB' },
                      { name: 'Acknowledgement.pdf', size: '92 KB' },
                      ...(caseData?.assignedCommittee ? [{ name: 'Committee_Assignment.pdf', size: '110 KB' }] : []),
                      ...hearings.slice(0, 2).map(h => ({ name: `Hearing_${h.scheduledAt?.split('T')[0]}.pdf`, size: '85 KB' })),
                      ...(caseData?.closure?.closedAt ? [{ name: 'Closure_Report.pdf', size: '320 KB' }] : []),
                    ].map((doc, idx) => (
                      <div key={idx} className="flex flex-col items-center gap-2.5 rounded-2xl border border-slate-100 p-5 text-center hover:bg-slate-50/50 dark:border-white/5 dark:hover:bg-white/5 transition-all">
                        <FileText className="h-9 w-9 text-[#2563EB]" />
                        <span className="truncate text-xs font-semibold text-slate-700 dark:text-slate-300 w-full">{doc.name}</span>
                        <span className="text-[10px] text-slate-400">{doc.size}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tab 5: Recommendations */}
                {tab === 'recommendations' && (
                  <div className="space-y-6">
                    {/* Recommendation Lock Screen if not at correct stage */}
                    {!['COMMITTEE_RECOMMENDATION', 'POSH_ADMIN_REVIEW', 'CLOSED', 'APPEALED'].includes(caseData?.status) ? (
                      <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed rounded-2xl border-slate-200 dark:border-white/5 bg-slate-50/5">
                        <Lock className="h-10 w-10 text-slate-300 dark:text-slate-600 mb-3" />
                        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Recommendations Locked</h4>
                        <p className="text-xs text-slate-400 mt-1 max-w-sm">Committee recommendation updates will unlock once all trial hearings are successfully completed.</p>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-center">
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Committee Recommendation Review</p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400">Approval:</span>
                            <Badge variant={caseData?.recommendationReviewStatus === 'APPROVED' ? 'success' : caseData?.recommendationReviewStatus === 'RETURNED' ? 'warning' : caseData?.recommendationReviewStatus === 'REJECTED' ? 'danger' : 'neutral'}>
                              {caseData?.recommendationReviewStatus || 'PENDING'}
                            </Badge>
                          </div>
                        </div>

                        {/* Interactive review card for POSH Admin */}
                        {caseData?.status === 'POSH_ADMIN_REVIEW' && caseData?.recommendationReviewStatus === 'PENDING' && currentUser?.role === 'POSH_ADMIN' && (
                          <div className="bg-blue-50/30 dark:bg-blue-950/10 border border-blue-100 dark:border-blue-900/30 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="text-xs">
                              <p className="font-bold text-slate-800 dark:text-slate-200">Review Committee Recommendation</p>
                              <p className="text-slate-500 mt-0.5">Approve recommendation, return to committee for changes, or reject it.</p>
                            </div>
                            <div className="flex gap-2 shrink-0">
                              <Button size="sm" variant="success" onClick={() => handleRecommendationReview('APPROVED')}>
                                Approve
                              </Button>
                              <Button size="sm" variant="warning" onClick={() => handleRecommendationReview('RETURNED')}>
                                Return modifications
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleRecommendationReview('REJECTED')}>
                                Reject
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Callout if returned for modifications */}
                        {caseData?.recommendationReviewStatus === 'RETURNED' && (
                          <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 p-4.5 rounded-2xl text-amber-800 dark:text-amber-300">
                            <Info className="h-5 w-5 shrink-0 text-amber-600" />
                            <div className="text-xs">
                              <p className="font-bold">Recommendation Returned by Admin</p>
                              <p className="mt-0.5">Admin requested changes: <span className="italic">"{caseData.recommendationReviewRemarks}"</span></p>
                            </div>
                          </div>
                        )}

                        {/* Render existing recommendation details */}
                        {caseData?.committeeRecommendation?.recommendedAt && (
                          <div className="rounded-2xl border border-slate-100 p-5 space-y-3 bg-slate-50/20">
                            <div className="flex justify-between items-center">
                              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Case Recommendation details</p>
                              <Badge variant="neutral">Filed: {new Date(caseData.committeeRecommendation.recommendedAt).toLocaleDateString()}</Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-xs pt-1 text-slate-600 dark:text-slate-300">
                              <p>⚠️ <strong>Suggested Decision:</strong> <span className="text-[#2563EB] font-bold">{caseData.committeeRecommendation.decision?.replace(/_/g, ' ')}</span></p>
                              <p>⚙️ <strong>Disciplines Required:</strong> {caseData.committeeRecommendation.actionRequired ? 'Yes' : 'No'}</p>
                              <p>🔄 <strong>Follow-up checks:</strong> {caseData.committeeRecommendation.followUpRequired ? 'Yes' : 'No'}</p>
                            </div>
                            <div className="border-t border-slate-100/50 pt-2.5 text-xs">
                              <p className="font-semibold text-slate-400 uppercase tracking-wider">Investigation Findings summary</p>
                              <p className="text-slate-600 dark:text-slate-300 mt-1 italic">"{caseData.committeeRecommendation.remarks}"</p>
                            </div>
                          </div>
                        )}

                        {/* Render submission form if pending or returned and user is committee member */}
                        {isMemberOfCommittee && (!caseData?.committeeRecommendation?.recommendedAt || caseData?.recommendationReviewStatus === 'RETURNED') && !caseData?.isArchived && caseData?.status !== 'CLOSED' && (
                          <Card className="border-blue-500/20 bg-blue-50/5">
                            <CardHeader>
                              <CardTitle className="text-sm font-bold text-slate-800 dark:text-white">Submit Committee Recommendation</CardTitle>
                              <CardDescription className="text-xs">Based on inquiries, enter recommendations. Admin review will trigger upon submission.</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <form onSubmit={handleRecordRecommendation} className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Final Recommendation Decision</label>
                                    <select
                                      value={recDecision}
                                      onChange={(e) => setRecDecision(e.target.value)}
                                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-1 focus:ring-[#2563EB] focus:outline-none"
                                    >
                                      <option value="NO_ACTION">No Action (Dismissal)</option>
                                      <option value="WARNING">Warning</option>
                                      <option value="WRITTEN_WARNING">Written Warning</option>
                                      <option value="SUSPENSION">Suspension</option>
                                      <option value="TERMINATION">Termination / Dismissal from service</option>
                                      <option value="OTHER">Other</option>
                                    </select>
                                  </div>
                                  <div className="flex flex-col gap-3 justify-center">
                                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={recActionReq}
                                        onChange={(e) => setRecActionReq(e.target.checked)}
                                        className="rounded border-slate-300 text-[#2563EB]"
                                      />
                                      Organization disciplinary action required
                                    </label>
                                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={recFollowUpReq}
                                        onChange={(e) => setRecFollowUpReq(e.target.checked)}
                                        className="rounded border-slate-300 text-[#2563EB]"
                                      />
                                      Periodic follow-up safety checks required
                                    </label>
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Investigation findings & recommendations summary</label>
                                  <textarea
                                    required
                                    value={recRemarks}
                                    onChange={(e) => setRecRemarks(e.target.value)}
                                    placeholder="Provide details on findings and recommended actions..."
                                    className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-1 focus:ring-[#2563EB] focus:outline-none"
                                    rows={4}
                                  />
                                </div>
                                <Button type="submit" size="sm" loading={submitting} className="bg-blue-600 hover:bg-blue-700 text-white">
                                  Submit Recommendation Report
                                </Button>
                              </form>
                            </CardContent>
                          </Card>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side Sidebar */}
        <div className="space-y-4">
          <Card className="shadow-sm border-slate-100 dark:border-white/5">
            <CardHeader><CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-400">Statutory Timeline</CardTitle></CardHeader>
            <CardContent>
              <ol className="relative space-y-5 border-l border-slate-200 pl-5 dark:border-white/10">
                {(caseData?.timeline || complaint?.timeline || []).length > 0 ? (
                  (caseData?.timeline || complaint?.timeline).map((item, idx) => (
                    <li key={idx} className="relative">
                      <span className="absolute -left-[25px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-[#2563EB] dark:border-slate-800">
                        <Check className="h-2.5 w-2.5 text-white" />
                      </span>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{item.status?.replace(/_/g, ' ')}</p>
                      {item.remarks && <p className="text-xs text-slate-500 mt-0.5">{item.remarks}</p>}
                      <p className="text-[10px] text-slate-400 font-semibold mt-1">
                        {item.changedBy?.fullName || 'System'} · {new Date(item.timestamp || item.changedAt).toLocaleDateString()}
                      </p>
                    </li>
                  ))
                ) : (
                  <EmptyState title="No timeline entries" />
                )}
              </ol>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-100 dark:border-white/5">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-400">Assigned Committee</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {assignedCommittee ? (
                <>
                  <p className="text-xs text-[#2563EB] font-bold uppercase">{assignedCommittee.name}</p>
                  <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-white/5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2563EB] to-indigo-600 text-xs font-semibold text-white">
                      {assignedCommittee.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-slate-800 dark:text-white">{assignedCommittee.name}</p>
                      <p className="truncate text-[10px] text-slate-400">Internal Committee</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <EmptyState title="No committee assigned" description="A committee will be assigned by the POSH Admin." />
                  {currentUser?.role === 'POSH_ADMIN' && (
                    <Button className="w-full mt-2" onClick={handleAssignCommittee}>
                      Assign Committee
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

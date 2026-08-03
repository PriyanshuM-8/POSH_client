import React, { useEffect, useState } from 'react'
import { Scale, AlertTriangle, RefreshCw } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { SkeletonCard } from '@/components/ui/Skeleton'
import EmptyState from '@/components/ui/EmptyState'
import { getDashboardService } from '@/services/dashboardService'
import { assignAdminToComplaintService } from '@/services/complaintService'
import { toast } from 'sonner'
import Swal from 'sweetalert2'

export default function OwnerComplaints() {
  const [adminComplaints, setAdminComplaints] = useState([])
  const [poshAdmins, setPoshAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getDashboardService()
      setAdminComplaints(data.adminComplaints || [])
      setPoshAdmins((data.poshAdmins || []).map(u => ({ ...u, isActive: u.status === 'ACTIVE' })))
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load complaints.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleAssignAdmin = async (complaintId, adminId) => {
    if (!adminId) {
      toast.error('Please select a POSH Admin to assign.')
      return
    }
    try {
      await assignAdminToComplaintService(complaintId, { adminId })
      toast.success('Complaint assigned successfully!')
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign POSH Admin.')
    }
  }

  const handleInitiateExternal = async (complaintId) => {
    Swal.fire({
      title: 'Initiate External Workflow?',
      text: 'This will route the investigation to external compliance workflows and notify the complainant.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, initiate external workflow',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#2563EB',
      cancelButtonColor: '#6B7280',
      background: document.documentElement.classList.contains('dark') ? '#1E293B' : '#FFFFFF',
      color: document.documentElement.classList.contains('dark') ? '#F3F4F6' : '#1F2937',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await assignAdminToComplaintService(complaintId, { isExternalWorkflow: true })
          toast.success('External compliance workflow initiated!')
          fetchData()
        } catch (err) {
          toast.error(err.response?.data?.message || 'Failed to initiate external workflow.')
        }
      }
    })
  }

  if (error) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <AlertTriangle className="h-10 w-10 text-red-400" />
        <p className="text-sm text-slate-500">{error}</p>
        <Button variant="outline" onClick={fetchData}><RefreshCw className="h-4 w-4" /> Retry</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Scale className="h-6 w-6 text-indigo-500" />
          POSH Admin Complaints & Self-Incidents
        </h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Manage and assign conflicts of interest when a POSH Administrator raises a complaint.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : adminComplaints.length === 0 ? (
        <EmptyState
          title="No POSH Admin complaints"
          description="There are currently no complaints filed by POSH Admins in your company."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {adminComplaints.map((c) => {
            // Get active POSH Admins that are NOT the complainant
            const otherActiveAdmins = poshAdmins.filter(
              (admin) => admin.isActive && admin._id !== c.complainant?._id
            );

            const isUnassigned = !c.assignedAdmin && c.status === 'PENDING_REVIEW';
            const isExternal = !c.assignedAdmin && c.status !== 'PENDING_REVIEW';

            return (
              <Card key={c._id} className={`border border-slate-200 dark:border-white/5 ${isUnassigned ? 'border-rose-200 dark:border-rose-950 bg-rose-50/10 dark:bg-rose-950/5' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <div>
                      <CardTitle className="text-sm font-bold text-slate-800 dark:text-slate-200">{c.title}</CardTitle>
                      <CardDescription className="text-xs mt-1">
                        Filed by POSH Admin: <strong>{c.complainant?.fullName}</strong> ({c.complainant?.email}) on {new Date(c.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div>
                      {c.assignedAdmin ? (
                        <Badge variant="success" className="text-[10px]">ASSIGNED</Badge>
                      ) : isExternal ? (
                        <Badge variant="info" className="text-[10px]">EXTERNAL WORKFLOW</Badge>
                      ) : (
                        <Badge variant="danger" className="text-[10px]">UNASSIGNED / ACTION REQUIRED</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 pb-4 space-y-4">
                  <p className="text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-white/5">
                    {c.description}
                  </p>
                  
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      {c.assignedAdmin ? (
                        <span className="text-xs text-slate-600 dark:text-slate-300">
                          🔒 Assigned to: <strong>{c.assignedAdmin.fullName}</strong> ({c.assignedAdmin.email})
                        </span>
                      ) : isExternal ? (
                        <span className="text-xs text-slate-600 dark:text-slate-300">
                          🌐 Investigation routed via <strong>External Compliance Workflow</strong>
                        </span>
                      ) : (
                        <>
                          <span className="text-xs font-semibold text-slate-500">Assign to Admin:</span>
                          {otherActiveAdmins.length > 0 ? (
                            <div className="flex items-center gap-2">
                              <select
                                id={`select-admin-${c._id}`}
                                className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                              >
                                <option value="">Select POSH Admin...</option>
                                {otherActiveAdmins.map((admin) => (
                                  <option key={admin._id} value={admin._id}>
                                    {admin.fullName} ({admin.department || 'No Dept'})
                                  </option>
                                ))}
                              </select>
                              <Button
                                size="sm"
                                onClick={() => {
                                  const selectEl = document.getElementById(`select-admin-${c._id}`);
                                  handleAssignAdmin(c._id, selectEl?.value);
                                }}
                                className="text-xs font-semibold"
                              >
                                Assign
                              </Button>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 italic">No other active POSH Admins found. Please create one.</span>
                          )}
                        </>
                      )}
                    </div>

                    {isUnassigned && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleInitiateExternal(c._id)}
                        className="text-xs font-semibold border border-slate-200 hover:border-slate-300 dark:border-white/5"
                      >
                        Initiate External Workflow
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  )
}

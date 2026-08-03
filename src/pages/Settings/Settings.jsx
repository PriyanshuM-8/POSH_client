import React, { useState } from 'react'
import { Building2, Workflow, Lock, ShieldCheck, Mail, DatabaseBackup, Check } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { usePosh } from '@/context/PoshContext'
import { toast } from 'sonner'

const sections = [
  { key: 'company', label: 'Company Profile', icon: Building2 },
  { key: 'workflow', label: 'Workflow Settings', icon: Workflow },
  { key: 'permissions', label: 'Access Permissions', icon: Lock },
  { key: 'security', label: 'Security & Auth', icon: ShieldCheck },
  { key: 'backup', label: 'Disaster Backup', icon: DatabaseBackup },
]

export default function Settings() {
  const { companySettings, setCompanySettings, addAuditLog } = usePosh()
  const [active, setActive] = useState('company')

  // Form states
  const [companyForm, setCompanyForm] = useState({
    name: companySettings.name,
    address: companySettings.address,
    email: companySettings.email
  })

  const [workflowForm, setWorkflowForm] = useState({
    acknowledgementSla: companySettings.acknowledgementSla,
    investigationSla: companySettings.investigationSla
  })

  const [securityForm, setSecurityForm] = useState({
    mfaRequired: companySettings.mfaRequired,
    anonymityAllowed: companySettings.anonymityAllowed
  })

  const handleSaveCompany = (e) => {
    e.preventDefault()
    setCompanySettings(prev => {
      const next = { ...prev, ...companyForm }
      localStorage.setItem('posh_company_settings', JSON.stringify(next))
      return next
    })
    addAuditLog('Updated company profile settings')
    toast.success('Company profile updated successfully!')
  }

  const handleSaveWorkflow = (e) => {
    e.preventDefault()
    setCompanySettings(prev => {
      const next = { ...prev, ...workflowForm }
      localStorage.setItem('posh_company_settings', JSON.stringify(next))
      return next
    })
    addAuditLog('Updated compliance SLA parameters')
    toast.success('Statutory SLA targets updated successfully!')
  }

  const handleSaveSecurity = (e) => {
    e.preventDefault()
    setCompanySettings(prev => {
      const next = { ...prev, ...securityForm }
      localStorage.setItem('posh_company_settings', JSON.stringify(next))
      return next
    })
    addAuditLog('Modified system security configuration')
    toast.success('Security configurations updated!')
  }

  const handleManualBackup = () => {
    addAuditLog('Triggered manual disaster recovery backup')
    toast.success('Manual disaster recovery backup completed successfully!')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-800 dark:text-white">Settings</h1>
        <p className="mt-0.5 text-sm text-muted-foreground font-medium">Configure corporate policies, statutory timelines, and audit retention.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="space-y-1 lg:col-span-1">
          {sections.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActive(key)}
              className={`flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-sm font-semibold transition-colors ${
                active === key ? 'bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-300' : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5'
              }`}
            >
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </div>

        <Card className="lg:col-span-3">
          <CardContent className="space-y-5 p-6">
            {active === 'company' && (
              <form onSubmit={handleSaveCompany} className="space-y-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Company Information</p>
                <Input
                  label="Registered Corporate Name"
                  value={companyForm.name}
                  onChange={e => setCompanyForm(f => ({ ...f, name: e.target.value }))}
                />
                <Input
                  label="Physical HQ Address"
                  value={companyForm.address}
                  onChange={e => setCompanyForm(f => ({ ...f, address: e.target.value }))}
                />
                <Input
                  label="Compliance Team Contact Email"
                  type="email"
                  value={companyForm.email}
                  onChange={e => setCompanyForm(f => ({ ...f, email: e.target.value }))}
                />
                <div className="flex justify-end pt-2">
                  <Button type="submit">Save Profile Changes</Button>
                </div>
              </form>
            )}

            {active === 'workflow' && (
              <form onSubmit={handleSaveWorkflow} className="space-y-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Statutory Timelines Config</p>
                <p className="text-xs text-muted-foreground">Adjust statutory warning periods, acknowledgement deadlines, and hearing sequence target dates.</p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input
                    label="Acknowledgement SLA Target (Days)"
                    value={workflowForm.acknowledgementSla}
                    onChange={e => setWorkflowForm(f => ({ ...f, acknowledgementSla: e.target.value }))}
                  />
                  <Input
                    label="Investigation SLA Target (Days)"
                    value={workflowForm.investigationSla}
                    onChange={e => setWorkflowForm(f => ({ ...f, investigationSla: e.target.value }))}
                  />
                </div>
                <div className="flex justify-end pt-2">
                  <Button type="submit">Update Timelines</Button>
                </div>
              </form>
            )}

            {active === 'permissions' && (
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Access Matrix Controls</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Strict role-based access control (RBAC) is enforced across Employee, HR SPOC, POSH Admin, IC Board, and Independent members. Permissions are immutable at the frontend to preserve legal system integrity.
                </p>
                <div className="space-y-2 border border-slate-100 rounded-xl p-3 dark:border-white/5 bg-slate-50/20 text-xs font-medium">
                  <div className="flex justify-between pb-2 border-b border-slate-50 dark:border-white/5">
                    <span className="text-slate-400">Super Administrator permissions:</span>
                    <span className="text-slate-800 dark:text-slate-200">Owner role only</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-slate-50 dark:border-white/5">
                    <span className="text-slate-400">Assign legal case committees:</span>
                    <span className="text-slate-800 dark:text-slate-200">POSH Admin only</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Submit legal case recommendations:</span>
                    <span className="text-slate-800 dark:text-slate-200">IC Board and External Members</span>
                  </div>
                </div>
              </div>
            )}

            {active === 'security' && (
              <form onSubmit={handleSaveSecurity} className="space-y-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Security Configuration</p>
                
                <div className="space-y-3">
                  <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={securityForm.mfaRequired}
                      onChange={e => setSecurityForm(f => ({ ...f, mfaRequired: e.target.checked }))}
                      className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                    />
                    Enforce Multi-Factor Authentication (MFA) for Administrative roles
                  </label>

                  <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={securityForm.anonymityAllowed}
                      onChange={e => setSecurityForm(f => ({ ...f, anonymityAllowed: e.target.checked }))}
                      className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                    />
                    Permit filing anonymous complaints in employee wizard
                  </label>
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit">Save Configurations</Button>
                </div>
              </form>
            )}

            {active === 'backup' && (
              <div className="space-y-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Manual Disaster Backup</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Trigger a compiled backup of current database states (Complaints, Roster index, Audit logs) for disaster recovery storage.
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleManualBackup}>
                    <DatabaseBackup className="h-4 w-4" /> Run Manual Backup
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

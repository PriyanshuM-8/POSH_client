import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { usePosh } from '@/context/PoshContext'
import { getMyProfileService, updateMyProfileService } from '@/services/userService'
import { toast } from 'sonner'

export default function MyProfile() {
  const { currentUser, setCurrentUser } = usePosh()
  const user = currentUser || {}

  const [form, setForm] = useState({
    fullName: user.fullName || '',
    email: user.email || '',
    department: user.department || '',
    phone: user.phone || '',
    designation: user.designation || '',
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setForm({
      fullName: user.fullName || '',
      email: user.email || '',
      department: user.department || '',
      phone: user.phone || '',
      designation: user.designation || '',
    })
  }, [user])

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const formData = new FormData()
      if (form.phone) {
        formData.append('phone', form.phone)
      }

      const updatedUser = await updateMyProfileService(formData)
      setCurrentUser(updatedUser)
      toast.success('Profile updated successfully.')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">My Profile</h1>
        <p className="mt-0.5 text-sm text-slate-500">View and update your personal information.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Avatar card */}
        <Card className="flex flex-col items-center p-8 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#2563EB] to-indigo-600 text-2xl font-bold text-white shadow-sm">
            {user.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U'}
          </div>
          <p className="mt-4 text-lg font-bold text-slate-800 dark:text-white">{user.fullName}</p>
          <Badge variant="default" className="mt-2">{user.role}</Badge>
          <p className="mt-2 text-xs text-slate-400">Employee ID: {user.employeeId || '—'}</p>
        </Card>

        {/* Edit form */}
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Full Name"
                  value={form.fullName}
                  disabled
                />
                <Input
                  label="Email Address"
                  type="email"
                  value={form.email}
                  disabled
                />
                <Input
                  label="Department"
                  value={form.department}
                  disabled
                />
                <Input
                  label="Designation"
                  value={form.designation}
                  disabled
                />
                <Input
                  label="Phone Number"
                  value={form.phone}
                  onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                />
              </div>
              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving…' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

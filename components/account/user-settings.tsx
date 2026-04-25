'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AlertCircle, Check, Loader2 } from 'lucide-react'

interface UserSettingsProps {
  user: any
}

export function UserSettings({ user }: UserSettingsProps) {
  const [activeTab, setActiveTab] = useState<'email' | 'password' | 'profile'>('profile')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Email change
  const [newEmail, setNewEmail] = useState('')
  const [emailPassword, setEmailPassword] = useState('')

  // Password change
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Profile
  const [fullName, setFullName] = useState(user?.full_name || '')

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      const response = await fetch('/api/account/change-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newEmail, password: emailPassword }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to change email')
      }

      setSuccess('Verification email sent to your new address')
      setNewEmail('')
      setEmailPassword('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change email')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/account/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to change password')
      }

      setSuccess('Password changed successfully')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      const response = await fetch('/api/account/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update profile')
      }

      setSuccess('Profile updated successfully')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-700">
        {(['profile', 'email', 'password'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 capitalize font-medium transition-colors ${
              activeTab === tab
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Messages */}
      {error && (
        <div className="p-4 bg-red-900/20 border border-red-600 rounded-lg flex gap-2 items-start">
          <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-red-200">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-900/20 border border-green-600 rounded-lg flex gap-2 items-start">
          <Check className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
          <p className="text-green-200">{success}</p>
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <Card className="p-6 bg-slate-800 border-slate-700">
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Full Name
              </label>
              <Input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Email (Read-only)
              </label>
              <Input
                type="email"
                value={user?.email || ''}
                disabled
                className="bg-slate-700 border-slate-600 text-slate-400 cursor-not-allowed"
              />
              <p className="text-xs text-slate-400 mt-2">
                Change email in the Email tab
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Profile'
              )}
            </Button>
          </form>
        </Card>
      )}

      {/* Email Tab */}
      {activeTab === 'email' && (
        <Card className="p-6 bg-slate-800 border-slate-700">
          <form onSubmit={handleChangeEmail} className="space-y-4">
            <p className="text-sm text-slate-300">
              Current email: <span className="font-medium">{user?.email}</span>
            </p>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                New Email
              </label>
              <Input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="newemail@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Password (to confirm)
              </label>
              <Input
                type="password"
                value={emailPassword}
                onChange={(e) => setEmailPassword(e.target.value)}
                required
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Enter your password"
              />
            </div>

            <p className="text-xs text-slate-400">
              A verification link will be sent to your new email address
            </p>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Change Email'
              )}
            </Button>
          </form>
        </Card>
      )}

      {/* Password Tab */}
      {activeTab === 'password' && (
        <Card className="p-6 bg-slate-800 border-slate-700">
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Current Password
              </label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Enter current password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                New Password
              </label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Enter new password"
              />
              <p className="text-xs text-slate-400 mt-2">
                Minimum 8 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Confirm Password
              </label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Confirm new password"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Changing...
                </>
              ) : (
                'Change Password'
              )}
            </Button>
          </form>
        </Card>
      )}
    </div>
  )
}

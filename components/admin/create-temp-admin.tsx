'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AlertCircle, Copy, Check, Loader2 } from 'lucide-react'

interface TempAdminCredentials {
  id: string
  email: string
  temporaryPassword: string
  fullName?: string
  expiresAt: Date
}

export function CreateTempAdmin() {
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<TempAdminCredentials | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      const response = await fetch('/api/admin/create-temp-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, fullName }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create credentials')
      }

      const data = await response.json()
      setSuccess(data.credentials)
      setEmail('')
      setFullName('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create admin')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Card className="p-6 bg-slate-800 border-slate-700">
        <h2 className="text-xl font-bold text-white mb-4">Create Temporary Admin</h2>

        {error && (
          <div className="mb-4 p-4 bg-red-900/20 border border-red-600 rounded-lg flex gap-2">
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
            <p className="text-red-200">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Admin Email *
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-slate-700 border-slate-600 text-white"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Full Name (Optional)
            </label>
            <Input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
              placeholder="John Doe"
            />
          </div>

          <div className="bg-blue-900/20 border border-blue-600/50 rounded-lg p-4 text-sm text-blue-200">
            <p>
              A temporary password will be generated and the admin will be forced to change it on first login.
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
                Creating...
              </>
            ) : (
              'Create Temporary Admin'
            )}
          </Button>
        </form>
      </Card>

      {success && (
        <Card className="p-6 bg-green-900/20 border border-green-600">
          <h3 className="text-lg font-bold text-green-300 mb-4">
            Temporary Credentials Generated
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-green-200 mb-2">
                Email
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={success.email}
                  readOnly
                  className="flex-1 bg-slate-700 border border-slate-600 text-white px-3 py-2 rounded"
                />
                <Button
                  onClick={() => copyToClipboard(success.email, 'email')}
                  size="sm"
                  className="bg-slate-700 hover:bg-slate-600"
                >
                  {copiedField === 'email' ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-green-200 mb-2">
                Temporary Password
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={success.temporaryPassword}
                  readOnly
                  className="flex-1 bg-slate-700 border border-slate-600 text-white px-3 py-2 rounded font-mono"
                />
                <Button
                  onClick={() =>
                    copyToClipboard(success.temporaryPassword, 'password')
                  }
                  size="sm"
                  className="bg-slate-700 hover:bg-slate-600"
                >
                  {copiedField === 'password' ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-green-200 mb-2">
                Expires At
              </label>
              <input
                type="text"
                value={new Date(success.expiresAt).toLocaleString()}
                readOnly
                className="w-full bg-slate-700 border border-slate-600 text-white px-3 py-2 rounded"
              />
            </div>

            <div className="bg-orange-900/20 border border-orange-600 rounded-lg p-4 text-sm text-orange-200">
              <p className="font-semibold mb-1">Important:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  Share these credentials securely with the new admin
                </li>
                <li>
                  They will be prompted to change password on first login
                </li>
                <li>
                  Credentials expire in 24 hours
                </li>
              </ul>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

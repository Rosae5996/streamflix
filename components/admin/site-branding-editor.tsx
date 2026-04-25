'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AlertCircle, Loader2, Check } from 'lucide-react'

interface SiteBranding {
  id: string
  siteTitle: string
  siteDescription?: string
  siteLogoUrl?: string
  siteFaviconUrl?: string
  primaryColor: string
  secondaryColor: string
  fontFamily: string
  maintenanceMode: boolean
  maintenanceMessage?: string
}

export function SiteBrandingEditor() {
  const [branding, setBranding] = useState<SiteBranding | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState<Partial<SiteBranding>>({})

  useEffect(() => {
    fetchBranding()
  }, [])

  const fetchBranding = async () => {
    try {
      const response = await fetch('/api/admin/branding')
      if (!response.ok) throw new Error('Failed to fetch branding')
      const data = await response.json()
      setBranding(data.branding)
      setFormData(data.branding)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch branding')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: keyof SiteBranding, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setSaving(true)

    try {
      const response = await fetch('/api/admin/branding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update branding')
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update branding')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-slate-400">Loading branding settings...</div>
  }

  return (
    <div className="max-w-4xl space-y-6">
      {error && (
        <div className="p-4 bg-red-900/20 border border-red-600 rounded-lg flex gap-2">
          <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
          <p className="text-red-200">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-900/20 border border-green-600 rounded-lg flex gap-2">
          <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
          <p className="text-green-200">Branding updated successfully</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Site Identity */}
        <Card className="p-6 bg-slate-800 border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Site Identity</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Site Title
              </label>
              <Input
                type="text"
                value={formData.siteTitle || ''}
                onChange={(e) => handleChange('siteTitle', e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Site Description
              </label>
              <textarea
                value={formData.siteDescription || ''}
                onChange={(e) => handleChange('siteDescription', e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 text-white px-3 py-2 rounded h-24"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Logo URL
              </label>
              <Input
                type="text"
                value={formData.siteLogoUrl || ''}
                onChange={(e) => handleChange('siteLogoUrl', e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="https://..."
              />
            </div>
          </div>
        </Card>

        {/* Colors & Design */}
        <Card className="p-6 bg-slate-800 border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Design</h3>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Primary Color
                </label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={formData.primaryColor || '#0066cc'}
                    onChange={(e) => handleChange('primaryColor', e.target.value)}
                    className="w-12 h-10 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={formData.primaryColor || '#0066cc'}
                    onChange={(e) => handleChange('primaryColor', e.target.value)}
                    className="flex-1 bg-slate-700 border-slate-600 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Secondary Color
                </label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={formData.secondaryColor || '#f0f0f0'}
                    onChange={(e) => handleChange('secondaryColor', e.target.value)}
                    className="w-12 h-10 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={formData.secondaryColor || '#f0f0f0'}
                    onChange={(e) => handleChange('secondaryColor', e.target.value)}
                    className="flex-1 bg-slate-700 border-slate-600 text-white font-mono"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Font Family
              </label>
              <select
                value={formData.fontFamily || 'sans-serif'}
                onChange={(e) => handleChange('fontFamily', e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 text-white px-3 py-2 rounded"
              >
                <option value="sans-serif">Sans Serif</option>
                <option value="serif">Serif</option>
                <option value="monospace">Monospace</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Maintenance Mode */}
        <Card className="p-6 bg-slate-800 border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Maintenance Mode</h3>

          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.maintenanceMode || false}
                onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
                className="w-4 h-4 rounded bg-slate-700 border-slate-600"
              />
              <span className="text-slate-200">Enable Maintenance Mode</span>
            </label>

            {formData.maintenanceMode && (
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Maintenance Message
                </label>
                <textarea
                  value={formData.maintenanceMessage || ''}
                  onChange={(e) =>
                    handleChange('maintenanceMessage', e.target.value)
                  }
                  className="w-full bg-slate-700 border border-slate-600 text-white px-3 py-2 rounded h-20"
                  placeholder="We are currently performing maintenance..."
                />
              </div>
            )}
          </div>
        </Card>

        <Button
          type="submit"
          disabled={saving}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Branding Settings'
          )}
        </Button>
      </form>
    </div>
  )
}

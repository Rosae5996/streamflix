'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Header } from '@/components/layout/header'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'

interface AdminSettingsProps {
  initialSettings: any[]
  initialSections: any[]
}

export function AdminSettings({ initialSettings, initialSections }: AdminSettingsProps) {
  const [maintenanceMode, setMaintenanceMode] = useState(
    initialSettings.find(s => s.setting_key === 'maintenance_mode')?.setting_value === 'true'
  )
  const [siteTitle, setSiteTitle] = useState(
    initialSettings.find(s => s.setting_key === 'site_title')?.setting_value || 'StreamFlix'
  )
  const [siteDescription, setSiteDescription] = useState(
    initialSettings.find(s => s.setting_key === 'site_description')?.setting_value || ''
  )
  const [sections, setSections] = useState(initialSections)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const supabase = createClient()
  const router = useRouter()

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const updates = [
        { setting_key: 'maintenance_mode', setting_value: maintenanceMode ? 'true' : 'false' },
        { setting_key: 'site_title', setting_value: siteTitle },
        { setting_key: 'site_description', setting_value: siteDescription },
      ]

      for (const update of updates) {
        const existing = initialSettings.find(s => s.setting_key === update.setting_key)
        if (existing) {
          await supabase
            .from('admin_settings')
            .update({ setting_value: update.setting_value, updated_at: new Date() })
            .eq('setting_key', update.setting_key)
        } else {
          await supabase
            .from('admin_settings')
            .insert([{ ...update, description: update.setting_key }])
        }
      }

      setMessage({ type: 'success', text: 'Settings updated successfully' })
      setTimeout(() => router.refresh(), 1000)
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update settings' })
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateSection = async (sectionId: string, updates: Partial<any>) => {
    try {
      const { error } = await supabase
        .from('sections')
        .update(updates)
        .eq('id', sectionId)

      if (error) {
        setMessage({ type: 'error', text: error.message })
      } else {
        setSections(sections.map(s => s.id === sectionId ? { ...s, ...updates } : s))
        setMessage({ type: 'success', text: 'Section updated' })
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update section' })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950">
      <Header />

      <div className="flex">
        <AdminSidebar />

        <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl space-y-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-white">Settings</h1>
            <p className="text-slate-400">Configure your StreamFlix platform</p>
          </div>

          {message && (
            <div
              className={`p-4 rounded-lg ${
                message.type === 'success'
                  ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* General Settings */}
          <Card className="bg-slate-800 border-slate-700 p-8">
            <h2 className="text-2xl font-bold text-white mb-6">General Settings</h2>

            <form onSubmit={handleUpdateSettings} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-200">
                  Site Title
                </label>
                <Input
                  type="text"
                  value={siteTitle}
                  onChange={(e) => setSiteTitle(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-200">
                  Site Description
                </label>
                <textarea
                  value={siteDescription}
                  onChange={(e) => setSiteDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-md"
                  rows={3}
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Maintenance Mode</h3>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={maintenanceMode}
                    onChange={(e) => setMaintenanceMode(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-slate-200">
                    Enable maintenance mode (users won&apos;t be able to access the platform)
                  </span>
                </label>
                {maintenanceMode && (
                  <p className="text-sm text-yellow-400 bg-yellow-500/10 p-3 rounded border border-yellow-500/20">
                    Maintenance mode is currently enabled. Users will see a maintenance page.
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Settings'
                )}
              </Button>
            </form>
          </Card>

          {/* Sections Management */}
          <Card className="bg-slate-800 border-slate-700 p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Content Sections</h2>
            <p className="text-slate-400 mb-4">
              These sections appear on the homepage to organize content
            </p>

            <div className="space-y-4">
              {sections.map((section) => (
                <div
                  key={section.id}
                  className="bg-slate-700 p-4 rounded-lg flex items-center justify-between"
                >
                  <div>
                    <h3 className="text-white font-semibold">{section.name}</h3>
                    <p className="text-sm text-slate-400">{section.description}</p>
                  </div>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={section.is_active}
                      onChange={(e) =>
                        handleUpdateSection(section.id, { is_active: e.target.checked })
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-slate-200 text-sm">Active</span>
                  </label>
                </div>
              ))}
            </div>
          </Card>
        </main>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

export default function CreatePricingPlan() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price_monthly: '',
    price_annual: '',
    max_concurrent_streams: '1',
    max_quality: '1080p',
    max_downloads_per_day: '0',
    features: {
      ads: false,
      hd: false,
      downloads: false,
      family: false,
    },
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement
      setFormData(prev => ({
        ...prev,
        features: {
          ...prev.features,
          [name]: checkbox.checked,
        },
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const response = await fetch('/api/pricing/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to create pricing plan')
        return
      }

      // Redirect to pricing management
      router.push('/admin/pricing')
    } catch (err) {
      console.error('[v0] Error creating plan:', err)
      setError('Failed to create pricing plan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Create Pricing Plan</h1>
        <p className="text-foreground/60 mt-1">Add a new subscription plan</p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Plan Name *
              </label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Premium, Pro, Family"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Description
              </label>
              <Input
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Plan description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Monthly Price ($)
                </label>
                <Input
                  name="price_monthly"
                  type="number"
                  step="0.01"
                  value={formData.price_monthly}
                  onChange={handleChange}
                  placeholder="9.99"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Annual Price ($)
                </label>
                <Input
                  name="price_annual"
                  type="number"
                  step="0.01"
                  value={formData.price_annual}
                  onChange={handleChange}
                  placeholder="99.99"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Max Concurrent Streams
                </label>
                <Input
                  name="max_concurrent_streams"
                  type="number"
                  value={formData.max_concurrent_streams}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Max Quality
                </label>
                <select
                  name="max_quality"
                  value={formData.max_quality}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground"
                >
                  <option value="480p">480p (SD)</option>
                  <option value="720p">720p (HD)</option>
                  <option value="1080p">1080p (Full HD)</option>
                  <option value="4k">4K (Ultra HD)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Max Downloads Per Day
              </label>
              <Input
                name="max_downloads_per_day"
                type="number"
                value={formData.max_downloads_per_day}
                onChange={handleChange}
                placeholder="0 for unlimited"
              />
            </div>

            <div className="border-t pt-6">
              <label className="block text-sm font-medium text-foreground mb-4">
                Features Included
              </label>
              <div className="space-y-3">
                {Object.entries(formData.features).map(([key, value]) => (
                  <label key={key} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name={key}
                      checked={value}
                      onChange={handleChange}
                      className="w-4 h-4 rounded border-input"
                    />
                    <span className="text-foreground capitalize">{key}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Plan'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

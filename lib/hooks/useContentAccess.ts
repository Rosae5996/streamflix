import { useState, useEffect } from 'react'

interface ContentAccessResponse {
  success: boolean
  hasAccess: boolean
  requiresSubscription: boolean
  accessType: 'free' | 'premium' | 'admin'
  message?: string
  subscription?: {
    planId: string
    expiresAt: string
  }
}

export function useContentAccess(contentId: string | null) {
  const [access, setAccess] = useState<ContentAccessResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!contentId) {
      setAccess(null)
      setLoading(false)
      return
    }

    const checkAccess = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch('/api/videos/access', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contentId }),
        })

        const data = await response.json()

        if (response.ok) {
          setAccess(data)
        } else {
          setError(data.error || 'Failed to check access')
        }
      } catch (err) {
        console.error('[v0] Error checking access:', err)
        setError('Failed to check access')
      } finally {
        setLoading(false)
      }
    }

    checkAccess()
  }, [contentId])

  return { access, loading, error }
}

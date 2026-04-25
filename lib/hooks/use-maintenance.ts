import { useEffect, useState } from 'react'

export function useMaintenance() {
  const [isMaintenance, setIsMaintenance] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkMaintenance = async () => {
      try {
        const response = await fetch('/api/maintenance/status')
        const data = await response.json()
        setIsMaintenance(data.maintenance)
      } catch (error) {
        console.error('Error checking maintenance status:', error)
      } finally {
        setLoading(false)
      }
    }

    checkMaintenance()
    // Check every 30 seconds
    const interval = setInterval(checkMaintenance, 30000)

    return () => clearInterval(interval)
  }, [])

  return { isMaintenance, loading }
}

/**
 * Simple in-memory rate limiter for development
 * In production, use Upstash Redis or similar
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitMap = new Map<string, RateLimitEntry>()

export function checkRateLimit(
  identifier: string,
  limit: number = 10,
  windowMs: number = 60 * 1000 // 1 minute
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const entry = rateLimitMap.get(identifier)

  if (!entry || now > entry.resetTime) {
    // New or expired entry
    const resetTime = now + windowMs
    rateLimitMap.set(identifier, { count: 1, resetTime })
    return { allowed: true, remaining: limit - 1, resetTime }
  }

  if (entry.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
    }
  }

  entry.count++
  return {
    allowed: true,
    remaining: limit - entry.count,
    resetTime: entry.resetTime,
  }
}

/**
 * Cleanup old entries every hour
 */
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(key)
    }
  }
}, 60 * 60 * 1000)

import DOMPurify from 'isomorphic-dompurify'

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHTML(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br', 'p'],
    ALLOWED_ATTR: [],
  })
}

/**
 * Sanitize user input for database storage
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return ''
  
  return input
    .trim()
    .slice(0, 1000) // Limit length
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
}

/**
 * Validate and sanitize email
 */
export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim().slice(0, 254)
}

/**
 * Remove sensitive data from objects before logging/storage
 */
export function removeSensitiveData(obj: any): any {
  if (typeof obj !== 'object' || obj === null) return obj

  const clone = Array.isArray(obj) ? [...obj] : { ...obj }
  const sensitiveKeys = ['password', 'token', 'apiKey', 'secret', 'creditCard', 'ssn']

  for (const key in clone) {
    if (sensitiveKeys.some(k => key.toLowerCase().includes(k.toLowerCase()))) {
      delete clone[key]
    } else if (typeof clone[key] === 'object') {
      clone[key] = removeSensitiveData(clone[key])
    }
  }

  return clone
}

#!/usr/bin/env node

/**
 * Security Health Check Script
 * Verifica que todas las medidas de seguridad estén en su lugar
 */

const fs = require('fs')
const path = require('path')

const checks = [
  {
    name: 'Environment variables configured',
    check: () => {
      const envFile = path.join(__dirname, '../.env.local')
      return fs.existsSync(envFile)
    },
  },
  {
    name: 'Security utilities exist',
    check: () => {
      const files = [
        'lib/security/sanitizer.ts',
        'lib/security/rate-limiter.ts',
        'lib/security/audit-logger.ts',
      ]
      return files.every(f => fs.existsSync(path.join(__dirname, '../', f)))
    },
  },
  {
    name: 'Auth schemas exist',
    check: () => {
      const files = ['lib/schemas/auth.ts', 'lib/schemas/content.ts']
      return files.every(f => fs.existsSync(path.join(__dirname, '../', f)))
    },
  },
  {
    name: 'Middleware configured',
    check: () => {
      const middleware = path.join(__dirname, '../middleware.ts')
      const content = fs.readFileSync(middleware, 'utf8')
      return (
        content.includes('X-Content-Type-Options') &&
        content.includes('Content-Security-Policy')
      )
    },
  },
  {
    name: 'No credentials in repository',
    check: () => {
      const files = [
        'package.json',
        '.gitignore',
        'middleware.ts',
      ]
      return files.every(f => {
        const content = fs.readFileSync(path.join(__dirname, '../', f), 'utf8')
        return !content.includes('PAYPAL_CLIENT_SECRET') &&
               !content.includes('CLOUDFLARE_R2_SECRET')
      })
    },
  },
  {
    name: 'SECURITY.md exists',
    check: () => {
      return fs.existsSync(path.join(__dirname, '../SECURITY.md'))
    },
  },
]

console.log('\n🔒 StreamFlix Security Health Check\n')

let passed = 0
let failed = 0

checks.forEach(({ name, check }) => {
  try {
    const result = check()
    if (result) {
      console.log(`✅ ${name}`)
      passed++
    } else {
      console.log(`❌ ${name}`)
      failed++
    }
  } catch (error) {
    console.log(`⚠️  ${name} (error: ${error.message})`)
    failed++
  }
})

console.log(`\n${passed} passed, ${failed} failed\n`)

if (failed > 0) {
  console.log('⚠️  Some security checks failed. Review SECURITY.md for details.\n')
  process.exit(1)
} else {
  console.log('✅ All security checks passed!\n')
  process.exit(0)
}

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { uploadToR2 } from '@/lib/r2'
import { checkRateLimit } from '@/lib/security/rate-limiter'
import { logAuditEvent, AuditEventType } from '@/lib/security/audit-logger'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 20 uploads per 15 minutes per user
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('cf-connecting-ip') || 'unknown'
    const rateLimitKey = `upload:${ipAddress}`
    const { allowed, remaining } = checkRateLimit(rateLimitKey, 20, 15 * 60 * 1000)

    if (!allowed) {
      await logAuditEvent(AuditEventType.FAILED_AUTH, {
        status: 'failure',
        errorMessage: 'Rate limit exceeded for file upload',
        ipAddress,
      })
      return NextResponse.json(
        { error: 'Too many uploads. Try again later.' },
        { status: 429, headers: { 'Retry-After': '900' } }
      )
    }

    // Verify admin user
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll() {},
        },
      }
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      await logAuditEvent(AuditEventType.UNAUTHORIZED_ACCESS, {
        status: 'failure',
        errorMessage: 'Unauthorized upload attempt',
        ipAddress,
      })
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userData?.role !== 'admin') {
      await logAuditEvent(AuditEventType.UNAUTHORIZED_ACCESS, {
        userId: user.id,
        status: 'failure',
        errorMessage: 'Non-admin attempted file upload',
        ipAddress,
      })
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Get form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const fileType = formData.get('type') as string // 'thumbnail', 'video', or 'trailer'

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes: Record<string, string[]> = {
      thumbnail: ['image/jpeg', 'image/png', 'image/webp'],
      video: ['video/mp4', 'video/webm', 'video/quicktime'],
      trailer: ['video/mp4', 'video/webm'],
    }

    if (!fileType || !allowedTypes[fileType]) {
      return NextResponse.json(
        { error: 'Invalid file type parameter' },
        { status: 400 }
      )
    }

    if (!allowedTypes[fileType].includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file format. Allowed: ${allowedTypes[fileType].join(', ')}` },
        { status: 400 }
      )
    }

    // Validate file size (100MB max for videos, 10MB for images)
    const maxSize = fileType === 'thumbnail' ? 10 * 1024 * 1024 : 100 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large. Max size: ${maxSize / 1024 / 1024}MB` },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Upload to R2
    const url = await uploadToR2(
      buffer,
      file.name,
      file.type,
      fileType
    )

    // Log successful upload
    await logAuditEvent(AuditEventType.FILE_UPLOADED, {
      userId: user.id,
      status: 'success',
      metadata: {
        fileType,
        fileName: file.name,
        fileSize: file.size,
        contentType: file.type,
      },
    })

    return NextResponse.json({ url })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    )
  }
}

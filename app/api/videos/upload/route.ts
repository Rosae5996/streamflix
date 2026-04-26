import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { uploadToR2 } from '@/lib/r2'
import { checkRateLimit } from '@/lib/security/rate-limiter'
import { logAuditEvent, AuditEventType } from '@/lib/security/audit-logger'

// Maximum file sizes (in bytes)
const MAX_FILE_SIZES = {
  thumbnail: 5 * 1024 * 1024, // 5MB
  trailer: 500 * 1024 * 1024, // 500MB
  video: 5 * 1024 * 1024 * 1024, // 5GB
}

// Allowed MIME types
const ALLOWED_MIME_TYPES = {
  thumbnail: ['image/jpeg', 'image/png', 'image/webp'],
  trailer: ['video/mp4', 'video/webm', 'video/quicktime'],
  video: ['video/mp4', 'video/webm', 'video/quicktime', 'application/x-matroska'],
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 10 video uploads per hour per admin
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('cf-connecting-ip') || 'unknown'
    const rateLimitKey = `video_upload:${ipAddress}`
    const { allowed, remaining } = checkRateLimit(rateLimitKey, 10, 60 * 60 * 1000)

    if (!allowed) {
      await logAuditEvent(AuditEventType.FAILED_AUTH, {
        status: 'failure',
        errorMessage: 'Rate limit exceeded for video upload',
        ipAddress,
      })
      return NextResponse.json(
        { error: 'Too many uploads. Please try again later.' },
        { status: 429, headers: { 'Retry-After': '3600' } }
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
        errorMessage: 'Unauthorized video upload attempt',
        ipAddress,
      })
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: userData } = await supabase
      .from('users')
      .select('role, id')
      .eq('id', user.id)
      .single()

    if (userData?.role !== 'admin') {
      await logAuditEvent(AuditEventType.UNAUTHORIZED_ACCESS, {
        userId: user.id,
        status: 'failure',
        errorMessage: 'Non-admin attempted video upload',
        ipAddress,
      })
      return NextResponse.json({ error: 'Only admins can upload videos' }, { status: 403 })
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const fileType = formData.get('type') as string // 'thumbnail', 'video', or 'trailer'
    const contentId = formData.get('contentId') as string // Optional: if updating existing content
    const quality = formData.get('quality') as string // Video quality: '480p', '720p', '1080p', '4k'

    // Validate required fields
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!fileType || !ALLOWED_MIME_TYPES[fileType as keyof typeof ALLOWED_MIME_TYPES]) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed types: thumbnail, video, trailer' },
        { status: 400 }
      )
    }

    // Validate file MIME type
    const mimeType = fileType as keyof typeof ALLOWED_MIME_TYPES
    if (!ALLOWED_MIME_TYPES[mimeType].includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file format. Allowed: ${ALLOWED_MIME_TYPES[mimeType].join(', ')}` },
        { status: 400 }
      )
    }

    // Validate file size
    const maxSize = MAX_FILE_SIZES[fileType as keyof typeof MAX_FILE_SIZES]
    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024)
      return NextResponse.json(
        { error: `File too large. Maximum size: ${maxSizeMB}MB` },
        { status: 413 }
      )
    }

    // Create unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExtension = file.name.split('.').pop() || fileType
    const filename = `${fileType}/${quality || 'original'}/${timestamp}-${randomString}.${fileExtension}`

    // Upload to R2
    const buffer = await file.arrayBuffer()
    const r2Url = await uploadToR2(Buffer.from(buffer), filename, file.type)

    // If this is for an existing content, update it
    if (contentId) {
      const updateData: Record<string, string> = {}
      
      if (fileType === 'video') {
        updateData.video_url = r2Url
      } else if (fileType === 'thumbnail') {
        updateData.thumbnail_url = r2Url
      } else if (fileType === 'trailer') {
        updateData.trailer_url = r2Url
      }

      if (quality && fileType === 'video') {
        updateData.primary_quality = quality
      }

      const { error: updateError } = await supabase
        .from('content')
        .update(updateData)
        .eq('id', contentId)

      if (updateError) {
        await logAuditEvent(AuditEventType.FAILED_AUTH, {
          userId: user.id,
          contentId,
          status: 'failure',
          errorMessage: `Failed to update content: ${updateError.message}`,
          ipAddress,
        })
        return NextResponse.json({ error: 'Failed to update content' }, { status: 500 })
      }
    }

    // Log successful upload
    await logAuditEvent(AuditEventType.CONTENT_CREATED, {
      userId: user.id,
      fileType,
      fileSize: file.size,
      quality: quality || 'original',
      r2Url,
      contentId: contentId || null,
      ipAddress,
    })

    return NextResponse.json({
      success: true,
      url: r2Url,
      filename,
      fileType,
      quality: quality || 'original',
      fileSize: file.size,
      message: `${fileType} uploaded successfully`,
    })
  } catch (error) {
    console.error('[v0] Video upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload video' },
      { status: 500 }
    )
  }
}

// GET: Retrieve upload progress or list uploaded files (optional)
export async function GET(request: NextRequest) {
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
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userData?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Return allowed file types and sizes
  return NextResponse.json({
    allowedTypes: {
      thumbnail: {
        mimeTypes: ALLOWED_MIME_TYPES.thumbnail,
        maxSizeMB: MAX_FILE_SIZES.thumbnail / (1024 * 1024),
      },
      trailer: {
        mimeTypes: ALLOWED_MIME_TYPES.trailer,
        maxSizeMB: MAX_FILE_SIZES.trailer / (1024 * 1024),
      },
      video: {
        mimeTypes: ALLOWED_MIME_TYPES.video,
        maxSizeMB: MAX_FILE_SIZES.video / (1024 * 1024),
      },
    },
    qualities: ['480p', '720p', '1080p', '4k'],
  })
}

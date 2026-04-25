import { z } from 'zod'

export const contentFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(2000).optional(),
  type: z.enum(['movie', 'series'], { errorMap: () => ({ message: 'Type must be movie or series' }) }),
  genre: z.array(z.string()).min(1, 'At least one genre is required').max(5),
  rating: z.number().min(0).max(10).optional(),
  duration_minutes: z.number().int().positive().optional(),
  release_year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
  director: z.string().max(200).optional(),
  cast_list: z.array(z.string().max(100)).max(10).optional(),
  thumbnail_url: z.string().url('Invalid thumbnail URL').optional(),
  video_url: z.string().url('Invalid video URL').optional(),
  trailer_url: z.string().url('Invalid trailer URL').optional(),
  section_category: z.string().max(100).optional(),
  is_published: z.boolean().default(false),
})

export type ContentFormInput = z.infer<typeof contentFormSchema>

export const uploadFileSchema = z.object({
  type: z.enum(['thumbnail', 'video', 'trailer']),
  file: z.instanceof(File)
    .refine((file) => file.size <= 500 * 1024 * 1024, 'File size must be less than 500MB')
    .refine(
      (file) => {
        const validImageTypes = ['image/jpeg', 'image/png', 'image/webp']
        const validVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime']
        const isImage = validImageTypes.includes(file.type)
        const isVideo = validVideoTypes.includes(file.type)
        return isImage || isVideo
      },
      'Invalid file type. Only images (JPEG, PNG, WebP) and videos (MP4, WebM, MOV) are allowed'
    ),
})

export type UploadFileInput = z.infer<typeof uploadFileSchema>

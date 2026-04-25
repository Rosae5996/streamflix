'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Header } from '@/components/layout/header'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Loader2 } from 'lucide-react'

interface ContentFormProps {
  initialData?: any
  isEdit?: boolean
}

export function ContentForm({ initialData, isEdit = false }: ContentFormProps) {
  const [title, setTitle] = useState(initialData?.title || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [type, setType] = useState(initialData?.type || 'movie')
  const [genre, setGenre] = useState((initialData?.genre || []).join(', '))
  const [rating, setRating] = useState(initialData?.rating || '')
  const [durationMinutes, setDurationMinutes] = useState(initialData?.duration_minutes || '')
  const [releaseYear, setReleaseYear] = useState(initialData?.release_year || new Date().getFullYear())
  const [director, setDirector] = useState(initialData?.director || '')
  const [castList, setCastList] = useState((initialData?.cast_list || []).join(', '))
  const [thumbnailUrl, setThumbnailUrl] = useState(initialData?.thumbnail_url || '')
  const [videoUrl, setVideoUrl] = useState(initialData?.video_url || '')
  const [trailerUrl, setTrailerUrl] = useState(initialData?.trailer_url || '')
  const [isPublished, setIsPublished] = useState(initialData?.is_published || false)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()
  const supabase = createClient()

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    type: 'thumbnail' | 'video' | 'trailer'
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(type)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Upload failed')
      }

      const { url } = await response.json()

      // Set the appropriate URL
      switch (type) {
        case 'thumbnail':
          setThumbnailUrl(url)
          break
        case 'video':
          setVideoUrl(url)
          break
        case 'trailer':
          setTrailerUrl(url)
          break
      }

      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const contentData = {
        title,
        description,
        type,
        genre: genre.split(',').map(g => g.trim()).filter(Boolean),
        rating: rating ? parseFloat(rating) : null,
        duration_minutes: durationMinutes ? parseInt(durationMinutes) : null,
        release_year: parseInt(String(releaseYear)),
        director,
        cast_list: castList.split(',').map(c => c.trim()).filter(Boolean),
        thumbnail_url: thumbnailUrl,
        video_url: videoUrl,
        trailer_url: trailerUrl,
        is_published: isPublished,
      }

      if (isEdit && initialData?.id) {
        const { error: updateError } = await supabase
          .from('content')
          .update(contentData)
          .eq('id', initialData.id)

        if (updateError) {
          setError(updateError.message)
        } else {
          router.push('/admin/content')
        }
      } else {
        const { error: insertError } = await supabase
          .from('content')
          .insert([contentData])

        if (insertError) {
          setError(insertError.message)
        } else {
          router.push('/admin/content')
        }
      }
    } catch (err) {
      setError('An unexpected error occurred')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950">
      <Header />

      <div className="flex">
        <AdminSidebar />

        <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
          <Link href="/admin/content">
            <Button variant="ghost" className="mb-6 text-slate-400 hover:text-white">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Content
            </Button>
          </Link>

          <Card className="bg-slate-800 border-slate-700 p-8">
            <h1 className="text-3xl font-bold text-white mb-6">
              {isEdit ? 'Edit Content' : 'Add New Content'}
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg">
                  {error}
                </div>
              )}

              {/* Basic Info */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-white">Basic Information</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-200">Title *</label>
                    <Input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="Enter content title"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-200">Type *</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-md"
                    >
                      <option value="movie">Movie</option>
                      <option value="series">Series</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-200">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-md"
                    placeholder="Enter content description"
                    rows={4}
                  />
                </div>
              </div>

              {/* Details */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-white">Details</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-200">Genres (comma-separated)</label>
                    <Input
                      type="text"
                      value={genre}
                      onChange={(e) => setGenre(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="e.g., Action, Drama, Sci-Fi"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-200">Rating (0-10)</label>
                    <Input
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      value={rating}
                      onChange={(e) => setRating(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="e.g., 8.5"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-200">Duration (minutes)</label>
                    <Input
                      type="number"
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="e.g., 120"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-200">Release Year</label>
                    <Input
                      type="number"
                      value={releaseYear}
                      onChange={(e) => setReleaseYear(parseInt(e.target.value))}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-200">Director</label>
                    <Input
                      type="text"
                      value={director}
                      onChange={(e) => setDirector(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="e.g., Christopher Nolan"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-200">Cast (comma-separated)</label>
                    <Input
                      type="text"
                      value={castList}
                      onChange={(e) => setCastList(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="e.g., Leonardo DiCaprio, Tom Hardy"
                    />
                  </div>
                </div>
              </div>

              {/* URLs */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-white">Media</h2>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-200">Thumbnail</label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        value={thumbnailUrl}
                        onChange={(e) => setThumbnailUrl(e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white flex-1"
                        placeholder="https://example.com/thumbnail.jpg"
                      />
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, 'thumbnail')}
                          disabled={uploading === 'thumbnail'}
                          className="hidden"
                        />
                        <button
                          type="button"
                          disabled={uploading === 'thumbnail'}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50"
                          onClick={(e) => {
                            const input = e.currentTarget.previousElementSibling as HTMLInputElement
                            input.click()
                          }}
                        >
                          {uploading === 'thumbnail' ? 'Uploading...' : 'Upload'}
                        </button>
                      </label>
                    </div>
                    {thumbnailUrl && (
                      <p className="text-xs text-green-400">✓ Thumbnail uploaded</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-200">Video</label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white flex-1"
                        placeholder="https://example.com/video.mp4"
                      />
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="video/*"
                          onChange={(e) => handleFileUpload(e, 'video')}
                          disabled={uploading === 'video'}
                          className="hidden"
                        />
                        <button
                          type="button"
                          disabled={uploading === 'video'}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50"
                          onClick={(e) => {
                            const input = e.currentTarget.previousElementSibling as HTMLInputElement
                            input.click()
                          }}
                        >
                          {uploading === 'video' ? 'Uploading...' : 'Upload'}
                        </button>
                      </label>
                    </div>
                    {videoUrl && (
                      <p className="text-xs text-green-400">✓ Video uploaded</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-200">Trailer</label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        value={trailerUrl}
                        onChange={(e) => setTrailerUrl(e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white flex-1"
                        placeholder="https://example.com/trailer.mp4"
                      />
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="video/*"
                          onChange={(e) => handleFileUpload(e, 'trailer')}
                          disabled={uploading === 'trailer'}
                          className="hidden"
                        />
                        <button
                          type="button"
                          disabled={uploading === 'trailer'}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50"
                          onClick={(e) => {
                            const input = e.currentTarget.previousElementSibling as HTMLInputElement
                            input.click()
                          }}
                        >
                          {uploading === 'trailer' ? 'Uploading...' : 'Upload'}
                        </button>
                      </label>
                    </div>
                    {trailerUrl && (
                      <p className="text-xs text-green-400">✓ Trailer uploaded</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Publish */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-white">Publish</h2>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-slate-200">Publish this content immediately</span>
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isEdit ? 'Updating...' : 'Creating...'}
                    </>
                  ) : isEdit ? (
                    'Update Content'
                  ) : (
                    'Create Content'
                  )}
                </Button>

                <Link href="/admin/content">
                  <Button variant="outline" className="border-slate-600 text-slate-200">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </Card>
        </main>
      </div>
    </div>
  )
}

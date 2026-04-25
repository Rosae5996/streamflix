'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Play, Heart, Share2, ArrowLeft, Loader2 } from 'lucide-react'

interface ContentDetailProps {
  content: any
  user: any
}

export function ContentDetail({ content, user }: ContentDetailProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [addingFavorite, setAddingFavorite] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const handleToggleFavorite = async () => {
    setAddingFavorite(true)
    try {
      if (isFavorite) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('content_id', content.id)
      } else {
        await supabase
          .from('favorites')
          .insert([{ user_id: user.id, content_id: content.id }])
      }
      setIsFavorite(!isFavorite)
    } catch (err) {
      console.error(err)
    } finally {
      setAddingFavorite(false)
    }
  }

  const handlePlay = () => {
    // In a real app, this would open a video player
    alert('Video player would open here. Video URL: ' + content.video_url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950">
      <Header />

      <main className="container mx-auto px-4 py-8 space-y-8">
        <Link href="/browse">
          <Button variant="ghost" className="text-slate-400 hover:text-white">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Browse
          </Button>
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Thumbnail */}
          <div className="md:col-span-1">
            <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-slate-800">
              {content.thumbnail_url && (
                <Image
                  src={content.thumbnail_url}
                  alt={content.title}
                  fill
                  className="object-cover"
                />
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition flex items-center justify-center">
                <button
                  onClick={handlePlay}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 transition"
                >
                  <Play className="h-8 w-8 fill-current" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 mt-4">
              <Button
                onClick={handlePlay}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12"
              >
                <Play className="mr-2 h-5 w-5 fill-current" />
                Play
              </Button>

              <Button
                onClick={handleToggleFavorite}
                disabled={addingFavorite}
                variant="outline"
                className="w-full border-slate-600 text-slate-200 hover:bg-slate-700"
              >
                {addingFavorite ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <Heart className={`mr-2 h-5 w-5 ${isFavorite ? 'fill-current text-red-500' : ''}`} />
                    {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                className="w-full border-slate-600 text-slate-200 hover:bg-slate-700"
              >
                <Share2 className="mr-2 h-5 w-5" />
                Share
              </Button>
            </div>
          </div>

          {/* Details */}
          <div className="md:col-span-2 space-y-6">
            <div className="space-y-4">
              <h1 className="text-5xl font-bold text-white text-balance">{content.title}</h1>

              <div className="flex items-center flex-wrap gap-3">
                <Badge className="bg-blue-600">
                  {content.type === 'movie' ? 'Movie' : 'Series'}
                </Badge>

                {content.release_year && (
                  <span className="text-slate-400">{content.release_year}</span>
                )}

                {content.rating && (
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-400">★</span>
                    <span className="text-white font-semibold">{content.rating}</span>
                  </div>
                )}

                {content.duration_minutes && (
                  <span className="text-slate-400">
                    {Math.floor(content.duration_minutes / 60)}h{' '}
                    {content.duration_minutes % 60}m
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            {content.description && (
              <Card className="bg-slate-800/50 border-slate-700 p-6">
                <h2 className="text-lg font-semibold text-white mb-3">Overview</h2>
                <p className="text-slate-300 leading-relaxed">{content.description}</p>
              </Card>
            )}

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {content.director && (
                <div className="bg-slate-800/50 p-4 rounded-lg">
                  <p className="text-slate-400 text-sm">Director</p>
                  <p className="text-white font-semibold">{content.director}</p>
                </div>
              )}

              {content.genre && content.genre.length > 0 && (
                <div className="bg-slate-800/50 p-4 rounded-lg">
                  <p className="text-slate-400 text-sm">Genres</p>
                  <p className="text-white font-semibold">{content.genre.join(', ')}</p>
                </div>
              )}

              {content.cast_list && content.cast_list.length > 0 && (
                <div className="bg-slate-800/50 p-4 rounded-lg md:col-span-2">
                  <p className="text-slate-400 text-sm">Cast</p>
                  <p className="text-white font-semibold">{content.cast_list.join(', ')}</p>
                </div>
              )}
            </div>

            {/* Trailer */}
            {content.trailer_url && (
              <Card className="bg-slate-800/50 border-slate-700 p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Trailer</h2>
                <div className="aspect-video bg-slate-900 rounded-lg overflow-hidden">
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${extractYouTubeId(content.trailer_url)}`}
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

function extractYouTubeId(url: string): string {
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/
  const match = url.match(regex)
  return match ? match[1] : ''
}

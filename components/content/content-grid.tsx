'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Play } from 'lucide-react'

interface ContentGridProps {
  content: any[]
}

export function ContentGrid({ content }: ContentGridProps) {
  if (!content || content.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-400">No content available</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {content.map((item) => (
        <Link key={item.id} href={`/content/${item.id}`}>
          <Card className="overflow-hidden bg-slate-800 border-slate-700 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer group">
            <div className="relative aspect-[2/3] bg-slate-700">
              {item.thumbnail_url && (
                <Image
                  src={item.thumbnail_url}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform"
                />
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                <Play className="h-12 w-12 text-white fill-white" />
              </div>
            </div>
            <div className="p-3">
              <h3 className="font-semibold text-white text-sm line-clamp-2">
                {item.title}
              </h3>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className="text-xs">
                  {item.type === 'movie' ? 'Movie' : 'Series'}
                </Badge>
                {item.rating && (
                  <span className="text-xs text-slate-400">
                    ★ {item.rating}
                  </span>
                )}
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  )
}

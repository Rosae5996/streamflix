'use client'

import Image from 'next/image'
import { Play, Plus, ThumbsUp } from 'lucide-react'
import { useState } from 'react'

interface NetflixCardProps {
  id: string
  title: string
  thumbnail?: string
  duration?: number
  rating?: number
  isNew?: boolean
  isWatching?: boolean
  onClick?: () => void
}

export function NetflixCard({
  id,
  title,
  thumbnail,
  duration,
  rating,
  isNew,
  isWatching,
  onClick,
}: NetflixCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden group cursor-pointer transition-transform duration-200 hover:scale-105 hover:z-10"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Thumbnail */}
      {thumbnail ? (
        <Image
          src={thumbnail}
          alt={title}
          fill
          className="object-cover w-full h-full"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-600 mb-2">
              {title.charAt(0)}
            </div>
            <p className="text-gray-500 text-sm">{title}</p>
          </div>
        </div>
      )}

      {/* Overlay on Hover */}
      {isHovered && (
        <div className="absolute inset-0 bg-black/60 flex flex-col justify-end p-4 animate-in fade-in duration-200">
          <h3 className="text-white font-bold text-lg mb-2 line-clamp-2">{title}</h3>
          
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition">
                <Play className="h-5 w-5 text-black fill-black" />
              </button>
              <button className="w-10 h-10 border border-gray-400 rounded-full flex items-center justify-center hover:border-white transition">
                <Plus className="h-5 w-5 text-white" />
              </button>
              <button className="w-10 h-10 border border-gray-400 rounded-full flex items-center justify-center hover:border-white transition">
                <ThumbsUp className="h-5 w-5 text-white" />
              </button>
            </div>
            {rating && (
              <span className="text-white font-bold text-sm">{rating}%</span>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-gray-300">
            <span>
              {duration && `${Math.floor(duration / 60)}h ${duration % 60}m`}
            </span>
            {isNew && <span className="text-red-500 font-bold">NEW</span>}
          </div>
        </div>
      )}

      {/* Watching indicator */}
      {isWatching && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-600" />
      )}
    </div>
  )
}

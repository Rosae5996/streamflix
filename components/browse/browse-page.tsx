'use client'

import { useState, useMemo } from 'react'
import { Header } from '@/components/layout/header'
import { ContentGrid } from '@/components/content/content-grid'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Search } from 'lucide-react'

interface BrowsePageProps {
  initialContent: any[]
  sections: any[]
}

export function BrowsePage({ initialContent, sections }: BrowsePageProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<'all' | 'movie' | 'series'>('all')
  const [selectedGenre, setSelectedGenre] = useState<string>('all')

  // Extract unique genres
  const genres = useMemo(() => {
    const genreSet = new Set<string>()
    initialContent.forEach(item => {
      if (item.genre && Array.isArray(item.genre)) {
        item.genre.forEach(g => genreSet.add(g))
      }
    })
    return Array.from(genreSet).sort()
  }, [initialContent])

  // Filter content
  const filteredContent = useMemo(() => {
    return initialContent.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesType = selectedType === 'all' || item.type === selectedType
      const matchesGenre = selectedGenre === 'all' || (item.genre && Array.isArray(item.genre) && item.genre.includes(selectedGenre))

      return matchesSearch && matchesType && matchesGenre
    })
  }, [initialContent, searchQuery, selectedType, selectedGenre])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950">
      <Header />

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-white">Browse Content</h1>
          <p className="text-slate-400">
            Explore our collection of {initialContent.length} movies and series
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="bg-slate-800 border-slate-700 p-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Search movies and series..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-200">Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as 'all' | 'movie' | 'series')}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-md"
              >
                <option value="all">All</option>
                <option value="movie">Movies</option>
                <option value="series">Series</option>
              </select>
            </div>

            {genres.length > 0 && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-200">Genre</label>
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-md"
                >
                  <option value="all">All Genres</option>
                  {genres.map(genre => (
                    <option key={genre} value={genre}>
                      {genre}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <p className="text-sm text-slate-400">
            {filteredContent.length} result{filteredContent.length !== 1 ? 's' : ''}
          </p>
        </Card>

        {/* Content Grid */}
        {filteredContent.length > 0 ? (
          <ContentGrid content={filteredContent} />
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-400 mb-4">No content found matching your filters</p>
            <button
              onClick={() => {
                setSearchQuery('')
                setSelectedType('all')
                setSelectedGenre('all')
              }}
              className="text-blue-400 hover:text-blue-300"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Sections */}
        {sections.length > 0 && (
          <div className="space-y-8 pt-8">
            {sections.map(section => {
              const sectionContent = initialContent.filter(item =>
                item.section_category === section.slug
              )

              if (sectionContent.length === 0) return null

              return (
                <section key={section.id} className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{section.name}</h2>
                    {section.description && (
                      <p className="text-slate-400">{section.description}</p>
                    )}
                  </div>
                  <ContentGrid content={sectionContent} />
                </section>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}

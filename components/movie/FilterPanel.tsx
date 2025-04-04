'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Session } from '@/types/database'

interface FilterPanelProps {
  sessionId: string
  initialFilters: Session['filters']
}

export function FilterPanel({ sessionId, initialFilters }: FilterPanelProps) {
  const [filters, setFilters] = useState(initialFilters)
  const [showMoreGenres, setShowMoreGenres] = useState(false)

  const updateFilters = async (newFilters: Session['filters']) => {
    const { error } = await supabase
      .from('sessions')
      .update({ filters: newFilters })
      .eq('id', sessionId)

    if (!error) {
      setFilters(newFilters)
    }
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Movie Filters</h3>
      
      {/* Genres */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Genres</label>
        {/* Common Genres */}
        <div className="flex flex-wrap gap-2 mb-2">
          {['Adventure', 'Animation', 'Comedy', 'Family', 'Fantasy', 'Playlist'].map((genre) => (
            <button
              key={genre}
              className={`px-3 py-1 rounded-full text-sm ${
                filters.genres?.includes(genre)
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
              onClick={() => {
                const newGenres = filters.genres?.includes(genre)
                  ? filters.genres.filter((g) => g !== genre)
                  : [...(filters.genres || []), genre]
                updateFilters({ ...filters, genres: newGenres })
              }}
            >
              {genre}
            </button>
          ))}
        </div>

        {/* More Genres Accordion */}
        <div className="mt-2">
          <button
            onClick={() => setShowMoreGenres(!showMoreGenres)}
            className="flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            <span>{showMoreGenres ? 'Hide' : 'More'} Genres</span>
            <svg 
              className={`w-4 h-4 ml-1 transform transition-transform ${showMoreGenres ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showMoreGenres && (
            <div className="flex flex-wrap gap-2 mt-2">
              {['Action', 'Crime', 'Documentary', 'Drama', 'History', 'Horror', 'Music', 'Mystery', 'Romance', 'Science Fiction', 'Thriller', 'War', 'Western'].map((genre) => (
                <button
                  key={genre}
                  className={`px-3 py-1 rounded-full text-sm ${
                    filters.genres?.includes(genre)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                  onClick={() => {
                    const newGenres = filters.genres?.includes(genre)
                      ? filters.genres.filter((g) => g !== genre)
                      : [...(filters.genres || []), genre]
                    updateFilters({ ...filters, genres: newGenres })
                  }}
                >
                  {genre}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Year Range */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Release Year</label>
        <div className="flex gap-4">
          <input
            type="number"
            placeholder="From"
            className="w-24 px-2 py-1 border rounded"
            value={filters.year_start || ''}
            onChange={(e) =>
              updateFilters({
                ...filters,
                year_start: e.target.value ? parseInt(e.target.value) : null,
              })
            }
          />
          <input
            type="number"
            placeholder="To"
            className="w-24 px-2 py-1 border rounded"
            value={filters.year_end || ''}
            onChange={(e) =>
              updateFilters({
                ...filters,
                year_end: e.target.value ? parseInt(e.target.value) : null,
              })
            }
          />
        </div>
      </div>

      {/* Minimum Rating */}
      <div>
        <label className="block text-sm font-medium mb-2">Minimum Rating</label>
        <input
          type="range"
          min="0"
          max="10"
          step="0.5"
          className="w-full"
          value={filters.min_rating || 0}
          onChange={(e) =>
            updateFilters({
              ...filters,
              min_rating: parseFloat(e.target.value),
            })
          }
        />
        <div className="text-sm text-gray-600">
          {filters.min_rating || 0} / 10
        </div>
      </div>
    </div>
  )
}

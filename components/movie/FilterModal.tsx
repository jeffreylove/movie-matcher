'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Modal from '@/components/common/Modal'
import type { Session } from '@/types/database'
import { Slider } from '@/components/common/Slider'

// Define MPAA ratings
const MPAA_RATINGS = ['G', 'PG', 'PG-13', 'R', 'NC-17']

// Define common and all genres
const COMMON_GENRES = [
  'Adventure', 'Animation', 'Comedy', 'Family', 'Fantasy', 'Playlist'
]

const OTHER_GENRES = [
  'Action', 'Crime', 'Documentary', 'Drama', 'History',
  'Horror', 'Music', 'Mystery', 'Romance', 'Science Fiction',
  'Thriller', 'War', 'Western'
]

// Combined list of all genres
const ALL_GENRES = [...COMMON_GENRES, ...OTHER_GENRES]

interface FilterModalProps {
  isOpen: boolean
  onClose: () => void
  sessionId: string
  initialFilters?: Session['filters']
  isInitialSetup?: boolean
}

export function FilterModal({ 
  isOpen, 
  onClose, 
  sessionId, 
  initialFilters,
  isInitialSetup = false
}: FilterModalProps) {
  // Default filters
  const defaultFilters: Session['filters'] = {
    genres: [],
    year_start: 1980,
    year_end: new Date().getFullYear(),
    streaming_services: [],
    min_rating: 7.0,
    mpaa_ratings: ['PG', 'PG-13']
  }

  const [filters, setFilters] = useState<Session['filters']>(initialFilters || defaultFilters)
  const [showMoreGenres, setShowMoreGenres] = useState(false)
  const [yearRange, setYearRange] = useState<[number, number]>([
    filters.year_start || 1980, 
    filters.year_end || new Date().getFullYear()
  ])
  const [saving, setSaving] = useState(false)

  // Update filters when initialFilters prop changes
  useEffect(() => {
    if (initialFilters) {
      setFilters(initialFilters)
      setYearRange([
        initialFilters.year_start || 1980, 
        initialFilters.year_end || new Date().getFullYear()
      ])
    }
  }, [initialFilters])

  const handleGenreToggle = (genre: string) => {
    const newGenres = filters.genres?.includes(genre)
      ? filters.genres.filter(g => g !== genre)
      : [...(filters.genres || []), genre]
    
    setFilters({ ...filters, genres: newGenres })
  }

  const handleMpaaToggle = (rating: string) => {
    const currentRatings = filters.mpaa_ratings || []
    const newRatings = currentRatings.includes(rating)
      ? currentRatings.filter(r => r !== rating)
      : [...currentRatings, rating]
    
    setFilters({ ...filters, mpaa_ratings: newRatings })
  }

  const handleRtRatingChange = (value: number | [number, number]) => {
    setFilters({ ...filters, min_rating: value as number })
  }

  const handleYearRangeChange = (value: number | [number, number]) => {
    const values = value as [number, number]
    setYearRange(values)
    setFilters({
      ...filters,
      year_start: values[0],
      year_end: values[1]
    })
  }

  const saveFilters = async () => {
    setSaving(true)
    console.log('Saving filters:', JSON.stringify(filters, null, 2))
    console.log('Session ID:', sessionId)
    
    try {
      const { error } = await supabase
        .from('sessions')
        .update({ filters })
        .eq('id', sessionId)

      if (error) {
        console.error('Error saving filters:', error)
        throw error
      }
      
      console.log('✅ Filters saved successfully! Closing modal and triggering filterVersion update')
      onClose()
    } catch (error) {
      console.error('Failed to save filters:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={isInitialSetup ? () => onClose() : onClose}>
      <div className="w-full max-w-2xl">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          {isInitialSetup 
            ? "What kind of movies would you like to include?" 
            : "Filter Movies"}
        </h2>

        <div className="space-y-6">
          {/* Year Range Slider */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Release Years</h3>
            <div className="px-4">
              <Slider 
                min={1920}
                max={new Date().getFullYear()}
                value={yearRange}
                onChange={handleYearRangeChange}
                range
              />
              <div className="flex justify-between mt-2 text-sm text-gray-600 dark:text-gray-400">
                <span>{yearRange[0]}</span>
                <span>{yearRange[1]}</span>
              </div>
            </div>
          </div>

          {/* Genres */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Genres</h3>
            
            {/* Common Genres */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
              {COMMON_GENRES.map(genre => (
                <label 
                  key={genre}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5 text-purple-600 rounded focus:ring-purple-500"
                    checked={filters.genres?.includes(genre) || false}
                    onChange={() => handleGenreToggle(genre)}
                  />
                  <span className="text-gray-700 dark:text-gray-300">{genre}</span>
                </label>
              ))}
            </div>
            
            {/* Other Genres Accordion */}
            <div className="border rounded-lg overflow-hidden">
              <button 
                onClick={() => setShowMoreGenres(!showMoreGenres)}
                className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <span className="font-medium">More Genres</span>
                <svg 
                  className={`w-5 h-5 transform transition-transform ${showMoreGenres ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showMoreGenres && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3">
                  {OTHER_GENRES.map(genre => (
                    <label 
                      key={genre}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        className="form-checkbox h-5 w-5 text-purple-600 rounded focus:ring-purple-500"
                        checked={filters.genres?.includes(genre) || false}
                        onChange={() => handleGenreToggle(genre)}
                      />
                      <span className="text-gray-700 dark:text-gray-300">{genre}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* MPAA Ratings */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">MPAA Ratings</h3>
            <div className="flex flex-wrap gap-4">
              {MPAA_RATINGS.map(rating => (
                <label 
                  key={rating}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5 text-purple-600 rounded focus:ring-purple-500"
                    checked={(filters.mpaa_ratings || []).includes(rating)}
                    onChange={() => handleMpaaToggle(rating)}
                  />
                  <span className="text-gray-700 dark:text-gray-300">{rating}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Rotten Tomatoes Rating */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Minimum Rotten Tomatoes Rating
            </h3>
            <div className="px-4">
              <Slider 
                min={0}
                max={10}
                step={0.5}
                value={filters.min_rating || 0}
                onChange={handleRtRatingChange}
              />
              <div className="flex justify-between mt-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">0</span>
                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  {filters.min_rating?.toFixed(1) || '0.0'} / 10
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">10</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4 mt-8">
            {!isInitialSetup && (
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
              >
                Cancel
              </button>
            )}
            <button
              type="button"
              onClick={saveFilters}
              disabled={saving}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors duration-200 disabled:opacity-70"
            >
              {saving ? 'Saving...' : isInitialSetup ? 'Start Matching' : 'Apply Filters'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

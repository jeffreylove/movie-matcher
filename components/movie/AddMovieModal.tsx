'use client'

import { useState } from 'react'
import Modal from '../common/Modal'
import { OmdbMovie, searchMovieByTitle, convertOmdbToMovieFormat, addMovieToDatabase } from '@/lib/services/omdbService'
import { Movie } from '@/types/database'

interface AddMovieModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AddMovieModal({ isOpen, onClose }: AddMovieModalProps) {
  const [title, setTitle] = useState('')
  const [year, setYear] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [foundMovie, setFoundMovie] = useState<OmdbMovie | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [addToPlaylist, setAddToPlaylist] = useState(false)
  
  // Define a type for the addResult state that includes the duplicate property
  type AddResult = {
    success: boolean;
    message: string;
    id?: string;
    duplicate?: boolean;
    canAddToPlaylist?: boolean;
    alreadyInPlaylist?: boolean;
  }
  
  const [addResult, setAddResult] = useState<AddResult | undefined>()

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim()) {
      setSearchError('Please enter a movie title')
      return
    }
    
    setIsSearching(true)
    setSearchError('')
    setFoundMovie(null)
    setAddResult(undefined)
    
    try {
      // Direct API call for debugging
      const apiKey = process.env.NEXT_PUBLIC_OMDB_API_KEY || ''
      console.log('OMDB API Key:', apiKey ? `Available (${apiKey.length} chars)` : 'Not available')
      
      // Make a direct API call instead of using the service
      const searchUrl = `https://www.omdbapi.com?apikey=${apiKey}&t=${encodeURIComponent(title.trim())}${year ? `&y=${year.trim()}` : ''}`
      console.log('Searching with URL:', searchUrl.replace(apiKey, '[API_KEY_HIDDEN]'))
      
      const response = await fetch(searchUrl)
      const data = await response.json()
      console.log('API Response:', data)
      
      if (data.Response === 'True') {
        setFoundMovie(data)
      } else {
        console.error('Movie not found:', data.Error)
        setSearchError(`Movie not found: ${data.Error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error searching for movie:', error)
      setSearchError(error instanceof Error ? error.message : 'An error occurred while searching for the movie. Please try again.')
    } finally {
      setIsSearching(false)
    }
  }

  const handleAddMovie = async () => {
    if (!foundMovie) return
    
    setIsAdding(true)
    setAddResult(undefined)
    
    try {
      const movieData = convertOmdbToMovieFormat(foundMovie)
      // Pass the addToPlaylist preference to the addMovieToDatabase function
      const result = await addMovieToDatabase(movieData, addToPlaylist)
      setAddResult(result)
      
      if (result.success) {
        // Reset form after successful addition
        setTimeout(() => {
          setTitle('')
          setYear('')
          setFoundMovie(null)
          setAddResult(undefined)
          onClose()
        }, 2000)
      } else if ('duplicate' in result && result.duplicate) {
        // If it's a duplicate, don't close the modal but allow the user to try again
        console.log('Duplicate movie detected:', result.message)
        // Keep the form open so user can try another movie or add to playlist
      }
    } catch (error) {
      console.error('Error adding movie:', error)
      setAddResult({
        success: false,
        message: 'An unexpected error occurred while adding the movie.'
      })
    } finally {
      setIsAdding(false)
    }
  }
  
  const handleAddToPlaylist = async () => {
    if (!addResult) return
    
    // Make sure we have a valid ID from the duplicate movie result
    if (!addResult.id) {
      console.error('No movie ID available for adding to playlist')
      setAddResult({
        success: false,
        message: 'Could not add to playlist: Missing movie ID'
      })
      return
    }
    
    console.log('Adding movie to playlist with ID:', addResult.id)
    setIsAdding(true)
    
    try {
      // We need to pass the movie ID and set addToPlaylistOnly to true
      const movieData = { id: addResult.id } as Partial<Movie>
      const result = await addMovieToDatabase(movieData, true)
      setAddResult(result)
      
      if (result.success) {
        // Reset form after successful addition to playlist
        setTimeout(() => {
          setTitle('')
          setYear('')
          setFoundMovie(null)
          setAddResult(undefined)
          onClose()
        }, 2000)
      }
    } catch (error) {
      console.error('Error adding movie to playlist:', error)
      setAddResult({
        success: false,
        message: 'An unexpected error occurred while adding the movie to playlist.'
      })
    } finally {
      setIsAdding(false)
    }
  }

  const handleReset = () => {
    setFoundMovie(null)
    setAddResult(undefined)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add a Movie</h2>
        
        {!foundMovie ? (
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label htmlFor="movie-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Movie Title
              </label>
              <input
                id="movie-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter movie title"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            
            <div>
              <label htmlFor="movie-year" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Release Year (optional)
              </label>
              <input
                id="movie-year"
                type="text"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="e.g. 2023"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            {searchError && (
              <div className="text-red-500 text-sm">{searchError}</div>
            )}
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSearching}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-6">
              {foundMovie.Poster && foundMovie.Poster !== 'N/A' && (
                <div className="w-full md:w-1/3">
                  <img 
                    src={foundMovie.Poster} 
                    alt={foundMovie.Title} 
                    className="w-full h-auto rounded-md shadow-md"
                  />
                </div>
              )}
              
              <div className="flex-1 space-y-3">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {foundMovie.Title} ({foundMovie.Year})
                </h3>
                
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  <p><span className="font-medium">Director:</span> {foundMovie.Director}</p>
                  <p><span className="font-medium">Actors:</span> {foundMovie.Actors}</p>
                  <p><span className="font-medium">Genre:</span> {foundMovie.Genre}</p>
                  <p><span className="font-medium">Runtime:</span> {foundMovie.Runtime}</p>
                  <p><span className="font-medium">Rated:</span> {foundMovie.Rated}</p>
                </div>
                
                <p className="text-gray-700 dark:text-gray-300">{foundMovie.Plot}</p>
                
                <div className="flex flex-wrap gap-2">
                  {foundMovie.Ratings?.map((rating, index) => (
                    <div key={index} className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-xs">
                      {rating.Source}: {rating.Value}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {addResult && (
              <div className={`p-3 rounded-md ${addResult.success === true ? 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400'}`}>
                <p>{addResult.message}</p>
                {'duplicate' in addResult && addResult.duplicate && (
                  <div className="mt-2">
                    <p className="text-sm mb-2">
                      {'canAddToPlaylist' in addResult && addResult.canAddToPlaylist 
                        ? "This movie already exists in the database. You can add it to your playlist or search for a different movie." 
                        : "Please try searching for a different movie that isn't already in the database."}
                    </p>
                    <div className="flex space-x-2">
                      {'canAddToPlaylist' in addResult && addResult.canAddToPlaylist && (
                        <button
                          onClick={handleAddToPlaylist}
                          disabled={isAdding}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isAdding ? 'Adding...' : 'Add to Playlist'}
                        </button>
                      )}
                      <button
                        onClick={handleReset}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        Try Another Movie
                      </button>
                    </div>
                  </div>
                )}
                {'alreadyInPlaylist' in addResult && addResult.alreadyInPlaylist && (
                  <div className="mt-2">
                    <p className="text-sm mb-2">
                      This movie is already in your playlist.
                    </p>
                    <button
                      onClick={handleReset}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Try Another Movie
                    </button>
                  </div>
                )}
              </div>
            )}
            
            <div className="flex flex-col space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="add-to-playlist"
                  checked={addToPlaylist}
                  onChange={(e) => setAddToPlaylist(e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="add-to-playlist" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Add to Playlist genre
                </label>
              </div>
              
              <div className="flex justify-between">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Back to Search
                </button>
                
                <button
                  onClick={handleAddMovie}
                  disabled={isAdding || (addResult && addResult.success === true)}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAdding ? 'Adding...' : (addResult && addResult.success === true) ? 'Added!' : 'Add to Database'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}

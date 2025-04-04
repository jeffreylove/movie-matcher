'use client'

import Image from 'next/image'
import { useState } from 'react'
// Removed @react-spring import
import type { Movie, SwipeType } from '@/types/database'

const serviceColors = {
  "Netflix": "bg-red-600 text-white",
  "Prime Video": "bg-blue-600 text-white",
  "Disney+": "bg-blue-400 text-white",
  "Hulu": "bg-green-600 text-white",
}

const getServiceColor = (service: string) => serviceColors[service as keyof typeof serviceColors] || "bg-gray-700 text-white";

interface MovieCardProps {
  movie: Movie
  // Removed style prop
  onVote?: (vote: boolean) => void
  onNext?: () => void
  recordSwipe?: (sessionId: string, movieId: number, direction: SwipeType) => void
}

export function MovieCard({ movie, onVote, onNext, recordSwipe }: MovieCardProps) {
  const [isImageLoading, setIsImageLoading] = useState(true)
  const [isVoting, setIsVoting] = useState(false)

  const getRatingColor = (rating: number) => {
    if (rating >= 8) return 'text-green-500'
    if (rating >= 6) return 'text-yellow-500'
    return 'text-red-500'
  }
  
  const getYearFromDate = (date: any): string => {
    if (!date) return 'N/A';
    try {
      // Handle string format
      if (typeof date === 'string') {
        // Format: YYYY-MM-DD
        if (date.includes('-')) {
          return date.split('-')[0];
        }
        // Format: YYYY
        if (/^\d{4}$/.test(date)) {
          return date;
        }
      }
      // Handle number format
      if (typeof date === 'number') {
        return String(date);
      }
      // Handle Date object
      if (date instanceof Date) {
        return String(date.getFullYear());
      }
      return 'N/A';
    } catch (e) {
      console.error('Error extracting year from date:', date, e);
      return 'N/A';
    }
  }

  const sessionId = 'some-session-id'; // assuming sessionId is defined somewhere

  const handleSwipe = async (direction: SwipeType) => {
    if (movie && sessionId) {
      recordSwipe && await recordSwipe(sessionId, Number(movie.id), direction);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto h-full">
      <div className="h-full bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="h-full flex">
          {/* Left side - Poster */}
          <div className="w-1/3 relative flex-shrink-0">
            {movie.poster_path ? (
              <>
                {isImageLoading && (
                  <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
                )}
                <Image
                  src={movie.poster_path}
                  alt={movie.title}
                  layout="fill"
                  objectFit="cover"
                  onLoadingComplete={() => setIsImageLoading(false)}
                  priority
                />
              </>
            ) : (
              <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <span className="text-gray-500">No Image Available</span>
              </div>
            )}
          </div>
          {/* Right side - Details */}
          <div className="flex-1 p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{movie.title}</h2>
              <p className="text-base text-gray-500 dark:text-gray-400">Runtime: {movie.runtime ? `${movie.runtime}` : 'N/A'}</p>
              <p className="text-base text-gray-500 dark:text-gray-400 mt-2">{movie.overview || 'No overview available.'}</p>
              <p className="text-sm text-gray-500 mt-2">
                Release Year: {getYearFromDate(movie.release_date)}
              </p>
            </div>
            <div className="mt-4 flex items-center space-x-4">
              <div className="flex items-center">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/6/69/IMDB_Logo_2016.svg" 
                  alt="IMDb" 
                  className="w-10 h-5 mr-2" 
                />
                <p className="text-sm text-gray-500 dark:text-gray-400">{movie.imdb_rating !== null ? movie.imdb_rating : 'N/A'}</p>
              </div>
              <div className="flex items-center">
                <img 
                  src="https://www.rottentomatoes.com/assets/pizza-pie/images/icons/tomatometer/tomatometer-fresh.149b5e8adc3.svg" 
                  alt="RT" 
                  className="w-6 h-6 mr-2" 
                />
                <p className="text-sm text-gray-500 dark:text-gray-400">{movie.rt_rating !== null ? movie.rt_rating : 'N/A'}</p>
              </div>
              <div className="flex items-center">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/2/20/Metacritic.svg" 
                  alt="Metascore" 
                  className="w-6 h-6 mr-2" 
                />
                <p className="text-sm text-gray-500 dark:text-gray-400">{movie.metascore !== null ? movie.metascore : 'N/A'}</p>
              </div>
            </div>
            <div className="mt-4 flex justify-between">
              <button 
                onClick={() => onNext && onNext()}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Next movie"
                disabled={!onNext}
              >
                Next Movie
              </button>
              
              <div className="flex space-x-6">
                <button 
                  onClick={() => {
                    if (onVote && !isVoting) {
                      setIsVoting(true);
                      onVote(false);
                      // Reset voting state immediately
                      setIsVoting(false);
                    }
                  }} 
                  className="bg-red-500 hover:bg-red-600 text-white p-4 rounded-full shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Dislike movie"
                  disabled={!onVote || isVoting}
                >
                  {isVoting ? (
                    <div className="w-6 h-6 border-t-2 border-white rounded-full animate-spin"></div>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"></path>
                    </svg>
                  )}
                </button>
                <button 
                  onClick={() => {
                    if (onVote && !isVoting) {
                      setIsVoting(true);
                      onVote(true);
                      // Reset voting state immediately
                      setIsVoting(false);
                    }
                  }} 
                  className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Like movie"
                  disabled={!onVote || isVoting}
                >
                  {isVoting ? (
                    <div className="w-6 h-6 border-t-2 border-white rounded-full animate-spin"></div>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function CrossIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  )
}

function HeartIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
      />
    </svg>
  )
}

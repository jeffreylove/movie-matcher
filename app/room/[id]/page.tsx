'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/app/contexts/AuthContext'
import toast from 'react-hot-toast'
import { getSession, subscribeToMatches, supabase } from '@/lib/supabase'
import { fetchMatches } from '@/lib/services/matchService'
import type { Session, Movie } from '@/types/database'
import { MovieSwiper } from '@/components/movie/MovieSwiper'
import { FilterModal } from '@/components/movie/FilterModal'
import Modal from '@/components/common/Modal'
import Image from 'next/image'

export default function RoomPage() {
  const { user } = useAuth()
  const params = useParams<{ id: string }>()
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [showMatchModal, setShowMatchModal] = useState(false)
  const [matchedMovie, setMatchedMovie] = useState<Movie | null>(null)
  const [showMatchesListModal, setShowMatchesListModal] = useState(false)
  const [matches, setMatches] = useState<Movie[]>([])
  const [loadingMatches, setLoadingMatches] = useState(false)
  const [showInitialFilterModal, setShowInitialFilterModal] = useState(false)
  const [isCreator, setIsCreator] = useState(false)
  const [filtersVersion, setFiltersVersion] = useState(0)
  const [showMovies, setShowMovies] = useState(false)

  // Function to fetch and display matches
  const handleViewMatches = async () => {
    if (!session?.id) return

    setLoadingMatches(true)
    setShowMatchesListModal(true)

    try {
      const matchedMovies = await fetchMatches(session.id)
      console.log('Fetched matches:', matchedMovies)
      setMatches(matchedMovies)
    } catch (error) {
      console.error('Error fetching matches:', error)
      toast.error('Could not load matches')
    } finally {
      setLoadingMatches(false)
    }
  }

  // Listen for session filter changes
  useEffect(() => {
    if (!params?.id || !session?.id) return;
    
    console.log('Setting up filter change subscription for session:', params.id);
    console.log('Current filtersVersion at subscription setup:', filtersVersion);
    
    const subscription = supabase
      .channel('session-filters')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'sessions',
        filter: `id=eq.${params.id}`,
      }, (payload) => {
        console.log('🔔 Session updated from database:', payload);
        console.log('Current filtersVersion before update:', filtersVersion);
        
        // Update the session data
        if (payload.new && payload.new.filters) {
          console.log('New filters from database:', JSON.stringify(payload.new.filters, null, 2));
          
          setSession(prevSession => {
            if (!prevSession) return null;
            console.log('Updating session with new filters');
            return {
              ...prevSession,
              filters: payload.new.filters
            };
          });
          
          // Force MovieSwiper to reload
          setFiltersVersion(prev => {
            const newVersion = prev + 1;
            console.log(`🔄 Incrementing filtersVersion from ${prev} to ${newVersion} due to database update`);
            return newVersion;
          });
        }
      })
      .subscribe();
      
    return () => {
      console.log('Cleaning up filter change subscription');
      subscription.unsubscribe();
    };
  }, [params?.id, session?.id]);

  useEffect(() => {
    if (!params?.id) {
      console.log('No room ID found')
      return
    }

    if (!user) {
      console.log('No user found')
      return
    }

    const fetchSession = async () => {
      setLoading(true)
      try {
        const session = await getSession(params.id)
        console.log('Fetched session:', session)

        if (session) {
          setSession(session)

          // Check if the current user is the creator of the room
          const userIsCreator = session.user1_id === user.id
          setIsCreator(userIsCreator)

          // Always show the filter modal for new rooms before showing movies
          if (!session.filters || Object.keys(session.filters).length === 0 || 
              (Array.isArray(session.filters.genres) && session.filters.genres.length === 0)) {
            // No filters set yet, show the filter modal first
            setShowInitialFilterModal(true)
            setShowMovies(false) // Don't show movies until filters are set
          } else {
            // Filters already set, show movies
            setShowMovies(true)
          }
        } else {
          toast.error('Room not found')
        }
      } catch (error) {
        console.error('Error fetching session:', error)
        toast.error('Failed to load room')
      } finally {
        setLoading(false)
      }
    }

    fetchSession()

    console.log('Setting up match subscription in room:', params.id)

    // Subscribe to real-time updates
    let subscription: any
    try {
      subscription = subscribeToMatches(params.id, async (match) => {
        console.log('Match callback triggered:', match)
        try {
          // Get movie details from the API
          const { data: movie, error } = await supabase
            .from('movies')
            .select('*')
            .eq('id', match.movie_id)
            .single()

          if (error) {
            console.error('Error fetching movie:', error)
            throw error
          }

          console.log('Found matched movie:', movie)

          // Show match modal
          setMatchedMovie(movie)
          setShowMatchModal(true)
        } catch (error) {
          console.error('Error showing match notification:', error)
          toast.error('Found a match but could not load movie details')
        }
      })
      console.log('Subscription set up successfully:', subscription)
    } catch (error) {
      console.error('Error setting up subscription:', error)
    }

    return () => {
      console.log('Cleaning up subscription for room:', params.id)
      subscription?.unsubscribe()
    }
  }, [params?.id]) // Only re-run when room ID changes

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-primary-50 to-white dark:from-primary-900 dark:to-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 dark:border-primary-400" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-primary-50 to-white dark:from-primary-900 dark:to-gray-900">
        <h1 className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-4">
          Room not found
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8 text-center max-w-md">
          This room might have expired or doesn't exist.
        </p>
        <Link
          href="/"
          className="text-primary-600 hover:text-primary-500 dark:text-primary-400 flex items-center gap-2 transition-colors duration-200"
        >
          <span>←</span>
          <span>Back to home</span>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white dark:from-primary-900 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Room Header */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  Movie Room
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 font-medium">
                  Room Code: <span className="text-primary-600 dark:text-primary-400">{session.id}</span>
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => handleViewMatches()}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium
                             rounded-lg shadow-sm text-white
                             bg-purple-600 hover:bg-purple-700 
                             focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500
                             transition-colors duration-200"
                >
                  View Matches
                </button>
              </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <FilterModal
                isOpen={showFilters}
                onClose={() => {
          console.log('Filter modal closed, updating state...');
          console.log('Current filtersVersion before update:', filtersVersion);
          setShowFilters(false);
          // Now show the movies since filters have been set
          setShowMovies(true);
          // Increment filters version to force MovieSwiper to reload
          setFiltersVersion(prev => {
            const newVersion = prev + 1;
            console.log(`Incrementing filtersVersion from ${prev} to ${newVersion}`);
            return newVersion;
          });
        }}
                sessionId={session.id}
                initialFilters={session.filters}
              />
            )}
          </div>

          {/* Show filter button if no movies are being shown */}
          {!showMovies && (
            <div className="flex flex-col items-center justify-center p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg">
              <h2 className="text-xl font-bold text-primary-600 dark:text-primary-400 mb-4">
                Choose Your Movie Preferences
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
                Select your movie preferences to start matching with your partner.
              </p>
              <button
                onClick={() => setShowFilters(true)}
                className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg transition-colors duration-200 shadow-md"
              >
                Set Movie Preferences
              </button>
            </div>
          )}
          
          {/* Movie Swiper - only show when filters have been set */}
          {showMovies && (
            <MovieSwiper
              key={`swiper-${session.id}-${filtersVersion}`} // Force remount when filters change
              sessionId={session.id}
              userId={user.id}
              filterVersion={filtersVersion} // Pass the filter version to reset swiped movies
              onEmpty={() => {
                toast.success('You\'ve seen all the movies! Wait for matches or try different filters.')
              }}
            />
          )}
        </div>
      </div>

      {/* Match Modal */}
      <Modal isOpen={showMatchModal} onClose={() => setShowMatchModal(false)}>
        {matchedMovie && (
          <div className="flex flex-col items-center text-center">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-3">We've got a match!</h2>
              <p className="text-xl text-gray-700 dark:text-gray-300">
                You and your partner both selected <span className="font-bold">{matchedMovie.title}</span>
              </p>
            </div>
            
            <div className="relative w-64 h-96 mb-6 overflow-hidden rounded-lg shadow-lg">
              {matchedMovie.poster_path ? (
                <Image
                  src={matchedMovie.poster_path}
                  alt={matchedMovie.title}
                  fill
                  style={{ objectFit: 'cover' }}
                  className="rounded-lg"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center rounded-lg">
                  <span className="text-gray-500">No Image Available</span>
                </div>
              )}
            </div>
            
            <button 
              onClick={() => setShowMatchModal(false)}
              className="mt-4 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-full transition-colors duration-200 shadow-md"
            >
              Continue Swiping
            </button>
          </div>
        )}
      </Modal>

      {/* Matches List Modal */}
      <Modal isOpen={showMatchesListModal} onClose={() => setShowMatchesListModal(false)}>
        <div className="flex flex-col w-full max-w-lg">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2">Your Matches</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Movies that both you and your partner liked
            </p>
          </div>
          
          {loadingMatches ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600 dark:border-purple-400" />
            </div>
          ) : matches.length > 0 ? (
            <div className="overflow-y-auto max-h-96 pr-2">
              <ul className="space-y-3">
                {matches.map((movie) => (
                  <li key={movie.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                    <div className="flex items-center p-3">
                      <div className="relative w-16 h-24 flex-shrink-0 mr-4 rounded overflow-hidden">
                        {movie.poster_path ? (
                          <Image
                            src={movie.poster_path}
                            alt={movie.title}
                            fill
                            style={{ objectFit: 'cover' }}
                            className="rounded"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <span className="text-xs text-gray-500">No Image</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 dark:text-white">{movie.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {movie.release_date ? new Date(movie.release_date).getFullYear() : 'Unknown year'}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No matches found yet. Keep swiping!</p>
            </div>
          )}
          
          <button 
            onClick={() => setShowMatchesListModal(false)}
            className="mt-6 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors duration-200 shadow-md self-center"
          >
            Close
          </button>
        </div>
      </Modal>
      
      {/* Initial Filter Setup Modal */}
      <FilterModal
        isOpen={showInitialFilterModal}
        onClose={() => {
          setShowInitialFilterModal(false);
          // Now show the movies since filters have been set
          setShowMovies(true);
          // Increment filters version to force MovieSwiper to reload
          setFiltersVersion(prev => prev + 1);
        }}
        sessionId={session?.id || ''}
        initialFilters={session?.filters || { genres: [], year_start: null, year_end: null, streaming_services: [], min_rating: null }}
        isInitialSetup={true}
      />
    </div>
  )
}

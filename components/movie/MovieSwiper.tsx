'use client'

import { useState, useEffect } from 'react'
// import { useSprings, animated, to as interpolate } from '@react-spring/web'
// import { useDrag } from '@use-gesture/react'
import { MovieCard } from './MovieCard'
import { recordSwipe, supabase } from '@/lib/supabase'
import { fetchMoviesForSession } from '@/lib/services/movieService'
import { fetchMatches } from '@/lib/services/matchService';
import Image from 'next/image'
import Modal from '@/components/common/Modal';
import type { Movie } from '@/types/database'

// Removed swipe mechanics constants

interface MovieSwiperProps {
  sessionId: string
  userId: string
  onEmpty?: () => void
  filterVersion?: number // Add a prop to trigger resets when filters change
}

export function MovieSwiper({ sessionId, userId, onEmpty, filterVersion = 0 }: MovieSwiperProps) {
  // Log when component is constructed/mounted
  console.log(`MovieSwiper MOUNTED with sessionId: ${sessionId}, filterVersion: ${filterVersion}`);
  
  // Log component key for debugging
  console.log(`MovieSwiper component key should be: swiper-${sessionId}-${filterVersion}`);
  
  const [movies, setMovies] = useState<Movie[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [matches, setMatches] = useState<Movie[]>([])
  const [showModal, setShowModal] = useState(false)
  const [matchedMovie, setMatchedMovie] = useState<Movie | null>(null)
  // Track movies that have already been swiped on to prevent looping
  const [swipedMovieIds, setSwipedMovieIds] = useState<Set<string>>(new Set());

  // Removed spring animations

  // Reset swiped movies when filters change
  useEffect(() => {
    console.log('Filter version changed to:', filterVersion)
    // Reset swiped movies when filters change
    setSwipedMovieIds(new Set())
    setCurrentIndex(0)
    // Reset the empty state notification flag
    setEmptyStateShown(false)
    // Add a small delay to ensure state is updated
    setTimeout(() => {
      console.log('Reset swiped movies due to filter change')
    }, 100)
  }, [filterVersion])

  // Store all fetched movies (unfiltered)
  const [allMovies, setAllMovies] = useState<Movie[]>([]);

  // Load all movies that match the filters - only when sessionId or filterVersion changes
  useEffect(() => {
    const loadMovies = async () => {
      console.log('Loading all movies for session:', sessionId, 'with filterVersion:', filterVersion)
      setLoading(true)
      try {
        const result = await fetchMoviesForSession({
          sessionId
        })
        console.log('Fetched movies:', result)
        
        // Store all movies without filtering
        setAllMovies(result.movies);
        
        // Check if specific movies are in the result set at all
        const dalmatians102Id = '102_Dalmatians-2000-tt0211181';
        const elfId = 'Elf-2003-tt0319343';
        const dalmatians102Movie = result.movies.find(m => m.id === dalmatians102Id);
        const elfMovie = result.movies.find(m => m.id === elfId);
        
        console.log('102 Dalmatians in result set?', dalmatians102Movie ? 'YES' : 'NO');
        console.log('Elf in result set?', elfMovie ? 'YES' : 'NO');
      } catch (error) {
        console.error('Error loading movies:', error)
      } finally {
        setLoading(false)
      }
    }

    loadMovies()
  }, [sessionId, filterVersion])

  // No need for pagination or loading more movies - we load them all at once
  
  // Filter movies locally whenever swipedMovieIds changes
  useEffect(() => {
    if (allMovies.length === 0) return;
    
    console.log('Filtering movies locally based on swipedMovieIds');
    console.log('Current swiped movie IDs:', Array.from(swipedMovieIds));
    
    // Check if specific movies are in the swiped list
    const dalmatians102Id = '102_Dalmatians-2000-tt0211181';
    const elfId = 'Elf-2003-tt0319343';
    
    if (swipedMovieIds.has(dalmatians102Id)) {
      console.log('⚠️ 102 Dalmatians is in the swiped list! It will be filtered out.');
    }
    
    if (swipedMovieIds.has(elfId)) {
      console.log('⚠️ Elf is in the swiped list! It will be filtered out.');
    }
    
    // Find movies being filtered out
    const swipedMovies = allMovies.filter(movie => swipedMovieIds.has(String(movie.id)));
    console.log('Movies being filtered out as already swiped:', 
      swipedMovies.map(m => `${m.title} (ID: ${m.id})`));
    
    // Filter out any movies that have already been swiped on
    const filteredMovies = allMovies.filter(movie => 
      !swipedMovieIds.has(String(movie.id))
    );
    
    console.log(`Filtered ${allMovies.length - filteredMovies.length} already swiped movies out of ${allMovies.length} total movies`);
    setMovies(filteredMovies);
  }, [allMovies, swipedMovieIds]);

  // Track if we've already shown the empty state notification
  const [emptyStateShown, setEmptyStateShown] = useState(false);
  
  // Handle empty state
  useEffect(() => {
    console.log('Current state:', { loading, currentIndex, moviesLength: movies.length, emptyStateShown })
    
    // Only show the empty state notification once
    if (!loading && !emptyStateShown) {
      if (movies.length === 0) {
        // No movies match the filters
        console.log('No movies match the filters, showing empty state')
        setEmptyStateShown(true);
        onEmpty?.();
      } else if (currentIndex >= movies.length) {
        // Reached the end of the movies list
        console.log('Reached the end of the movies list, showing empty state')
        setEmptyStateShown(true);
        onEmpty?.();
      }
    }
  }, [currentIndex, movies.length, loading, onEmpty, emptyStateShown])

  useEffect(() => {
    const loadMatches = async () => {
      try {
        const fetchedMatches = await fetchMatches(sessionId);
        setMatches(fetchedMatches);
      } catch (error) {
        console.error('Error fetching matches:', error);
      }
    };

    loadMatches();
  }, [sessionId]);

  // Track if a vote is in progress to prevent double-clicks
  const [isVoting, setIsVoting] = useState(false);

  // Handle voting on a movie
  const handleVote = async (vote: boolean) => {
    // Prevent multiple rapid clicks
    if (isVoting || currentIndex >= movies.length) return;
    
    try {
      setIsVoting(true);
      await handleSwipe(movies[currentIndex], vote);
      
      // Check if this was the last movie
      if (currentIndex === movies.length - 1) {
        console.log('Last movie reached, calling onEmpty callback');
        // Add a small delay to show the empty state
        setTimeout(() => {
          setCurrentIndex((prev) => prev + 1);
          onEmpty && onEmpty();
        }, 300);
      } else {
        // Wait for user to see the current movie before advancing
        // Don't auto-advance to the next movie
      }
    } catch (error) {
      console.error('Error during vote:', error);
    } finally {
      // Reset voting state immediately to allow next vote
      setIsVoting(false);
    }
  }

  const handleSwipe = async (movie: Movie, vote: boolean) => {
    try {
      console.log(`Swiping on movie: ${movie.title} (ID: ${movie.id}) with vote: ${vote ? 'right' : 'left'}`);
      console.log('Current swiped movie IDs before adding:', Array.from(swipedMovieIds));
      
      // Add this movie ID to the set of swiped movies to prevent it from showing again
      setSwipedMovieIds(prev => {
        const newSet = new Set(prev);
        newSet.add(String(movie.id));
        console.log(`Adding ${movie.title} (ID: ${movie.id}) to swiped movies`);
        return newSet;
      });
      
      // Log after update (though this will run before the state actually updates)
      console.log('Updated swiped movie IDs (will be reflected after render):', 
        [...Array.from(swipedMovieIds), String(movie.id)]);
      
      // Convert userId and movie.id to strings to ensure compatibility with recordSwipe
      await recordSwipe(sessionId, String(userId), String(movie.id), vote ? 'right' : 'left');
      if (vote) {
        const isMatch = await checkForMatch(movie.id);
        if (isMatch) {
          setMatchedMovie(movie);
          setShowModal(true);
        }
      }
    } catch (error) {
      console.error('Error recording swipe:', error)
    }
  }

  const checkForMatch = async (movieId: string): Promise<boolean> => {
    try {
      const { data: swipes, error } = await supabase
        .from('swipes')
        .select('*')
        .eq('movie_id', movieId)
        .eq('vote', 'right');

      if (error) {
        console.error('Error checking for match:', error);
        return false;
      }

      return swipes.length > 1; // Assuming more than one right swipe indicates a match
    } catch (error) {
      console.error('Error in match check:', error);
      return false;
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setMatchedMovie(null);
  };

  // Removed showMatches function as it's now handled by the modal in the parent component

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Loading movies...</p>
      </div>
    )
  }

  if (!movies || movies.length === 0 || currentIndex >= movies.length) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] space-y-4">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          No Movies Available
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
          {currentIndex >= movies.length
            ? "You've gone through all available movies. Wait for more movies to be added."
            : "No movies found. Try adjusting your filters to see more options."}
        </p>
      </div>
    )
  }

  // Function to manually advance to the next movie
  const handleNextMovie = () => {
    if (currentIndex < movies.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else if (currentIndex === movies.length - 1) {
      // Last movie
      setCurrentIndex(prev => prev + 1);
      // Only call onEmpty if we haven't shown the empty state yet
      if (!emptyStateShown) {
        setEmptyStateShown(true);
        onEmpty && onEmpty();
      }
    }
  };

  return (
    <div className="h-[600px] w-full max-w-4xl mx-auto px-4 sm:px-6">
      {currentIndex < movies.length && (
        <MovieCard 
          movie={movies[currentIndex]} 
          onVote={handleVote}
          onNext={handleNextMovie}
        />
      )}
      <Modal isOpen={showModal} onClose={closeModal}>
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
              onClick={closeModal}
              className="mt-4 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-full transition-colors duration-200 shadow-md"
            >
              Continue Swiping
            </button>
          </div>
        )}
      </Modal>
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

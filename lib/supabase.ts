'use client'

import { createClient } from '@supabase/supabase-js'
import { type Database, type Match } from '@/types/database'

const supabaseUrl = 'https://xcswgedcigqeddlgkuej.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhjc3dnZWRjaWdxZWRkbGdrdWVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg5Nzc3NjcsImV4cCI6MjA1NDU1Mzc2N30.v5KLS-cQVpbpzf32-bG7UtW04WCoQwiW1qvKcKOqmSc'

if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is not defined')
}

if (!supabaseKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined')
}

// Validate URL format
try {
  new URL(supabaseUrl)
} catch (error) {
  throw new Error(`Invalid NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl}`)
}

export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        'X-Client-Info': 'movie-matcher',
      },
    },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// Helper to get a profile by ID
export async function getProfile(userId: string) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  return profile
}

// Helper to create or update a profile
export async function upsertProfile({
  id,
  username,
}: {
  id: string
  username?: string
}) {
  try {
    const timestamp = new Date().toISOString()
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id,
        username: username || `Movie Lover ${id.slice(0, 4)}`,
        created_at: timestamp,
        updated_at: timestamp,
      })
      .select()
      .single()

    if (error) {
      console.error('Error upserting profile:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Failed to upsert profile:', error)
    throw error
  }
}

// Helper to create a new session
export async function createSession(userId: string) {
  // Generate a random 6-character room code
  const generateRoomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  try {
    // Create or update profile for the user with a unique username
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        username: `Movie Lover ${userId.slice(0, 4)}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

    if (profileError) {
      console.error('Error upserting profile:', profileError)
      throw profileError
    }

    // Try to create a session with a unique room code
    let attempts = 0
    const timestamp = new Date().toISOString()
    
    while (attempts < 3) {
      const roomCode = generateRoomCode()
      const { data: session, error } = await supabase
        .from('sessions')
        .insert({
          id: roomCode,
          user1_id: userId,
          status: 'active',
          created_at: timestamp,
          updated_at: timestamp,
        })
        .select()
        .single()

      if (!error) {
        console.log('Successfully created session:', roomCode)
        return session
      }

      console.warn(`Attempt ${attempts + 1} failed:`, error)

      if (error.code !== '23505') { // If error is not unique violation
        console.error('Error creating session:', error)
        throw error
      }

      attempts++
    }

    throw new Error('Failed to generate a unique room code after multiple attempts')
  } catch (error) {
    console.error('Error in createSession:', error)
    throw error
  }
}

// Helper to join an existing session
export async function joinSession(roomCode: string, userId: string) {
  try {
    // Create or update profile for the user with a unique username
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        username: `Movie Lover ${userId.slice(0, 4)}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

    if (profileError) {
      console.error('Profile error:', profileError)
      return false
    }

    // Get the current session state
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', roomCode.toUpperCase())
      .single()

    if (sessionError) {
      console.error('Session fetch error:', sessionError)
      return false
    }

    if (!session) {
      console.error('No session found with code:', roomCode)
      return false
    }

    // Check if user is already in the session
    if (session.user1_id === userId || session.user2_id === userId) {
      console.log('User already in session')
      return true
    }

    // Check if session is full
    if (session.user2_id) {
      console.error('Session is full')
      return false
    }

    // Update the session with the second user
    const { error: updateError } = await supabase
      .from('sessions')
      .update({
        user2_id: userId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', roomCode.toUpperCase())

    if (updateError) {
      console.error('Session update error:', updateError)
      return false
    }

    return true
  } catch (error) {
    console.error('Join session error:', error)
    return false
  }
}

// Helper to subscribe to matches in a session
export function subscribeToMatches(
  sessionId: string,
  callback: (match: Database['public']['Tables']['matches']['Row']) => void
) {
  console.log('Setting up match subscription for session:', sessionId)
  
  try {
    const channel = supabase
      .channel('matches')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'matches',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          console.log('Received match:', payload)
          callback(payload.new as Database['public']['Tables']['matches']['Row'])
        }
      )
      .subscribe()

    console.log('Created subscription channel:', channel)
    return channel
  } catch (error) {
    console.error('Error creating subscription:', error)
    throw error
  }
}

// Helper to record a swipe
export async function recordSwipe(
  sessionId: string,
  userId: string,
  movieId: string,
  swipeType: Database['public']['Enums']['swipe_type']
) {
  try {
    console.log('Recording swipe:', { sessionId, userId, movieId, swipeType })

    // Delete any existing swipes for this movie by this user in this session
    const { error: deleteError } = await supabase
      .from('swipes')
      .delete()
      .match({
        session_id: sessionId,
        user_id: userId,
        movie_id: movieId,
      })

    if (deleteError) {
      console.error('Error deleting existing swipe:', deleteError)
      throw deleteError
    }

    // Insert the new swipe
    const { data, error: insertError } = await supabase
      .from('swipes')
      .insert({
        session_id: sessionId,
        user_id: userId,
        movie_id: movieId,
        swipe: swipeType,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error recording swipe:', insertError)
      throw insertError
    }

    console.log('Swipe recorded successfully:', data)
    return data
  } catch (error) {
    console.error('Failed to record swipe:', error)
    throw error
  }
}

// Helper to get session details
export async function getSession(sessionId: string) {
  // First get the session details with matches
  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .select(`
      *,
      user1:profiles!sessions_user1_id_fkey(*),
      user2:profiles!sessions_user2_id_fkey(*),
      matches(movie_id)
    `)
    .eq('id', sessionId)
    .single()

  if (sessionError) {
    console.error('Error fetching session:', sessionError)
    throw sessionError
  }

  // Then get the movie details for any matches
  if (session?.matches?.length > 0) {
    const movieIds = session.matches.map((m: Match) => m.movie_id)
    const { data: movies, error: moviesError } = await supabase
      .from('movies')
      .select('*')
      .in('id', movieIds)

    if (moviesError) {
      console.error('Error fetching matched movies:', moviesError)
      throw moviesError
    }

    return { ...session, movies }
  }

  return session
}

// Helper to get movies based on session filters
export async function getFilteredMovies(sessionId: string) {
  const { data: session } = await supabase
    .from('sessions')
    .select('filters')
    .eq('id', sessionId)
    .single()

  if (!session) throw new Error('Session not found')

  let query = supabase
    .from('movies')
    .select('*')

  const { filters } = session

  if (filters.genres.length > 0) {
    query = query.contains('genres', filters.genres)
  }

  if (filters.year_start) {
    query = query.gte('release_date', `${filters.year_start}-01-01`)
  }

  if (filters.year_end) {
    query = query.lte('release_date', `${filters.year_end}-12-31`)
  }

  if (filters.min_rating) {
    query = query.or(`imdb_rating.gte.${filters.min_rating},rt_rating.gte.${filters.min_rating * 10}`)
  }

  if (filters.streaming_services.length > 0) {
    const streamingConditions = filters.streaming_services.map(service => 
      `streaming_services->>'${service}' is not null`
    ).join(' or ')
    query = query.or(streamingConditions)
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

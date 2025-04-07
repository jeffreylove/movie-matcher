export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type SessionStatus = 'active' | 'completed'
export type SwipeType = 'left' | 'right'

export interface Profile {
  id: string
  created_at: string
  updated_at: string
  username: string | null
  avatar_url?: string | null
}

export interface Session {
  id: string // 6-digit room code
  created_at: string
  updated_at: string
  user1_id: string
  user2_id: string | null
  status: SessionStatus
  filters: {
    genres: string[]
    year_start: number | null
    year_end: number | null
    streaming_services: string[]
    min_rating: number | null
    mpaa_ratings?: string[]
  }
}

export interface Movie {
  id: string // TMDb ID
  created_at: string
  updated_at: string
  title: string
  poster_path: string | null
  overview: string | null
  release_date: string | null
  genres: string[]
  release_year: number | null
  imdb_rating: number | null
  rt_rating: number | null
  streaming_services: {
    [provider: string]: {
      type: 'subscription' | 'rent' | 'buy'
      price?: number
      quality?: string
    }
  }
  last_updated: string
  year: number | null
  plot: string | null
  runtime: string | null
  metascore: number | null
}

export interface Swipe {
  id: string
  created_at: string
  session_id: string
  user_id: string
  movie_id: string
  swipe: SwipeType
}

export interface Match {
  id: string
  created_at: string
  session_id: string
  movie_id: string
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at'>
        Update: Partial<Profile>
      }
      sessions: {
        Row: Session
        Insert: Omit<Session, 'created_at' | 'updated_at'>
        Update: Partial<Session>
      }
      movies: {
        Row: Movie
        Insert: Omit<Movie, 'created_at' | 'updated_at'>
        Update: Partial<Movie>
      }
      swipes: {
        Row: Swipe
        Insert: Omit<Swipe, 'id' | 'created_at'>
        Update: Partial<Swipe>
      }
      matches: {
        Row: Match
        Insert: Omit<Match, 'id' | 'created_at'>
        Update: Partial<Match>
      }
    }
    Functions: {
      generate_unique_room_code: {
        Args: Record<string, never>
        Returns: string
      }
      join_session: {
        Args: {
          room_code: string
          joining_user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      session_status: SessionStatus
      swipe_type: SwipeType
    }
  }
}

'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { Profile } from '@/types/database'

interface AuthContextType {
  user: { id: string }
  profile: Profile | null
  loading: boolean
}

const USER_ID_KEY = 'movie_matcher_user_id'

function getOrCreateUserId(): string {
  if (typeof window === 'undefined') return uuidv4()
  
  let userId = localStorage.getItem(USER_ID_KEY)
  if (!userId) {
    userId = uuidv4()
    localStorage.setItem(USER_ID_KEY, userId)
  }
  return userId
}

const AuthContext = createContext<AuthContextType>({
  user: { id: '' },
  profile: null,
  loading: true,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const id = getOrCreateUserId()
    setUserId(id)
    setLoading(false)
  }, [])

  const profile = userId ? {
    id: userId,
    username: 'Movie Lover',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  } : null

  return (
    <AuthContext.Provider
      value={{
        user: { id: userId },
        profile,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

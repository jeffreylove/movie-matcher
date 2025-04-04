'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/contexts/AuthContext'
import { createSession, joinSession, supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export function SessionManager() {
  const router = useRouter()
  const { user } = useAuth()
  const [roomCode, setRoomCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [showJoinInput, setShowJoinInput] = useState(false)

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowJoinInput(false)
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [])

  const handleCreateSession = async () => {
    setLoading(true)

    try {
      const session = await createSession(user.id)
      toast.success(`Room created! Code: ${session.id}`)
      router.push(`/room/${session.id}`)
    } catch (error) {
      console.error('Error creating session:', error)
      toast.error('Failed to create room')
    } finally {
      setLoading(false)
    }
  }

  const handleJoinSession = async (e?: React.FormEvent) => {
    e?.preventDefault()
    
    if (!showJoinInput) {
      setShowJoinInput(true)
      return
    }

    if (!roomCode) {
      toast.error('Please enter a room code')
      return
    }

    setLoading(true)

    try {
      console.log('Attempting to join room:', roomCode.toUpperCase())
      const success = await joinSession(roomCode.toUpperCase(), user.id)
      console.log('Join session result:', success)
      
      if (success) {
        toast.success('Joined room successfully!')
        router.push(`/room/${roomCode.toUpperCase()}`)
      } else {
        // Check if room exists first
        const { data: session } = await supabase
          .from('sessions')
          .select('user2_id')
          .eq('id', roomCode.toUpperCase())
          .single()

        if (!session) {
          toast.error('Room not found')
        } else if (session.user2_id) {
          toast.error('Room is full')
        } else {
          toast.error('Unable to join room')
        }
      }
    } catch (error) {
      console.error('Error joining session:', error)
      toast.error('Failed to join room: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Hidden Create Room Button */}
      <button
        id="create-room"
        onClick={handleCreateSession}
        className="hidden"
      />

      {/* Hidden Join Room Button */}
      <button
        id="join-room"
        onClick={handleJoinSession}
        className="hidden"
      />

      {/* Join Room Modal */}
      {showJoinInput && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-6">
              Join a Room
            </h2>
            
            <form onSubmit={handleJoinSession} className="space-y-4">
              <div>
                <label
                  htmlFor="room-code"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Room Code
                </label>
                <input
                  type="text"
                  id="room-code"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  pattern="[A-Z0-9]{6}"
                  required
                  className="w-full px-4 py-3 rounded-lg border-2 border-primary-200 
                           dark:border-primary-700 bg-white dark:bg-gray-900
                           text-gray-900 dark:text-white placeholder-gray-500
                           focus:outline-none focus:border-primary-500
                           transition-colors duration-200"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowJoinInput(false)}
                  className="flex-1 px-4 py-3 text-gray-700 dark:text-gray-300
                           bg-gray-100 dark:bg-gray-700 rounded-lg
                           hover:bg-gray-200 dark:hover:bg-gray-600
                           transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || roomCode.length !== 6}
                  className="flex-1 px-4 py-3 text-white
                           bg-primary-600 rounded-lg
                           hover:bg-primary-700
                           disabled:opacity-50 disabled:cursor-not-allowed
                           transition-colors duration-200"
                >
                  {loading ? 'Joining...' : 'Join Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

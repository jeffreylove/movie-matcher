'use client'

import { useState } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import toast from 'react-hot-toast'

export function AuthForm() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await signIn(email)
      toast.success('Check your email for the login link!')
      setEmail('')
    } catch (error) {
      toast.error('Failed to send login link. Please try again.')
      console.error('Auth error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-sm">
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Email address
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                     focus:border-indigo-500 focus:ring-indigo-500 
                     dark:bg-gray-800 dark:border-gray-700 dark:text-white"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent 
                   rounded-md shadow-sm text-sm font-medium text-white 
                   bg-indigo-600 hover:bg-indigo-700 focus:outline-none 
                   focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                   disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Sending...' : 'Sign in with Email'}
      </button>
    </form>
  )
}

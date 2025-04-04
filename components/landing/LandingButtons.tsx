'use client'

import { useState } from 'react'
import AddMovieModal from '../movie/AddMovieModal'

export function LandingButtons() {
  const [showAddMovieModal, setShowAddMovieModal] = useState(false)

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-stretch w-full max-w-sm mx-auto">
        <button
          onClick={() => document.getElementById('create-room')?.click()}
          className="
            flex-1 px-8 py-4 text-lg font-medium text-white
            bg-gradient-to-r from-primary-600 to-primary-500
            hover:from-primary-500 hover:to-primary-400
            rounded-xl shadow-lg shadow-primary-500/25
            transition-all duration-300 ease-out
            transform hover:scale-[1.02] active:scale-[0.98]
            focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-2 focus:ring-offset-transparent
          "
        >
          Start a Room
        </button>
        <button
          onClick={() => document.getElementById('join-room')?.click()}
          className="
            flex-1 px-8 py-4 text-lg font-medium
            text-white/90 bg-white/10
            hover:bg-white/20 hover:text-white
            backdrop-blur-sm
            rounded-xl border border-white/10
            shadow-lg shadow-black/10
            transition-all duration-300 ease-out
            transform hover:scale-[1.02] active:scale-[0.98]
            focus:outline-none focus:ring-2 focus:ring-white/25 focus:ring-offset-2 focus:ring-offset-transparent
          "
        >
          Join a Room
        </button>
      </div>
      
      <div className="mt-4 text-center">
        <button
          onClick={() => setShowAddMovieModal(true)}
          className="
            inline-flex items-center px-4 py-2 text-sm font-medium
            text-white/90 bg-purple-600/80 hover:bg-purple-500
            backdrop-blur-sm rounded-lg
            transition-all duration-300 ease-out
            transform hover:scale-[1.02] active:scale-[0.98]
            focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-transparent
          "
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add a Movie
        </button>
      </div>

      <AddMovieModal isOpen={showAddMovieModal} onClose={() => setShowAddMovieModal(false)} />
    </>
  )
}

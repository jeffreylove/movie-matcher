'use client'

import { LandingButtons } from './LandingButtons'
import { SessionManager } from '../session/SessionManager'

export function HeroSection() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gray-900">
      {/* Background image as a separate div with absolute positioning */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('/background.jpeg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          opacity: 0.7
        }}
      />


      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary-900/40 via-primary-800/30 to-primary-900/40" />
      <div className="absolute inset-0 bg-gradient-to-r from-primary-900/30 via-transparent to-primary-900/30" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl sm:text-6xl font-extrabold text-white mb-6">
          Take control of your{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-200">
            movie night
          </span>
        </h1>
        <p className="text-lg sm:text-xl text-primary-100 mb-12 max-w-2xl mx-auto">
          Match with friends, find the perfect movie, and make your next movie night unforgettable.
        </p>
        
        <div className="space-y-8">
          <LandingButtons />
          <SessionManager />
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-gray-900 to-transparent" />
      <div className="absolute -top-48 -left-48 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-48 -right-48 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl" />
    </div>
  )
}

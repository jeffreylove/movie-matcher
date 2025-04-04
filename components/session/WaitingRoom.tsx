import { useState } from 'react'
import toast from 'react-hot-toast'

export function WaitingRoom({ roomCode }: { roomCode: string }) {
  const [copied, setCopied] = useState(false)

  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode)
      setCopied(true)
      toast.success('Room code copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
      toast.error('Failed to copy room code')
    }
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-8 py-12">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Waiting for Partner
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Share this room code with your movie-matching partner
        </p>
      </div>

      <div className="relative">
        <div className="flex items-center justify-center space-x-4 bg-white dark:bg-gray-800 
                        rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="text-4xl font-mono font-bold tracking-wider 
                         text-indigo-600 dark:text-indigo-400">
            {roomCode}
          </div>
          <button
            onClick={copyRoomCode}
            className="p-2 text-gray-500 hover:text-indigo-600 
                       dark:text-gray-400 dark:hover:text-indigo-400
                       focus:outline-none focus:ring-2 focus:ring-indigo-500
                       rounded-md transition-colors duration-200"
          >
            {copied ? (
              <CheckIcon className="h-6 w-6" />
            ) : (
              <ClipboardIcon className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      <div className="max-w-md text-center text-sm text-gray-500 dark:text-gray-400">
        <p>
          Once your partner joins with this code, you'll both be able to start
          swiping through movies!
        </p>
      </div>

      {/* Loading animation */}
      <div className="flex items-center justify-center space-x-2">
        <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  )
}

function ClipboardIcon(props: React.SVGProps<SVGSVGElement>) {
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
        d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
      />
    </svg>
  )
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
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
        d="M5 13l4 4L19 7"
      />
    </svg>
  )
}

function FilterIcon(props: React.SVGProps<SVGSVGElement>) {
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
        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
      />
    </svg>
  )
}

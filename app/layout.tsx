import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import './globals.css'

export const metadata = {
  title: 'Movie Matcher',
  description: 'Match movies with friends, Tinder-style!',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" />
      </head>
      <body className="h-full bg-gray-900 text-white">
        <AuthProvider>
          {children}
          <Toaster position="bottom-right" />
        </AuthProvider>
      </body>
    </html>
  )
}

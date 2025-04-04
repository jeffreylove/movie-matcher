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
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
          <Toaster position="bottom-right" />
        </AuthProvider>
      </body>
    </html>
  )
}

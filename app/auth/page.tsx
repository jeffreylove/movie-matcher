import { AuthForm } from '@/components/auth/AuthForm'

export default function AuthPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Movie Matcher
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Sign in to start matching movies with friends
          </p>
        </div>
        <AuthForm />
      </div>
    </div>
  )
}

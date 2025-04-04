'use client'

import { useEffect, useState } from 'react'

export default function OmdbApiTester() {
  const [testResult, setTestResult] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [apiKey, setApiKey] = useState('')

  useEffect(() => {
    // Get the API key from environment variables
    const key = process.env.NEXT_PUBLIC_OMDB_API_KEY || ''
    setApiKey(key)
  }, [])

  const testApi = async () => {
    setIsLoading(true)
    setTestResult('')
    
    try {
      if (!apiKey) {
        setTestResult('API key is empty. Please check your .env.local file.')
        return
      }
      
      // Test with a well-known movie
      const testUrl = `https://www.omdbapi.com?apikey=${apiKey}&t=inception`
      console.log('Testing OMDB API with URL:', testUrl.replace(apiKey, '[API_KEY_HIDDEN]'))
      
      const response = await fetch(testUrl)
      const data = await response.json()
      
      console.log('OMDB API test response:', data)
      
      if (data.Response === 'True') {
        setTestResult(`Success! Found movie: ${data.Title} (${data.Year})`)
      } else {
        setTestResult(`API Error: ${data.Error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('OMDB API test failed:', error)
      setTestResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">OMDB API Tester</h2>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          API Key: {apiKey ? `${apiKey.substring(0, 3)}...${apiKey.substring(apiKey.length - 3)}` : 'Not found'}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          API Key Length: {apiKey.length} characters
        </p>
      </div>
      
      <button
        onClick={testApi}
        disabled={isLoading}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
      >
        {isLoading ? 'Testing...' : 'Test OMDB API'}
      </button>
      
      {testResult && (
        <div className={`mt-4 p-3 rounded-md ${testResult.includes('Success') ? 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400'}`}>
          {testResult}
        </div>
      )}
    </div>
  )
}

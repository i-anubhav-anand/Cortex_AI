"use client"

import { useEffect } from "react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
        <h2 className="text-xl font-bold text-red-700 mb-2">Something went wrong!</h2>
        <p className="mb-4 text-gray-700">{error.message || "An unexpected error occurred"}</p>
        <div className="bg-white p-3 rounded mb-4 overflow-auto max-h-40">
          <pre className="text-xs text-gray-600">{error.stack}</pre>
        </div>
        <div className="flex gap-4">
          <button onClick={() => reset()} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Try again
          </button>
          <a href="/" className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">
            Go Home
          </a>
        </div>
      </div>
    </div>
  )
}


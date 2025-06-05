// src/app/books/[id]/error.tsx
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h2 className="text-red-600 text-xl font-bold mb-4">Something went wrong!</h2>
        <p className="text-gray-600 mb-4">Failed to load book details.</p>
        <div className="flex gap-2">
          <button
            onClick={() => reset()}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded"
          >
            Try again
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="flex-1 border border-emerald-200 text-emerald-700 hover:bg-emerald-50 font-bold py-2 px-4 rounded"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  )
}
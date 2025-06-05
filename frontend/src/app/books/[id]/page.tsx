// src/app/books/[id]/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

interface Book {
  id: number;
  title: string;
  author: string;
  category?: string;
  photo?: string;
  pdf?: string;
  created_at?: string;
  updated_at?: string;
}

const API_BASE_URL = 'http://localhost:5000';

export default function BookDetailsPage({ params }: { params: { id: string } }) {
  const [book, setBook] = useState<Book | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const router = useRouter()

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    category: "",
    photo: "",
    pdf: ""
  })

  // Fetch book details
  const fetchBook = async () => {
    try {
      setError(null)
      setIsLoading(true)
      
      const response = await fetch(`${API_BASE_URL}/books/${params.id}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Book not found')
        } else {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        return
      }
      
      const bookData = await response.json()
      setBook(bookData)
      setFormData({
        title: bookData.title,
        author: bookData.author,
        category: bookData.category || "",
        photo: bookData.photo || "",
        pdf: bookData.pdf || ""
      })
    } catch (error) {
      console.error('Failed to fetch book:', error)
      setError('Failed to load book details')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBook()
  }, [params.id])

  // Handle book update
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setError(null)
      
      const response = await fetch(`${API_BASE_URL}/books/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const updatedBook = await response.json()
      setBook(updatedBook)
      setIsEditing(false)
      
    } catch (error) {
      console.error('Failed to update book:', error)
      setError('Failed to update book')
    }
  }

  // Handle book deletion
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this book?")) return
    
    try {
      setError(null)
      
      const response = await fetch(`${API_BASE_URL}/books/${params.id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      // Redirect to main page after deletion
      router.push('/')
      
    } catch (error) {
      console.error('Failed to delete book:', error)
      setError('Failed to delete book')
    }
  }

  // Open PDF in new tab
  const openPDF = () => {
    if (book?.pdf) {
      // Convert Google Drive share link to direct view link
      let pdfUrl = book.pdf
      if (pdfUrl.includes('drive.google.com/file/d/')) {
        const fileId = pdfUrl.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1]
        if (fileId) {
          pdfUrl = `https://drive.google.com/file/d/${fileId}/view`
        }
      }
      window.open(pdfUrl, '_blank')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-emerald-700">Loading book details...</p>
        </div>
      </div>
    )
  }

  if (error || !book) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-red-600 text-xl font-bold mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Error
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="flex gap-2">
            <button 
              onClick={fetchBook}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded"
            >
              Retry
            </button>
            <button 
              onClick={() => router.push('/')}
              className="flex-1 border border-emerald-200 text-emerald-700 hover:bg-emerald-50 font-bold py-2 px-4 rounded"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 p-4">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-emerald-200 p-4 mb-6 rounded-lg">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="text-emerald-600 hover:text-emerald-800 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Library
              </button>
              <div className="h-6 w-px bg-emerald-200"></div>
              <h1 className="text-xl font-bold text-emerald-800">Book Details</h1>
            </div>
            <div className="flex items-center gap-2">
              <Image 
                src="/images/logo.webp" 
                alt="ACS Academy Logo" 
                width={80} 
                height={30} 
                className="h-8 w-auto"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto">
        {/* Book Details Card */}
        <div className="bg-white rounded-lg shadow-sm border border-emerald-200 overflow-hidden">
          <div className="md:flex">
            {/* Book Cover */}
            <div className="md:w-1/3 bg-emerald-50 p-6 flex items-center justify-center">
              {book.photo ? (
                <div className="relative w-full max-w-xs">
                  <img
                    src={book.photo || "/placeholder.svg"}
                    alt={book.title}
                    className="w-full h-auto rounded-lg shadow-md"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder.svg?height=400&width=300';
                    }}
                  />
                </div>
              ) : (
                <div className="w-full max-w-xs h-96 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              )}
            </div>

            {/* Book Information */}
            <div className="md:w-2/3 p-6">
              {!isEditing ? (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-3xl font-bold text-emerald-900 mb-2">{book.title}</h2>
                    <p className="text-xl text-emerald-700">by {book.author}</p>
                  </div>

                  {book.category && (
                    <div>
                      <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-medium">
                        {book.category}
                      </span>
                    </div>
                  )}

                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-emerald-800">Available Resources</h3>
                    <div className="flex flex-wrap gap-3">
                      {book.photo && (
                        <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Book Cover Available
                        </div>
                      )}
                      {book.pdf && (
                        <button
                          onClick={openPDF}
                          className="flex items-center gap-2 bg-red-50 text-red-700 px-3 py-2 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Open PDF
                        </button>
                      )}
                    </div>
                  </div>

                  {(book.created_at || book.updated_at) && (
                    <div className="text-sm text-emerald-600 space-y-1">
                      {book.created_at && (
                        <p>Added: {new Date(book.created_at).toLocaleDateString()}</p>
                      )}
                      {book.updated_at && book.updated_at !== book.created_at && (
                        <p>Updated: {new Date(book.updated_at).toLocaleDateString()}</p>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit Book
                    </button>
                    <button
                      onClick={handleDelete}
                      className="border border-red-200 text-red-700 hover:bg-red-50 font-bold py-2 px-4 rounded flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete Book
                    </button>
                  </div>
                </div>
              ) : (
                /* Edit Form */
                <form onSubmit={handleUpdate} className="space-y-4">
                  <h3 className="text-xl font-bold text-emerald-800 mb-4">Edit Book</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-emerald-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      className="w-full p-2 border border-emerald-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-emerald-700 mb-1">Author</label>
                    <input
                      type="text"
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      required
                      className="w-full p-2 border border-emerald-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-emerald-700 mb-1">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full p-2 border border-emerald-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Select a category</option>
                      <option value="Fiction">Fiction</option>
                      <option value="Non-Fiction">Non-Fiction</option>
                      <option value="Science">Science</option>
                      <option value="Technology">Technology</option>
                      <option value="History">History</option>
                      <option value="Philosophy">Philosophy</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-emerald-700 mb-1">Photo URL</label>
                    <input
                      type="text"
                      value={formData.photo}
                      onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                      placeholder="https://example.com/book-cover.jpg"
                      className="w-full p-2 border border-emerald-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-emerald-700 mb-1">PDF URL (Google Drive)</label>
                    <input
                      type="text"
                      value={formData.pdf}
                      onChange={(e) => setFormData({ ...formData, pdf: e.target.value })}
                      placeholder="https://drive.google.com/file/d/..."
                      className="w-full p-2 border border-emerald-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <p className="text-xs text-emerald-600 mt-1">
                      Paste the Google Drive share link here
                    </p>
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <button
                      type="submit"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="border border-emerald-200 text-emerald-700 hover:bg-emerald-50 font-bold py-2 px-4 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
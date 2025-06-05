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

export default function BooksManager() {
  const router = useRouter()
  const [books, setBooks] = useState<Book[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAddingBook, setIsAddingBook] = useState(false)
  const [editingBook, setEditingBook] = useState<Book | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [databaseType, setDatabaseType] = useState<string>("Loading...")
  
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    category: "",
    photo: "",
    pdf: ""
  })

  // Check API health and fetch books
  const initializeApp = async () => {
    try {
      setError(null)
      setIsLoading(true)
      
      // Check API health
      const healthResponse = await fetch(`${API_BASE_URL}/health`)
      if (!healthResponse.ok) {
        throw new Error(`HTTP error! status: ${healthResponse.status}`)
      }
      
      const healthData = await healthResponse.json()
      setDatabaseType(healthData.database)
      
      // Fetch books
      const booksResponse = await fetch(`${API_BASE_URL}/books`)
      if (!booksResponse.ok) {
        throw new Error(`HTTP error! status: ${booksResponse.status}`)
      }
      
      const booksData = await booksResponse.json()
      setBooks(booksData)
    } catch (error) {
      console.error('Failed to initialize app:', error)
      setError('Failed to connect to backend server. Make sure it\'s running on http://localhost:5000')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    initializeApp()
  }, [])

  // Filter books based on search and category
  const filteredBooks = books.filter(book => {
    const matchesSearch = searchTerm === "" || 
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === "all" || book.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setError(null)
      
      const url = editingBook 
        ? `${API_BASE_URL}/books/${editingBook.id}` 
        : `${API_BASE_URL}/books`
      
      const method = editingBook ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      // Refresh books list
      initializeApp()
      
      // Reset form
      setFormData({
        title: "",
        author: "",
        category: "",
        photo: "",
        pdf: ""
      })
      
      setIsAddingBook(false)
      setEditingBook(null)
      
    } catch (error) {
      console.error('Failed to save book:', error)
      setError(`Failed to ${editingBook ? 'update' : 'create'} book`)
    }
  }

  // Handle book deletion
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this book?")) return
    
    try {
      setError(null)
      
      const response = await fetch(`${API_BASE_URL}/books/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      // Refresh books list
      initializeApp()
      
    } catch (error) {
      console.error('Failed to delete book:', error)
      setError('Failed to delete book')
    }
  }

  // Handle edit button click
  const handleEdit = (book: Book) => {
    setEditingBook(book)
    setFormData({
      title: book.title,
      author: book.author,
      category: book.category || "",
      photo: book.photo || "",
      pdf: book.pdf || ""
    })
    setIsAddingBook(true)
  }

  // Open PDF in new tab
  const openPDF = (pdfUrl: string) => {
    let url = pdfUrl
    if (url.includes('drive.google.com/file/d/')) {
      const fileId = url.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1]
      if (fileId) {
        url = `https://drive.google.com/file/d/${fileId}/view`
      }
    }
    window.open(url, '_blank')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-emerald-700">Loading books...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-red-600 text-xl font-bold mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Connection Error
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={initializeApp}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded"
          >
            Retry Connection
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 p-4">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-emerald-200 p-4 mb-6 rounded-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <Image 
                src="/images/logo.webp" 
                alt="ACS Academy Logo" 
                width={120} 
                height={40} 
                className="h-10 w-auto"
              />
              <div>
                <h1 className="text-2xl font-bold text-emerald-800">Books Library</h1>
                <p className="text-emerald-600">
                  Database: {databaseType} • {books.length} books total
                </p>
              </div>
            </div>
            <div className="mt-4 md:mt-0 flex items-center gap-3">
              <Image 
                src="/images/cube-logo.png" 
                alt="Cube Logo" 
                width={40} 
                height={40} 
                className="h-10 w-10"
              />
              <div className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm">
                Backend Connected
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto">
        {/* Controls */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search books by title or author..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-emerald-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-500 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-48 border border-emerald-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Categories</option>
                <option value="Fiction">Fiction</option>
                <option value="Non-Fiction">Non-Fiction</option>
                <option value="Science">Science</option>
                <option value="Technology">Technology</option>
                <option value="History">History</option>
                <option value="Philosophy">Philosophy</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <button
              onClick={() => {
                setIsAddingBook(true)
                setEditingBook(null)
                setFormData({
                  title: "",
                  author: "",
                  category: "",
                  photo: "",
                  pdf: ""
                })
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Book
            </button>
          </div>
        </div>

        {/* Add/Edit Book Form */}
        {isAddingBook && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
              <h2 className="text-xl font-bold mb-4 text-emerald-800">
                {editingBook ? "Edit Book" : "Add New Book"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
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
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded"
                  >
                    {editingBook ? "Update Book" : "Add Book"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingBook(false)}
                    className="border border-emerald-200 text-emerald-700 hover:bg-emerald-50 font-bold py-2 px-4 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Books Table */}
        <div className="bg-white rounded-lg shadow-sm border border-emerald-200">
          <div className="p-4 bg-emerald-50 border-b border-emerald-200 rounded-t-lg">
            <h2 className="text-lg font-bold text-emerald-800">Books Collection</h2>
            <p className="text-emerald-600 text-sm">
              Manage your library of books with categories and resources
            </p>
          </div>
          
          {filteredBooks.length === 0 ? (
            <div className="text-center py-12">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-emerald-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <p className="text-emerald-600 text-lg">No books found</p>
              <p className="text-emerald-500">
                {searchTerm || selectedCategory !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "Add your first book to get started"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-emerald-200">
                    <th className="text-left p-4 text-emerald-700">Title</th>
                    <th className="text-left p-4 text-emerald-700">Author</th>
                    <th className="text-left p-4 text-emerald-700">Category</th>
                    <th className="text-left p-4 text-emerald-700">Resources</th>
                    <th className="text-right p-4 text-emerald-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBooks.map((book) => (
                    <tr key={book.id} className="border-b border-emerald-100 hover:bg-emerald-50">
                      <td className="p-4">
                        <button
                          onClick={() => router.push(`/books/${book.id}`)}
                          className="font-medium text-emerald-900 hover:text-emerald-700 text-left hover:underline"
                        >
                          {book.title}
                        </button>
                      </td>
                      <td className="p-4 text-emerald-700">{book.author}</td>
                      <td className="p-4">
                        {book.category && (
                          <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-xs">
                            {book.category}
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          {book.photo && (
                            <span className="border border-emerald-200 text-emerald-700 px-2 py-1 rounded-full text-xs">
                              Photo
                            </span>
                          )}
                          {book.pdf && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                openPDF(book.pdf!)
                              }}
                              className="border border-red-200 text-red-700 px-2 py-1 rounded-full text-xs hover:bg-red-50 transition-colors"
                            >
                              Open PDF
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              router.push(`/books/${book.id}`)
                            }}
                            className="border border-emerald-200 text-emerald-700 hover:bg-emerald-50 p-1 rounded transition-colors"
                            title="View Details"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEdit(book)
                            }}
                            className="border border-emerald-200 text-emerald-700 hover:bg-emerald-50 p-1 rounded transition-colors"
                            title="Edit"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(book.id)
                            }}
                            className="border border-red-200 text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
                            title="Delete"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
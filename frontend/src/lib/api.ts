const API_BASE_URL = 'http://localhost:5000';

export interface Book {
  id: number;
  title: string;
  author: string;
  category?: string;
  photo?: string;
  pdf?: string;
}

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Get all books
  async getBooks(): Promise<Book[]> {
    return this.request<Book[]>('/books');
  }

  // Get single book
  async getBook(id: number): Promise<Book> {
    return this.request<Book>(`/books/${id}`);
  }

  // Create new book
  async createBook(book: Omit<Book, 'id'>): Promise<Book> {
    return this.request<Book>('/books', {
      method: 'POST',
      body: JSON.stringify(book),
    });
  }

  // Update book
  async updateBook(id: number, book: Omit<Book, 'id'>): Promise<Book> {
    return this.request<Book>(`/books/${id}`, {
      method: 'PUT',
      body: JSON.stringify(book),
    });
  }

  // Delete book
  async deleteBook(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/books/${id}`, {
      method: 'DELETE',
    });
  }

  // Health check
  async healthCheck(): Promise<{ status: string; database: string }> {
    return this.request<{ status: string; database: string }>('/health');
  }
}

export const apiService = new ApiService();
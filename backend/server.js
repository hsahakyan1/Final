require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // Frontend URL
  credentials: true
}));
app.use(express.json());

// Database connection (with fallback to mock data)
let pool;
let useMockData = false;

try {
  pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
  
  // Test connection
  pool.connect((err, client, release) => {
    if (err) {
      console.log('⚠️ Database connection failed, using mock data');
      useMockData = true;
    } else {
      console.log('✅ Connected to PostgreSQL database');
      release();
    }
  });
} catch (error) {
  console.log('⚠️ Database setup failed, using mock data');
  useMockData = true;
}

// Mock data for testing without database
let mockBooks = [
  { id: 1, title: 'Clean Code', author: 'Robert Martin', category: 'Technology', photo: '', pdf: '' },
  { id: 2, title: 'Sapiens', author: 'Yuval Harari', category: 'History', photo: '', pdf: '' },
  { id: 3, title: '1984', author: 'George Orwell', category: 'Fiction', photo: '', pdf: '' },
  { id: 4, title: 'The Art of War', author: 'Sun Tzu', category: 'Philosophy', photo: '', pdf: '' }
];

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Books API Server is running!',
    database: useMockData ? 'Mock Data' : 'PostgreSQL',
    endpoints: [
      'GET /books',
      'POST /books', 
      'GET /books/:id',
      'PUT /books/:id',
      'DELETE /books/:id'
    ]
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: useMockData ? 'Mock' : 'PostgreSQL'
  });
});

// GET all books
app.get('/books', async (req, res) => {
  try {
    if (useMockData) {
      console.log('📚 GET /books - Returning mock data:', mockBooks.length, 'books');
      return res.json(mockBooks);
    }
    
    const result = await pool.query('SELECT * FROM books ORDER BY id');
    console.log('📚 GET /books - Returning from DB:', result.rows.length, 'books');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching books:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET single book
app.get('/books/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  
  try {
    if (useMockData) {
      const book = mockBooks.find(b => b.id === id);
      if (!book) {
        return res.status(404).json({ message: 'Book not found' });
      }
      console.log('📖 GET /books/:id - Returning mock book:', book.title);
      return res.json(book);
    }
    
    const result = await pool.query('SELECT * FROM books WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }
    console.log('📖 GET /books/:id - Returning from DB:', result.rows[0].title);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching book:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST new book
app.post('/books', async (req, res) => {
  const { title, author, category, photo, pdf } = req.body;
  
  if (!title || !author) {
    return res.status(400).json({ error: 'Title and author are required' });
  }
  
  try {
    if (useMockData) {
      const newBook = {
        id: Math.max(...mockBooks.map(b => b.id), 0) + 1,
        title,
        author,
        category: category || '',
        photo: photo || '',
        pdf: pdf || ''
      };
      mockBooks.push(newBook);
      console.log('➕ POST /books - Created mock book:', newBook.title);
      return res.status(201).json(newBook);
    }
    
    const result = await pool.query(
      'INSERT INTO books (title, author, category, photo, pdf) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, author, category, photo, pdf]
    );
    console.log('➕ POST /books - Created in DB:', result.rows[0].title);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating book:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT update book
app.put('/books/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { title, author, category, photo, pdf } = req.body;
  
  try {
    if (useMockData) {
      const bookIndex = mockBooks.findIndex(b => b.id === id);
      if (bookIndex === -1) {
        return res.status(404).json({ message: 'Book not found' });
      }
      mockBooks[bookIndex] = { ...mockBooks[bookIndex], title, author, category, photo, pdf };
      console.log('✏️ PUT /books/:id - Updated mock book:', mockBooks[bookIndex].title);
      return res.json(mockBooks[bookIndex]);
    }
    
    const result = await pool.query(
      'UPDATE books SET title = $1, author = $2, category = $3, photo = $4, pdf = $5 WHERE id = $6 RETURNING *',
      [title, author, category, photo, pdf, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }
    console.log('✏️ PUT /books/:id - Updated in DB:', result.rows[0].title);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating book:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE book
app.delete('/books/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  
  try {
    if (useMockData) {
      const bookIndex = mockBooks.findIndex(b => b.id === id);
      if (bookIndex === -1) {
        return res.status(404).json({ message: 'Book not found' });
      }
      const deletedBook = mockBooks[bookIndex];
      mockBooks.splice(bookIndex, 1);
      console.log('🗑️ DELETE /books/:id - Deleted mock book:', deletedBook.title);
      return res.json({ message: 'Book deleted successfully' });
    }
    
    const result = await pool.query('DELETE FROM books WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }
    console.log('🗑️ DELETE /books/:id - Deleted from DB:', result.rows[0].title);
    res.json({ message: 'Book deleted successfully' });
  } catch (err) {
    console.error('Error deleting book:', err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend Server running on http://localhost:${PORT}`);
  console.log(`📊 Database: ${useMockData ? 'Mock Data' : 'PostgreSQL'}`);
  console.log(`🌐 CORS enabled for: http://localhost:3000`);
  console.log(`📚 API Endpoints:`);
  console.log(`   GET    http://localhost:${PORT}/books`);
  console.log(`   POST   http://localhost:${PORT}/books`);
  console.log(`   GET    http://localhost:${PORT}/books/:id`);
  console.log(`   PUT    http://localhost:${PORT}/books/:id`);
  console.log(`   DELETE http://localhost:${PORT}/books/:id`);
});
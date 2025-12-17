const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const bookRouter = express.Router();
const Book = require('../models/BookModel');
const User = require('../models/UserModel');


bookRouter.get('/', authMiddleware, (req, res) => {
    try {
        res.send('Book endpoint is working!');
    } catch (error) {
        console.error('Error handling request:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Add a new book
bookRouter.post('/addbook', authMiddleware, async (req, res) => {
  try {
    const {
      title,
      author,
      genre,
      totalpages,
      pagesread = 0,
      price = 0,
      public: isPublic = false,
      statusofreading = 'to-read'
    } = req.body;

    const book = new Book({
      title,
      author,
      genre,
      totalpages,
      pagesread,
      price,
      public: Boolean(isPublic),
      owner: req.userId,
      readingstatus: statusofreading,
      isAvailable: true,
      status: true
    });

    await book.save();

    await User.findByIdAndUpdate(req.userId, {
      $push: { booksOwned: book._id }
    });

    res.status(201).json({
      message: 'Book added successfully',
      book
    });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


bookRouter.get('/getallbooks', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId)
      .populate('booksOwned')
      .populate('booksBorrowed');

    if (!user) return res.status(404).json({ message: 'User not found' });

    const allBooks = [...user.booksOwned, ...user.booksBorrowed];
    return res.status(200).json({ books: allBooks });

  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});


// Edit a book
bookRouter.put('/books/:id', authMiddleware, async (req, res) => {
  try {
    const bookId = req.params.id;
    const updatedFields = { ...req.body };

    const updatedBook = await Book.findOneAndUpdate(
      { _id: bookId, owner: req.userId },
      updatedFields,
      { new: true }
    );

    if (!updatedBook) return res.status(404).json({ error: 'Book not found or not owned by user' });

    res.status(200).json({ message: 'Book updated successfully', book: updatedBook });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a book
bookRouter.delete('/books/:id', authMiddleware, async (req, res) => {
  try {
    const bookId = req.params.id;

    const deletedBook = await Book.findOneAndDelete({ _id: bookId, owner: req.userId });

    if (!deletedBook) return res.status(404).json({ error: 'Book not found or not owned by user' });

    
    await User.findByIdAndUpdate(req.userId, { $pull: { booksOwned: bookId } });

    res.status(200).json({ message: 'Book deleted successfully' });
  } catch (err) {
    console.error('Delete book error:', err);
    res.status(500).json({ error: err.message });
  }
});


bookRouter.get('/getpublicbooks', authMiddleware, async (req, res) => {
  try {
    const books = await Book.find({
      public: true,
      isAvailable: true,
      owner: { $ne: req.userId }
    }).populate('owner', 'name email location');

    return res.status(200).json({ books });
  } catch (err) {
    console.error('Error in /getpublicbooks:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Dashboard stats
bookRouter.get('/dashboard/stats', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: 'User not found' });

    const stats = {
      booksRead: user.totalbooksread || 0,
      borrowedBooks: user.booksBorrowed.length || 0,
      booksLent: user.noofbooksLent || 0
    };

    return res.status(200).json({ stats });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Books currently being read
bookRouter.get('/dashboard/reading', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).populate('booksReading');

    if (!user) return res.status(404).json({ message: 'User not found' });

    return res.status(200).json({ books: user.booksReading });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = bookRouter;

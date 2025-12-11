const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const bookRouter = express.Router();
const jwt = require('jsonwebtoken');
const Book = require('../models/BookModel');
const User = require('../models/UserModel');
const BorrowModel = require('../models/BorrowModel');
const mongoose = require('mongoose');



bookRouter.get('/', authMiddleware, (req, res) => {
    try {
        res.send('User endpoint is working!');
    } catch (error) {
        console.error('Error handling request:', error);
        res.status(500).send('Internal Server Error');
    }
});

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
      public: String(isPublic).toLowerCase() === 'true', // ensures only true string or boolean is accepted
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


//owned + borrowed books
bookRouter.get('/getallbooks', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId; // Assuming authMiddleware sets req.user

    const user = await User.findById(userId)
      .populate('booksOwned')
      .populate('booksBorrowed');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const allBooks = [...user.booksOwned, ...user.booksBorrowed];
    return res.status(200).json({ books: allBooks });


  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

//borrowed books
bookRouter.get('/getborrowedbooks', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    // Find all approved borrow requests where the current user is the borrower (fromUser)
    const borrowRequests = await BorrowModel.find({
      fromUser: userId,
      status: 'approved'
    }).populate('book');

    // Extract the books from the populated borrow requests
    const borrowedBooks = borrowRequests.map(request => request.book);

    res.status(200).json({ books: borrowedBooks });

  } catch (err) {
    console.error('Error fetching borrowed books:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

bookRouter.put('/:id/changepublicstatus', authMiddleware, async (req, res) => {
  try {
    const bookId = req.params.id;
    const { public } = req.body; // true or false

    if (typeof public !== 'boolean') {
      return res.status(400).json({ error: '`public` must be true or false' });
    }

    const book = await Book.findOneAndUpdate(
      { _id: bookId, owner: req.userId },
      { public },
      { new: true }
    );

    if (!book) {
      return res.status(404).json({ error: 'Book not found or not owned by user' });
    }

    res.status(200).json({ message: 'Public status updated successfully', book });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//edit
bookRouter.get('/search',authMiddleware, async (req, res) => {
  try {

    const { title, author, genre } = req.query;
    // Build dynamic query
    const query = {};
    if (title) {
      query.title = { $regex: title, $options: 'i' }; // case-insensitive
    }
    if (author) {
      query.author = { $regex: author, $options: 'i' };
    }
    if (genre) {
      query.genre = { $regex: genre, $options: 'i' };
    }
    // Only show public books
    const books = await Book.find(query).populate('owner', 'name');

    res.status(200).json({ results: books });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

bookRouter.put('/books/:id', authMiddleware, async (req, res) => {
  try {
    const bookId = req.params.id;

    // Get update data from request body
    const {
      title,
      author,
      genre,
      totalpages,
      pagesread,
      price,
      public,
      readingstatus
    } = req.body;

    // Build the update object dynamically
    const updatedFields = {};
    if (title) updatedFields.title = title;
    if (author) updatedFields.author = author;
    if (genre) updatedFields.genre = genre;
    if (totalpages) updatedFields.totalpages = totalpages;
    if (pagesread) updatedFields.pagesread = pagesread;
    if (price !== undefined) updatedFields.price = price;
    if (public !== undefined) updatedFields.public = public;
    if (readingstatus) updatedFields.readingstatus = readingstatus;

    const updatedBook = await Book.findOneAndUpdate(
      { _id: bookId, owner: req.userId }, // ensure user owns the book
      updatedFields,
      { new: true }
    );

    if (!updatedBook) {
      return res.status(404).json({ error: 'Book not found or not owned by user' });
    }

    res.status(200).json({ message: 'Book updated successfully', book: updatedBook });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//call this on explore page


bookRouter.get('/getpublicbooks', authMiddleware, async (req, res) => {
  try {

    const books = await Book.find({
      public: true,
      isAvailable: true,
      owner: { $ne: req.userId } // Exclude books owned by the current user
    }).populate('owner', 'name email location');

    return res.status(200).json({ books });
  } catch (err) {
    console.error('Error in /getpublicbooks:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});


// / Get dashboard stats
bookRouter.get('/dashboard/stats', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

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

// Get books currently being read
bookRouter.get('/dashboard/reading', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).populate('booksReading');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ books: user.booksReading });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});







module.exports = bookRouter;

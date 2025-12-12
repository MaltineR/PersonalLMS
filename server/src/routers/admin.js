const express = require('express');
const router = express.Router();
const User = require('../models/UserModel');
const Book = require('../models/BookModel');
const authMiddleware = require('../middlewares/authMiddleware');
const isAdmin = require('../middlewares/isAdmin');

// ----------------------
// Get all users
// ----------------------
router.get('/users', authMiddleware, isAdmin, async (req, res) => {
    try {
        const users = await User.find().select('-password'); // exclude password
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// ----------------------
// Get all books
// ----------------------
router.get('/books', authMiddleware, isAdmin, async (req, res) => {
    try {
        const books = await Book.find().populate('owner', 'name email'); // optional
        res.json(books);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// ----------------------
// Delete a user
// ----------------------
router.delete('/users/:id', authMiddleware, isAdmin, async (req, res) => {
    try {
        const userId = req.params.id;
        await User.findByIdAndDelete(userId);
        res.json({ message: 'User deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// ----------------------
// Delete a book
// ----------------------
router.delete('/books/:id', authMiddleware, isAdmin, async (req, res) => {
    try {
        const bookId = req.params.id;
        await Book.findByIdAndDelete(bookId);
        res.json({ message: 'Book deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

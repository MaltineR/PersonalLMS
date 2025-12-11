const express = require('express');
const BorrowModel = require('../models/BorrowModel');
const Book = require('../models/BookModel');
const User = require('../models/UserModel');

const borrowRouter = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
// Example: GET all borrow records

borrowRouter.get('/getallrequest', async (req, res) => {
  try {
    const borrowRecords = await BorrowModel.find()
      .populate('book', 'title author')
      .populate('fromUser', 'name email')
      .populate('toUser', 'name email');

    return res.status(200).json({ borrowRecords });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

//borrower will request to borrow a book
borrowRouter.post('/request/:bookId', authMiddleware, async (req, res) => {
  const bookId = req.params.bookId;
  const fromUserId = req.userId;

  try {
    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    if (!book.isAvailable) return res.status(400).json({ message: 'Book is not available' });

    if (book.owner.toString() === fromUserId.toString())
      return res.status(400).json({ message: 'Cannot borrow your own book' });

    const existingRequest = await BorrowModel.findOne({
      book: bookId,
      fromUser: fromUserId,
      status: 'pending'
    });

    if (existingRequest) return res.status(400).json({ message: 'Request already sent' });

    const request = new BorrowModel({
      book: book._id,
      fromUser: fromUserId,
      toUser: book.owner,
      message: req.body.message || ''
    });

    await request.save();
    return res.status(201).json({ message: 'Request sent', request });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});


borrowRouter.get('/allrequeststoowner', authMiddleware, async (req, res) => {
  try {
    const requests = await BorrowModel.find({ toUser: req.userId })
      .populate('book', 'title author')
      .populate('fromUser', 'name email');

    res.status(200).json({ requests });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


borrowRouter.post('/respond/accept/:requestId', authMiddleware, async (req, res) => {
  const { requestId } = req.params;

  try {
    const request = await BorrowModel.findById(requestId)
      .populate('book')
      .populate('fromUser')
      .populate('toUser');

    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.toUser._id.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to respond to this request' });
    }
    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request already handled' });
    }

    const book = request.book;

    // Update request
    request.status = 'approved';
    request.approvedAt = new Date();
    request.dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // +14 days
    await request.save();

    // Update book
    book.isAvailable = false;
    book.sharedWith = request.fromUser._id;
    await book.save();

    // Update users
    await User.findByIdAndUpdate(request.toUser._id, {
      $push: { booksBorrowed: book._id }
    });

    // Add book to owner's "booksLent" and increment count
    await User.findByIdAndUpdate(request.fromUser._id, {
      $push: { booksLent: book._id },
      $inc: { noofbooksLent: 1 }
    });

    res.status(200).json({
      message: 'Request approved',
      request,
      dueDate: request.dueDate
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

borrowRouter.post('/respond/reject/:requestId', authMiddleware, async (req, res) => {
  const { requestId } = req.params;

  try {
    const request = await BorrowModel.findById(requestId)
      .populate('book')
      .populate('fromUser')
      .populate('toUser');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Only the receiver (owner) can reject
    if (request.toUser._id.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to respond to this request' });
    }

    // Prevent duplicate handling
    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request already handled' });
    }

    // Update request status
    request.status = 'rejected';
    request.rejectedAt = new Date();
    await request.save();

    res.status(200).json({
      message: 'Request rejected',
      request
    });

  } catch (err) {
    console.error('Reject error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

borrowRouter.post('/confirm-return/:requestId', authMiddleware, async (req, res) => {
  try {
    const ownerId = req.userId;
    const { requestId } = req.params;

    const request = await BorrowModel.findById(requestId)
      .populate('book')
      .populate('fromUser')  // borrower
      .populate('toUser');   // owner

    if (!request) return res.status(404).json({ message: 'Borrow request not found' });

    if (request.toUser._id.toString() !== ownerId) {
      return res.status(403).json({ message: 'Only the owner can confirm the return' });
    }

    if (request.status !== 'approved') {
      return res.status(400).json({ message: 'Borrow request not in approved state' });
    }

    if (request.returnConfirmed) {
      return res.status(400).json({ message: 'Return already confirmed' });
    }

    const book = request.book;
    const borrower = request.fromUser;
    const owner = request.toUser;

    // Update borrow request status
    request.returnConfirmed = true;
    request.returnConfirmedAt = new Date();
    request.status = 'completed';  // mark borrow cycle completed
    await request.save();

    // Update Book
    book.isAvailable = true;
    book.sharedWith = null;
    book.readingstatus = 'to-read'; // or keep as per your logic
    await book.save();

    // Update Borrower: remove book from booksBorrowed
    await User.findByIdAndUpdate(borrower._id, {
      $pull: { booksBorrowed: book._id },
      $inc: { totalbooksread: 1 } // optional, increment total read count
    });

    // Update Owner: remove book from booksLent and decrement lent count
    await User.findByIdAndUpdate(owner._id, {
      $pull: { booksLent: book._id },
      $inc: { noofbooksLent: -1 }
    });

    res.status(200).json({ message: 'Return confirmed successfully', request });

  } catch (error) {
    console.error('Error confirming return:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


// Get all borrow requests for the current user
borrowRouter.get('/pending', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    const pendingRequests = await BorrowModel.find({
      status: 'pending',
      toUser: userId
    })
      .populate('book', 'title')       // you can add more fields like 'author'
      .populate('fromUser', 'name email') // requester
      .populate('toUser', 'name email');  // owner (optional)

    return res.status(200).json({ requests: pendingRequests });
  } catch (err) {
    console.error('Error fetching pending requests:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

borrowRouter.get('/approved', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    const approvedRequests = await BorrowModel.find({
      status: 'approved',
      toUser: userId
    })
      .populate('book', 'title')
      .populate('fromUser', 'name email')
      .populate('toUser', 'name email');

    return res.status(200).json({ requests: approvedRequests });
  } catch (err) {
    console.error('Error fetching approved requests:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

borrowRouter.get('/my-borrowed-books', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    // Get requests where current user is the borrower (fromUser)
    // and status is either 'pending' or 'approved' or 'completed'
    const borrowedBooks = await BorrowModel.find({
      fromUser: userId,
      status: { $in: ['pending', 'approved', 'completed'] }
    })
    .populate('book', 'title author')
    .populate('toUser', 'name email') // owner of the book
    .sort({ createdAt: -1 });

    return res.status(200).json({ requests: borrowedBooks });
  } catch (err) {
    console.error('Error fetching borrowed books:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});


// Add this endpoint for deleting completed requests
borrowRouter.delete('/delete-request/:requestId', authMiddleware, async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.userId;

    const request = await BorrowModel.findById(requestId);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Only allow deletion if user is the borrower and status is completed
    if (request.fromUser.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this request' });
    }

    if (request.status !== 'completed') {
      return res.status(400).json({ message: 'Can only delete completed requests' });
    }

    await BorrowModel.findByIdAndDelete(requestId);
    
    return res.status(200).json({ message: 'Request deleted successfully' });
  } catch (err) {
    console.error('Error deleting request:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});
module.exports = borrowRouter;
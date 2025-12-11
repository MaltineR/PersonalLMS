const express = require('express');
const BorrowModel = require('../models/BorrowModel');
const User = require('../models/UserModel');
const sendEmail = require('../middlewares/emailSender');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Manually trigger reminder by requestId
router.post('/send-reminder/:requestId', authMiddleware, async (req, res) => {
  try {
    const requestId = req.params.requestId;
    const request = await BorrowModel.findById(requestId).populate('fromUser').populate('book');

    if (!request) return res.status(404).json({ message: 'Borrow request not found' });

    const borrowerEmail = request.fromUser.email;
    const bookTitle = request.book.title;
    const dueDate = request.dueDate?.toDateString() || 'Unknown';

    const subject = `📚 Reminder: Return "${bookTitle}"`;
    const text = `Hi ${request.fromUser.name},\n\nThis is a reminder to return the book "${bookTitle}" by the due date: ${dueDate}.\n\nThank you! 📖`;

    await sendEmail(borrowerEmail, subject, text);

    return res.status(200).json({ message: 'Reminder email sent successfully' });
  } catch (error) {
    console.error('Error sending manual reminder:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;

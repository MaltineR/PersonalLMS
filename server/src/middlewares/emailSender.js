const express = require('express');
const User = require('../models/UserModel');
const sendEmail = require('../middlewares/emailSender');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * Manually trigger reminder email
 * Body expects:
 * {
 *   userId,
 *   bookTitle,
 *   dueDate
 * }
 */
router.post('/send-reminder', authMiddleware, async (req, res) => {
  try {
    const { userId, bookTitle, dueDate } = req.body;

    if (!userId || !bookTitle) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const formattedDate = dueDate
      ? new Date(dueDate).toDateString()
      : 'Unknown';

    const subject = `📚 Reminder: Return "${bookTitle}"`;
    const text = `Hi ${user.name},

This is a reminder to return the book "${bookTitle}" by the due date: ${formattedDate}.

Thank you! 📖`;

    await sendEmail(user.email, subject, text);

    return res.status(200).json({ message: 'Reminder email sent successfully' });
  } catch (error) {
    console.error('Error sending manual reminder:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;

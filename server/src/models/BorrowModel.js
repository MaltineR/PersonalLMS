const mongoose = require("mongoose");

const borrowRequestSchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  fromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  toUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'returned', 'completed'],
    default: 'pending'
  },
  message: {
    type: String
  },
  isConfirmedReturned: {
    type: Boolean,
    default: false
  },
  returndate: {
    type: Date,
    default: function () {
      const returnDate = new Date();
      returnDate.setDate(returnDate.getDate() + 14); // Default to 14 days from now
      return returnDate;
    }
  },


  requestedAt: {
    type: Date,
    default: Date.now
  },
  approvedAt: {
    type: Date
  },
  returnedAt: {
    type: Date
  },
  dueDate: {
    type: Date
  },


}, {
  timestamps: true
});

const BorrowRequest = mongoose.models.BorrowRequest || mongoose.model('BorrowRequest', borrowRequestSchema);
module.exports = BorrowRequest;

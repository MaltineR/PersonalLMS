const mongoose = require("mongoose");
const readingProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Book",
    required: true
  },
  currentPage: {
    type: Number
  },
  totalPages: {
    type: Number // optional, only if not in book schema
  },
  progressPercent: {
    type: Number
  },
  lastReadDate: {
    type: Date,
    default: Date.now
  },
  reminder: {
    type: Date
  }
}, { timestamps: true });

const ReadingModel= mongoose.model("ReadingProgress", readingProgressSchema);
module.exports = ReadingModel;
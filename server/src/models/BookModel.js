const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  author: { type: String, required: true, trim: true },
  genre: { type: String },
  totalpages: { type: Number, required: true, min: 1 },
  pagesread: { type: Number, required: true, min: 1 },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: Boolean, default: true },
  price: { type: Number, default: 0 },
  public: { type: Boolean, default: false },
  readingstatus: {
    type: String,
    enum: ['read', 'reading', 'to-read'],
    default: 'to-read'
  },
  isAvailable:
  {
    type: Boolean,
    default: true
  },

},
  {
    timestamps: true
  });

const Book = mongoose.model('Book', bookSchema);
module.exports = Book;
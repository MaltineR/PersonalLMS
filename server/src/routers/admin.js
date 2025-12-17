const express = require("express");
const router = express.Router();

const User = require("../models/UserModel");
const Book = require("../models/BookModel");

const authMiddleware = require("../middlewares/authMiddleware");
const isAdmin = require("../middlewares/isAdmin");

// =======================
// Get all users
// =======================
router.get("/users", authMiddleware, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// =======================
// Get all books
// =======================
router.get("/books", authMiddleware, isAdmin, async (req, res) => {
  try {
    const books = await Book.find().populate("owner", "name email");
    res.json(books);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// =======================
// Delete a user
// =======================
router.delete("/users/:id", authMiddleware, isAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// =======================
// Delete a book
// =======================
router.delete("/books/:id", authMiddleware, isAdmin, async (req, res) => {
  try {
    await Book.findByIdAndDelete(req.params.id);
    res.json({ message: "Book deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// =======================
// Library Insights
// =======================
router.get("/library-insights", authMiddleware, isAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalBooks = await Book.countDocuments();

    // Top readers
    const topReaders = await User.aggregate([
      {
        $lookup: {
          from: "books",
          localField: "_id",
          foreignField: "owner",
          as: "books"
        }
      },
      {
        $addFields: {
          booksRead: {
            $size: {
              $filter: {
                input: "$books",
                as: "b",
                cond: { $eq: ["$$b.readingstatus", "read"] }
              }
            }
          }
        }
      },
      { $sort: { booksRead: -1 } },
      { $limit: 3 },
      { $project: { name: 1, email: 1, booksRead: 1 } }
    ]);

    // Genres breakdown
    const allBooks = await Book.find();
    const genreCounts = {};
    allBooks.forEach(b => {
      if (b.genre) genreCounts[b.genre] = (genreCounts[b.genre] || 0) + 1;
    });
    const sortedGenres = Object.entries(genreCounts)
      .map(([genre, count]) => ({ genre, count }))
      .sort((a, b) => b.count - a.count);

    res.json({
      totalUsers,
      totalBooks,
      topReaders,
      genres: sortedGenres,
      totalBooks: allBooks.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load insights" });
  }
});

// =======================
// User Insights
// =======================
router.get("/user-insights/:id", authMiddleware, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("name email");
    if (!user) return res.status(404).json({ message: "User not found" });

    const books = await Book.find({ owner: user._id });

    if (books.length === 0) {
      return res.json({
        user,
        summary: "This user has not added any books yet.",
        insights: []
      });
    }

    const totalBooks = books.length;
    const avgPages = Math.round(books.reduce((sum, b) => sum + (b.totalpages || 0), 0) / totalBooks) || 0;
    const booksRead = books.filter(b => b.readingstatus === "read").length;

    const insights = [];

    // Reading habits by pages
    if (avgPages < 200) insights.push(`${user.name} tends to read short books`);
    else if (avgPages > 400) insights.push(`${user.name} prefers long books`);

    // Completion habit
    if (booksRead / totalBooks > 0.6) insights.push(`${user.name} usually finishes their books`);

    // Top genre
    const genreCounts = {};
    books.forEach(b => {
      if (b.genre) genreCounts[b.genre] = (genreCounts[b.genre] || 0) + 1;
    });
    const sortedGenres = Object.entries(genreCounts).sort((a, b) => b[1] - a[1]);
    if (sortedGenres.length > 0) {
      const topGenre = sortedGenres[0][0];
      insights.push(`${user.name}'s most read genre is ${topGenre}`);
    }

    res.json({
      user,
      stats: { totalBooks, booksRead, avgPages },
      summary: `${user.name} owns ${totalBooks} books.`,
      insights
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load user insights" });
  }
});

// =======================
// AI query
// =======================
router.post('/ai-query', authMiddleware, isAdmin, async (req, res) => {
  const { query } = req.body;

  try {
    if (!query || !query.trim()) {
      return res.status(400).json({ error: 'Query is empty.' });
    }

    const q = query.toLowerCase().replace(/[^\w\s]/g, '').trim();
    console.log("Received query:", query);
    console.log("Normalized query:", q);

    let instruction = null;

    // Rule based
    if (q.includes("no books") || q.includes("zero books") || q.includes("without books")) {
      instruction = { type: "users_by_book_count", operator: "eq", value: 0 };
    } else if (q.includes("who owns the most books") || q.includes("most books")) {
      instruction = { type: "users_by_book_count", operator: "max" };
    } else if (q.includes("five most expensive")) {
      instruction = { type: "books_sorted", field: "price", order: "desc", limit: 5 };
    }

    console.log("Rule-based instruction:", instruction);

    if (!instruction) {
      return res.json({ data: [], message: 'Query not recognized. Use standard queries.' });
    }

    // Execute Instruction
    let result;

    switch (instruction.type) {
      case 'users_by_book_count':
        if (instruction.operator === 'max') {
          result = await User.aggregate([
            { $lookup: { from: 'books', let: { userId: '$_id' }, pipeline: [{ $match: { $expr: { $eq: ['$owner', '$$userId'] } } }], as: 'books' } },
            { $addFields: { bookCount: { $size: '$books' } } },
            { $sort: { bookCount: -1 } },
            { $limit: 1 },
            { $project: { name: 1, bookCount: 1 } }
          ]);
        } else {
          const operatorMap = { eq: '$eq', gt: '$gt', lt: '$lt' };
          result = await User.aggregate([
            { $lookup: { from: 'books', let: { userId: '$_id' }, pipeline: [{ $match: { $expr: { $eq: ['$owner', '$$userId'] } } }], as: 'books' } },
            { $addFields: { bookCount: { $size: '$books' } } },
            { $match: { bookCount: { [operatorMap[instruction.operator]]: instruction.value } } },
            { $project: { name: 1, bookCount: 1 } }
          ]);
        }
        break;

      case 'books_sorted':
        result = await Book.find().sort({ price: instruction.order === 'asc' ? 1 : -1 }).limit(instruction.limit || 5);
        break;

      default:
        return res.json({ data: [], message: 'Query not supported.' });
    }

    res.json({ data: result });

  } catch (err) {
    console.error('AI query error:', err);
    res.status(500).json({ error: 'AI query failed.', details: err.message });
  }
});

module.exports = router;

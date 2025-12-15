// routes/admin.js
const express = require('express');
const router = express.Router();

const User = require('../models/UserModel');
const Book = require('../models/BookModel');

const authMiddleware = require('../middlewares/authMiddleware');
const isAdmin = require('../middlewares/isAdmin');

// =======================
// GET ALL USERS (ADMIN)
// =======================
router.get('/users', authMiddleware, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// =======================
// GET ALL BOOKS (ADMIN)
// =======================
router.get('/books', authMiddleware, isAdmin, async (req, res) => {
  try {
    const books = await Book.find().populate('owner', 'name email');
    res.json(books);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// =======================
// DELETE USER (ADMIN)
// =======================
router.delete('/users/:id', authMiddleware, isAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// =======================
// DELETE BOOK (ADMIN)
// =======================
router.delete('/books/:id', authMiddleware, isAdmin, async (req, res) => {
  try {
    await Book.findByIdAndDelete(req.params.id);
    res.json({ message: 'Book deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ======================================================
// 🤖 AI QUERY AGENT (ADMIN ONLY) — OLLAMA HTTP API
// ======================================================
router.post('/ai-query', authMiddleware, isAdmin, async (req, res) => {
  const { query } = req.body;
  try {
    let instruction = null;
    const q = query.toLowerCase();

    // ---------- RULE-BASED FALLBACK ----------
    if (q.includes("no books") || q.includes("zero books") || q.includes("without books")) {
      instruction = { type: "users_by_book_count", operator: "eq", value: 0 };
    } else if (q.includes("who owns the most books") || q.includes("most books")) {
      instruction = { type: "users_by_book_count", operator: "max" };
    } else if (q.includes("five most expensive")) {
      instruction = { type: "books_sorted", field: "price", order: "desc", limit: 5 };
    } else if (q.includes("most popular book")) {
      instruction = { type: "books_sorted", field: "popularity", order: "desc", limit: 1 };
    } else if (q.includes("how many books")) {
      instruction = { type: "books_stats", metric: "total" };
    } else if (q.includes("average price")) {
      instruction = { type: "books_stats", metric: "average_price" };
    }

    // ---------- CALL AI ONLY IF NO RULE MATCH ----------
    if (!instruction) {
      const prompt = `
You are an AI assistant for a library admin dashboard.

Convert the user question into ONE valid JSON action.

Allowed actions:

1. users_by_book_count
{
  "type": "users_by_book_count",
  "operator": "eq | gt | lt | max",
  "value": number
}

2. books_sorted
{
  "type": "books_sorted",
  "field": "price | popularity",
  "order": "asc | desc",
  "limit": number
}

3. books_stats
{
  "type": "books_stats",
  "metric": "total | average_price"
}

Respond ONLY with valid JSON.
Do NOT add explanations.

User question:
"${query}"
      `;

      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3.1',
          prompt,
          stream: false
        })
      });

      if (!response.ok) throw new Error('Ollama API error');

      const data = await response.json();

      // ---------- CLEAN AI RESPONSE ----------
      let aiResponse = data.response.trim();
      aiResponse = aiResponse.replace(/^\s*["']|["']\s*$/g, '');
      try {
        const aiInstr = JSON.parse(aiResponse);
        instruction = aiInstr;
      } catch (err) {
        console.error('Failed to parse AI output:', aiResponse);
        return res.json({ data: [], message: 'AI could not understand the query.' });
      }
    }

    // ---------- NORMALIZE AI INSTRUCTIONS ----------
    const mapType = instruction.type.toLowerCase();
    switch (mapType) {
      case 'user_with_most_books':
      case 'users_by_book_count_max':
        instruction = { type: 'users_by_book_count', operator: 'max' };
        break;

      case 'user_with_zero_books':
      case 'users_by_book_count_eq_0':
        instruction = { type: 'users_by_book_count', operator: 'eq', value: 0 };
        break;

      case 'most_popular_book':
        instruction = { type: 'books_sorted', field: 'popularity', order: 'desc', limit: 1 };
        break;

      case 'five_most_expensive_books':
        instruction = { type: 'books_sorted', field: 'price', order: 'desc', limit: 5 };
        break;

      case 'total_books':
        instruction = { type: 'books_stats', metric: 'total' };
        break;

      case 'average_book_price':
        instruction = { type: 'books_stats', metric: 'average_price' };
        break;
    }

    // ---------- EXECUTE ACTION ----------
    let result;
    switch (instruction.type) {
      case 'users_by_book_count':
        if (instruction.operator === 'max') {
          result = await User.aggregate([
            {
              $lookup: {
                from: 'books',
                let: { userId: '$_id' },
                pipeline: [{ $match: { $expr: { $eq: ['$owner', '$$userId'] } } }],
                as: 'books'
              }
            },
            { $addFields: { bookCount: { $size: '$books' } } },
            { $sort: { bookCount: -1 } },
            { $limit: 1 },
            { $project: { name: 1, email: 1, bookCount: 1 } }
          ]);
        } else {
          const operatorMap = { eq: '$eq', gt: '$gt', lt: '$lt' };
          result = await User.aggregate([
            {
              $lookup: {
                from: 'books',
                let: { userId: '$_id' },
                pipeline: [{ $match: { $expr: { $eq: ['$owner', '$$userId'] } } }],
                as: 'books'
              }
            },
            { $addFields: { bookCount: { $size: '$books' } } },
            {
              $match: {
                bookCount: { [operatorMap[instruction.operator]]: instruction.value }
              }
            },
            { $project: { name: 1, email: 1, bookCount: 1 } }
          ]);
        }
        break;

      case 'books_sorted':
        if (instruction.field === 'popularity') {
          result = await Book.aggregate([
            { $group: { _id: '$title', count: { $sum: 1 } } },
            { $sort: { count: instruction.order === 'asc' ? 1 : -1 } },
            { $limit: instruction.limit || 5 }
          ]);
        } else {
          result = await Book.find()
            .sort({ price: instruction.order === 'asc' ? 1 : -1 })
            .limit(instruction.limit || 5);
        }
        break;

      case 'books_stats':
        if (instruction.metric === 'total') {
          result = await Book.countDocuments();
        } else if (instruction.metric === 'average_price') {
          result = await Book.aggregate([{ $group: { _id: null, avgPrice: { $avg: '$price' } } }]);
        }
        break;

      default:
        return res.json({ data: [], message: 'Query not supported.' });
    }

    res.json({ data: result });
  } catch (err) {
    console.error('AI query error:', err);
    res.status(500).json({ error: 'AI query failed.' });
  }
});

module.exports = router;

// routes/user.js
const express = require('express');
const fetch = require('node-fetch'); // ✅ REQUIRED
const authMiddleware = require('../middlewares/authMiddleware');
const userRouter = express.Router();
const User = require('../models/UserModel');
const Book = require('../models/BookModel');

// =======================
// TEST ENDPOINT
// =======================
userRouter.get('/', authMiddleware, (req, res) => {
  res.send('User endpoint is working!');
});

// =======================
// GET CURRENT USER
// =======================
userRouter.get('/me', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId)
      .select('-password')
      .populate('booksOwned');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// =======================
// 🤖 AI QUERY AGENT (USER)
// =======================
userRouter.post('/ai-query', authMiddleware, async (req, res) => {
  const { query } = req.body;
  const userId = req.userId;

  try {
    if (!query || !query.trim()) {
      return res.json({ data: [] });
    }

    const lowerQuery = query.toLowerCase();

    // =======================
    // ✅ RULE-BASED FALLBACKS
    // =======================
    if (lowerQuery.includes('how many books')) {
      const count = await Book.countDocuments({ owner: userId });
      return res.json({
        data: [{ label: 'Books Owned', value: count }]
      });
    }

    if (lowerQuery.includes('list my books')) {
      const books = await Book.find({ owner: userId }).select('title price');
      return res.json({ data: books });
    }

    // =======================
    // AI PART (OLLAMA)
    // =======================
    const user = await User.findById(userId).populate('booksOwned');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const books = user.booksOwned || [];

    const prompt = `
You are an AI assistant for a single library user.

User books:
${books.map(b => `- ${b.title} ($${b.price})`).join('\n')}

Answer ONLY in valid JSON.

Allowed formats:
1. { "type": "count", "count": number }
2. { "type": "books", "books": [ { "title": string, "price": number } ] }

User question: "${query}"
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

    if (!response.ok) {
      throw new Error('Ollama API failed');
    }

    const data = await response.json();

    let aiOutput;
    try {
      aiOutput = JSON.parse(data.response.trim());
    } catch (err) {
      console.error('Invalid AI JSON:', data.response);
      return res.json({ data: [] });
    }

    // =======================
    // FORMAT RESPONSE
    // =======================
    if (aiOutput.type === 'count') {
      return res.json({
        data: [{ label: 'Books Owned', value: aiOutput.count }]
      });
    }

    if (aiOutput.type === 'books') {
      return res.json({ data: aiOutput.books });
    }

    res.json({ data: [] });

  } catch (err) {
    console.error('User AI query error:', err);
    res.status(500).json({ error: 'AI query failed' });
  }
});

module.exports = userRouter;

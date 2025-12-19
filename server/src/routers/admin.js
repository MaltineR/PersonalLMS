const express = require("express");
const router = express.Router();

const User = require("../models/UserModel");
const Book = require("../models/BookModel");

const authMiddleware = require("../middlewares/authMiddleware");
const isAdmin = require("../middlewares/isAdmin");

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const OLLAMA_HOST = process.env.OLLAMA_HOST || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.1";


router.get("/users", authMiddleware, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


router.get("/books", authMiddleware, isAdmin, async (req, res) => {
  try {
    const books = await Book.find().populate("owner", "name email");
    res.json(books);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


router.delete("/users/:id", authMiddleware, isAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


router.delete("/books/:id", authMiddleware, isAdmin, async (req, res) => {
  try {
    await Book.findByIdAndDelete(req.params.id);
    res.json({ message: "Book deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Library Insights 

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
          as: "books",
        },
      },
      {
        $addFields: {
          booksRead: {
            $size: {
              $filter: {
                input: "$books",
                as: "b",
                cond: { $eq: ["$$b.readingstatus", "read"] },
              },
            },
          },
        },
      },
      { $sort: { booksRead: -1 } },
      { $limit: 3 },
      { $project: { name: 1, email: 1, booksRead: 1 } },
    ]);

    // Genres
    const allBooks = await Book.find();
    const genreCounts = {};
    allBooks.forEach((b) => {
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
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load insights" });
  }
});


// User Insights

router.get("/user-insights/:id", authMiddleware, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("name email");
    if (!user) return res.status(404).json({ message: "User not found" });

    const books = await Book.find({ owner: user._id });

    if (books.length === 0) {
      return res.json({
        user,
        summary: "This user has not added any books yet.",
        aiInsights: ""
      });
    }

    const totalBooks = books.length;
    const booksRead = books.filter(b => b.readingstatus === "read").length;
    const avgPages = Math.round(
      books.reduce((sum, b) => sum + (b.totalpages || 0), 0) / totalBooks
    );

    const genreCounts = {};
    books.forEach(b => {
      if (b.genre) genreCounts[b.genre] = (genreCounts[b.genre] || 0) + 1;
    });

    const topGenre =
      Object.keys(genreCounts).length > 0
        ? Object.keys(genreCounts).reduce((a, b) =>
            genreCounts[a] > genreCounts[b] ? a : b
          )
        : "unknown";

    
  const prompt = `
You are an analytics assistant.

Based on the data below, generate 2–4 short insights.
Each insight must be one clear sentence.
Use the user's name when relevant.

Data:
- Name: ${user.name}
- Total books: ${totalBooks}
- Books read: ${booksRead}
- Average pages per book: ${avgPages}
- Most read genre: ${topGenre}

Rules:
- Write insights like examples below
- Do NOT explain calculations
- Do NOT mention statistics explicitly

Examples:
- "Fantasy is the most read genre."
- "${user.name} tends to read short books."
- "${user.name} usually finishes their books."

Output format:
Return each insight on a new line.
Do NOT add extra text.
`; 
    const response = await fetch(
      `${process.env.OLLAMA_HOST}/api/generate`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: process.env.OLLAMA_MODEL,
          prompt,
          stream: false
        })
      }
    );

    if (!response.ok) {
      throw new Error("Ollama request failed");
    }

    const data = await response.json();

    res.json({
      user,
      stats: { totalBooks, booksRead, avgPages, topGenre },
      aiInsights: data.response.trim()
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to generate AI insights" });
  }
});

// AI QUERY

router.post("/ai-query", authMiddleware, isAdmin, async (req, res) => {
  const { query } = req.body;

  try {
    if (!query || !query.trim()) {
      return res.status(400).json({ error: "Query is empty." });
    }

    const q = query.toLowerCase().replace(/[^\w\s]/g, "").trim();
    console.log("Received query:", query);
    console.log("Normalized query:", q);

    
    // Rule-Based Queries
    
    let instruction = null;

    if (q.includes("no books") || q.includes("zero books") || q.includes("without books")) {
      instruction = { type: "users_by_book_count", operator: "eq", value: 0 };
    } else if (q.includes("who owns the most books") || q.includes("most books") || q.includes("user with most books")) {
      instruction = { type: "users_by_book_count", operator: "max" };
    } else if (q.includes("five most expensive") || q.includes("5 most expensive") || q.includes("top 5 expensive")) {
      instruction = { type: "books_sorted", field: "price", order: "desc", limit: 5 };
    } else if (q.includes("most popular book") || q.includes("popular book")) {
      instruction = { type: "most_popular_book" };
    }

    let result;

    if (instruction) {
      console.log("Rule-based match:", instruction);

      switch (instruction.type) {
        case "users_by_book_count":
          if (instruction.operator === "max") {
            result = await User.aggregate([
              {
                $lookup: {
                  from: "books",
                  let: { userId: "$_id" },
                  pipeline: [{ $match: { $expr: { $eq: ["$owner", "$$userId"] } } }],
                  as: "books",
                },
              },
              { $addFields: { bookCount: { $size: "$books" } } },
              { $sort: { bookCount: -1 } },
              { $limit: 1 },
              { $project: { name: 1, email: 1, bookCount: 1 } },
            ]);
          } else if (instruction.operator === "eq") {
            result = await User.aggregate([
              {
                $lookup: {
                  from: "books",
                  let: { userId: "$_id" },
                  pipeline: [{ $match: { $expr: { $eq: ["$owner", "$$userId"] } } }],
                  as: "books",
                },
              },
              { $addFields: { bookCount: { $size: "$books" } } },
              { $match: { bookCount: instruction.value } },
              { $project: { name: 1, email: 1, bookCount: 1 } },
            ]);
          }
          break;

        case "books_sorted":
          result = await Book.find()
            .populate("owner", "name email")
            .sort({ [instruction.field]: instruction.order === "asc" ? 1 : -1 })
            .limit(instruction.limit || 5)
            .select("title author price owner");
          break;

        case "most_popular_book":
          const popular = await Book.aggregate([
            { $group: { _id: "$title", count: { $sum: 1 }, author: { $first: "$author" } } },
            { $sort: { count: -1 } },
            { $limit: 1 },
          ]);
          result = popular.map(b => ({
            title: b._id,
            author: b.author,
            count: b.count
          }));
          break;
      }

      return res.json({
        data: result,
        method: "rule-based",
        query: query,
        message: "Query processed using rule-based system",
      });
    }

    
    // Ollama AI 
    const users = await User.find().select("name email").lean();
    const books = await Book.find()
      .select("title author owner price genre readingstatus totalpages")
      .populate("owner", "name email")
      .lean();

    const prompt = `
You are a library data assistant. Use ONLY the data below to answer the query.

Users:
${users.map(u => `- ${u.name} (${u.email})`).join("\n")}

Books:
${books.map(b => `- "${b.title}" by ${b.author || "Unknown"}, Owner: ${b.owner?.name || "Unknown"}, Genre: ${b.genre || "N/A"}, Status: ${b.readingstatus || "N/A"}, Price: $${b.price || 0}, Pages: ${b.totalpages || "N/A"}`).join("\n")}

User Query: "${query}"

Instructions:
- Answer in JSON only.
- Allowed formats:
  1. { "type": "users", "users": [{ "name": string, "email": string, "bookCount": number }] }
  2. { "type": "books", "books": [{ "title": string, "author": string, "owner": string, "price": number }] }
  3. { "type": "count", "count": number }
- Only include data from above.
`;

    const response = await fetch(`${OLLAMA_HOST}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt,
        stream: false,
        options: { temperature: 0.2, num_predict: 500 },
      }),
    });

    if (!response.ok) throw new Error(`Ollama API error: ${response.statusText}`);

    const data = await response.json();

    let aiOutput;
    try {
      aiOutput = JSON.parse(data.response.trim());
    } catch (err) {
      console.error("Invalid AI JSON:", data.response);
      return res.json({ data: [] });
    }

    
    if (aiOutput.type === "users") {
      return res.json({ data: aiOutput.users });
    }
    if (aiOutput.type === "books") {
      return res.json({ data: aiOutput.books });
    }
    if (aiOutput.type === "count") {
      return res.json([{ label: "Count", value: aiOutput.count }]);
    }

    res.json({ data: [] });

  } catch (err) {
    console.error("AI query error:", err);
    res.status(500).json({
      error: "AI query failed",
      details: err.message,
    });
  }
});

module.exports = router;

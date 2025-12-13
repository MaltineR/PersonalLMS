import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/vars";
import { AuthContext } from "../hooks/AuthHOC";

const AdminBooks = () => {
  const { user } = useContext(AuthContext);
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState(""); // 🔍 search state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user || user.role !== "admin") return;

    const fetchBooks = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${BASE_URL}/api/v1/admin/books`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBooks(response.data);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Failed to fetch books");
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [user]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this book?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${BASE_URL}/api/v1/admin/books/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBooks(prev => prev.filter(b => b._id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete book");
    }
  };

  // 🔍 Filter books based on search
  const filteredBooks = books.filter(
    b =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase()) ||
      b.genre.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="p-10 text-2xl">Loading books...</div>;
  if (error) return <div className="p-10 text-red-500">{error}</div>;

  return (
    <div className="h-[calc(100%-80px)] w-[calc(100%-100px)] ml-[100px] px-10 flex flex-col gap-6 relative">
      <h1 className="text-[40px] font-bold">Manage Books</h1>

      {/* 🔍 Search input */}
      <input
        type="text"
        placeholder="Search by title, author, or genre..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-1/3 px-4 py-2 rounded-lg shadow bg-white outline-none"
      />

      {/* Book cards */}
      <div className="flex flex-col gap-4 mt-4">
        {filteredBooks.map(b => (
          <div
            key={b._id}
            className="grid grid-cols-6 gap-4 items-center px-6 py-4
                       rounded-xl bg-[var(--ternary-background)]
                       shadow-sm hover:shadow-md transition"
          >
            <span className="font-medium">{b.title}</span>
            <span>{b.author}</span>
            <span>{b.genre}</span>
            <span>{b.owner?.name || "—"}</span>

            {/* Status badge */}
            <span
              className={`px-3 py-1 rounded-full text-sm w-fit capitalize
                ${
                  b.readingstatus === "completed"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }
              `}
            >
              {b.readingstatus}
            </span>

            <button
              onClick={() => handleDelete(b._id)}
              className="w-fit px-3 py-1 text-sm rounded-full
                         bg-red-100 text-red-600
                         hover:bg-red-500 hover:text-white transition"
            >
              Delete
            </button>
          </div>
        ))}

        {filteredBooks.length === 0 && (
          <div className="text-center p-6 text-gray-500">No books found</div>
        )}
      </div>
    </div>
  );
};

export default AdminBooks;

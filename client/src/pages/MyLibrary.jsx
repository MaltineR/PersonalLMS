import { Search } from "lucide-react";
import { useState, useEffect } from "react";
import BookCard from "../components/BookCard";
import IssueBook from "../components/modal/IssueNewBook";
import axios from "axios";
import { BASE_URL } from "../utils/vars";

function MyLibrary() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [ownedBooks, setOwnedBooks] = useState([]);

  const getAuthToken = () => localStorage.getItem("token");

  const fetchOwnedBooks = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const response = await axios.get(`${BASE_URL}/api/v1/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOwnedBooks(response.data.user.booksOwned || []);
    } catch (err) {
      setError("Failed to fetch books");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOwnedBooks();
  }, []);

  const filteredBooks = ownedBooks.filter((book) =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddBook = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleSubmitBook = async (formData) => {
    try {
      setLoading(true);
      const token = getAuthToken();

      const bookData = {
        title: formData.title,
        author: formData.author,
        genre: formData.genre,
        totalpages: parseInt(formData.totalpages),
        pagesread: parseInt(formData.pagesread) || 0,
        price: parseFloat(formData.price) || 0,
        public: formData.public === true || formData.public === "true",
        statusofreading: formData.readingstatus || "to-read",
      };

      await axios.post(`${BASE_URL}/api/v1/book/addbook`, bookData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      fetchOwnedBooks();
      setIsModalOpen(false);
    } catch (err) {
      setError("Failed to add book");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBook = (bookId) => {
    setOwnedBooks((prev) => prev.filter((b) => b._id !== bookId));
  };

  const handleUpdateBook = (updatedBook) => {
    setOwnedBooks((prev) =>
      prev.map((b) => (b._id === updatedBook._id ? updatedBook : b))
    );
  };

  return (
    <div className="h-[calc(100%-80px)] w-[calc(100%-100px)] ml-[100px] px-10 flex flex-col gap-8 relative">
      <h1 className="text-[50px] font-bold">My Library</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex justify-between items-center">
          {error}
          <button
            onClick={() => setError(null)}
            className="text-red-500 font-bold text-xl hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {/* SEARCH + ADD BOOK */}
      <div className="flex w-full items-center gap-4 mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 p-3 rounded-xl border shadow-sm outline-none text-lg"
          placeholder="Search books..."
        />
        <div className="p-3 bg-[var(--ternary-background)] rounded-full">
          <Search size={24} />
        </div>
        <button
          onClick={handleAddBook}
          className="py-3 px-6 bg-[var(--primary)] text-white rounded-2xl hover:bg-[#2e876e] transition-colors"
        >
          Add Book
        </button>
      </div>

      {/* BOOK GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full text-gray-500 text-center">Loading books...</div>
        ) : filteredBooks.length > 0 ? (
          filteredBooks.map((book) => (
            <BookCard
              key={book._id}
              book={book}
              onDelete={handleDeleteBook}
              onUpdate={handleUpdateBook}
            />
          ))
        ) : (
          <div className="col-span-full text-gray-500 text-center">
            No books found.
          </div>
        )}
      </div>

      {isModalOpen && <IssueBook onClose={handleCloseModal} onSubmit={handleSubmitBook} />}
    </div>
  );
}

export default MyLibrary;

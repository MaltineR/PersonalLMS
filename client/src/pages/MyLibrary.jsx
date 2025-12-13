import { Filter, Search } from "lucide-react";
import { useState, useEffect } from "react";
import BookCard from "../components/BookCard";
import IssueBook from "../components/modal/IssueNewBook";
import axios from "axios";
import { BASE_URL } from "../utils/vars";

function MyLibrary() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [allBooks, setAllBooks] = useState([]);
  const [ownedBooks, setOwnedBooks] = useState([]);
  const [borrowedBooks, setBorrowedBooks] = useState([]);

  const getAuthToken = () => localStorage.getItem("token");

  const fetchAllBooks = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const response = await axios.get(`${BASE_URL}/api/v1/book/getallbooks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllBooks(response.data.books);
    } catch (err) {
      setError("Failed to fetch all books");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOwnedBooks = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const response = await axios.get(`${BASE_URL}/api/v1/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const owned = response.data.user.booksOwned || [];
      setOwnedBooks(owned);
    } catch (err) {
      setError("Failed to fetch owned books");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBorrowedBooks = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const response = await axios.get(`${BASE_URL}/api/v1/book/getborrowedbooks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBorrowedBooks(response.data.books || []);
    } catch (err) {
      setError("Failed to fetch borrowed books");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllBooks();
    fetchOwnedBooks();
    fetchBorrowedBooks();
  }, []);

  useEffect(() => {
    if (activeTab === "all") fetchAllBooks();
    else if (activeTab === "owned") fetchOwnedBooks();
    else fetchBorrowedBooks();
  }, [activeTab]);

  const books =
    activeTab === "all"
      ? allBooks
      : activeTab === "owned"
      ? ownedBooks
      : borrowedBooks;

  const filteredBooks = books.filter((book) =>
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

      if (activeTab === "all") fetchAllBooks();
      else if (activeTab === "owned") fetchOwnedBooks();

      setIsModalOpen(false);
    } catch (err) {
      setError("Failed to add book");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublicStatus = async (bookId, currentPublicStatus) => {
    try {
      const token = getAuthToken();
      await axios.put(
        `${BASE_URL}/api/v1/book/${bookId}/changepublicstatus`,
        { public: !currentPublicStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (activeTab === "all") fetchAllBooks();
      else if (activeTab === "owned") fetchOwnedBooks();
    } catch (err) {
      setError("Failed to update book status");
      console.error(err);
    }
  };

  // Delete book
  const handleDeleteBook = (bookId) => {
    setAllBooks((prev) => prev.filter((b) => b._id !== bookId));
    setOwnedBooks((prev) => prev.filter((b) => b._id !== bookId));
    setBorrowedBooks((prev) => prev.filter((b) => b._id !== bookId));
  };

  // Update book in state
  const handleUpdateBook = (updatedBook) => {
    setAllBooks((prev) => prev.map((b) => (b._id === updatedBook._id ? updatedBook : b)));
    setOwnedBooks((prev) => prev.map((b) => (b._id === updatedBook._id ? updatedBook : b)));
    setBorrowedBooks((prev) =>
      prev.map((b) => (b._id === updatedBook._id ? updatedBook : b))
    );
  };

  return (
    <div className="h-[calc(100%-80px)] w-[calc(100%-100px)] ml-[100px] px-10 flex flex-col gap-10 relative">
      <h1 className="text-[50px] font-bold">My Library</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      <div className="flex w-full items-center justify-center h-16 gap-7">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-white w-xl h-full rounded-3xl border border-none shadow-sm outline-none px-7 text-[20px]"
          placeholder="Search"
        />
        <div className="bg-[var(--primary)] p-4 rounded-full rounded-bl-none cursor-pointer">
          <Search size={30} />
        </div>
      </div>

      <div className="h-14 flex items-center justify-center">
        <div className="flex items-center gap-x-6">
          <div className="h-full flex gap-10 px-20 items-center rounded-xl">
            <button
              onClick={() => setActiveTab("all")}
              className={`py-2 px-4 rounded-xl transition-all ${
                activeTab === "all" ? "bg-[var(--primary)] text-white" : "bg-white"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab("owned")}
              className={`py-2 px-4 rounded-xl transition-all ${
                activeTab === "owned" ? "bg-[var(--primary)] text-white" : "bg-white"
              }`}
            >
              Owned
            </button>
          </div>

          <button
            onClick={handleAddBook}
            className="py-3 px-4 bg-[var(--primary)] rounded-2xl text-white  transition-colors"
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Book"}
          </button>
        </div>
      </div>

      <div className="w-full flex flex-wrap gap-5 overflow-x-auto py-5 bg-amber-30 ml-25">
        {loading ? (
          <div className="text-gray-500 text-lg">Loading books...</div>
        ) : filteredBooks.length > 0 ? (
          filteredBooks.map((book, idx) => (
            <BookCard
              key={book._id || idx}
              book={book}
              onDelete={handleDeleteBook}
              onUpdate={handleUpdateBook}
              onTogglePublic={handleTogglePublicStatus}
              isBorrowed={activeTab === "borrowed"}
            />
          ))
        ) : (
          <div className="text-gray-500 text-lg">No matching books found.</div>
        )}
      </div>

      {isModalOpen && <IssueBook onClose={handleCloseModal} onSubmit={handleSubmitBook} />}
    </div>
  );
}

export default MyLibrary;

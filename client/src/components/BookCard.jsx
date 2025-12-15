import { Album, Edit3 } from "lucide-react";
import { useState } from "react";
import EditPage from "./modal/EditBook";
import axios from "axios";
import { BASE_URL } from "../utils/vars";

function BookCard({ book, onDelete, onUpdate, onTogglePublic, isBorrowed }) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const toggleEditModal = () => {
    setIsEditModalOpen(!isEditModalOpen);
  };

  const handleSubmit = async (updatedBook) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${BASE_URL}/api/v1/book/books/${book._id}`,
        updatedBook,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (onUpdate) onUpdate(response.data.book);
      toggleEditModal();
    } catch (err) {
      console.error("Failed to update book:", err);
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${BASE_URL}/api/v1/book/books/${book._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (onDelete) onDelete(book._id);
    } catch (err) {
      console.error("Failed to delete book:", err);
    }
  };

  // Determine badge color based on readingstatus
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "read":
        return "bg-red-500 text-white";
      case "reading":
        return "bg-green-800 text-white";
      case "to-read":
        return "bg-yellow-400 text-white";
      default:
        return "bg-gray-300 text-black";
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 w-64 relative">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Album color={`${!book.public ? "green" : "red"}`} />
          </div>
          <button
            className="text-gray-400 hover:text-gray-600 p-1"
            onClick={handleDelete}
          >
            x
          </button>
        </div>

        <h3 className="text-xl font-semibold text-black">{book.title}</h3>
        <p className="text-[var(--grey)] text-sm mb-3">{book.author}</p>
        <p className="text-[var(--grey)] text-sm mb-3">Genre: {book.genre}</p>

        <div className="mb-4">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
              book.readingstatus
            )}`}
          >
            {book.readingstatus}
          </span>
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-700 text-md font-medium">Progress</span>
            <span className="text-gray-500 text-xs">
              {book.pagesread}/{book.totalpages} pages
            </span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-300 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(book.pagesread / book.totalpages) * 100}%` }}
            ></div>
          </div>
        </div>

        <button
          onClick={toggleEditModal}
          className="ml-auto right-4 w-8 h-8 bg-green-800 rounded-full flex items-center justify-center text-white hover:bg-green-700 transition-colors"
        >
          <Edit3 size={16} />
        </button>
      </div>

      {isEditModalOpen && (
        <EditPage
          book={book}
          onSubmit={handleSubmit}
          onClose={toggleEditModal}
        />
      )}
    </>
  );
}

export default BookCard;

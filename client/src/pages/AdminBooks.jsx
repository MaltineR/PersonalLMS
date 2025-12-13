import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/vars";
import { AuthContext } from "../hooks/AuthHOC";

const AdminBooks = () => {
  const { user } = useContext(AuthContext);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;
    if (user.role !== "admin") return;

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

  if (loading) return <div className="p-10 text-2xl">Loading books...</div>;
  if (error) return <div className="p-10 text-red-500">{error}</div>;

  return (
    <div className="h-[calc(100%-80px)] w-[calc(100%-100px)] ml-[100px] px-10 flex flex-col gap-6 relative">
      <h1 className="text-[40px] font-bold">Manage Books</h1>
      <table className="w-full border-collapse mt-4">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-3 border">Title</th>
            <th className="p-3 border">Author</th>
            <th className="p-3 border">Genre</th>
            <th className="p-3 border">Owner</th>
            <th className="p-3 border">Status</th>
            <th className="p-3 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {books.map(b => (
            <tr key={b._id} className="hover:bg-gray-100">
              <td className="p-3 border">{b.title}</td>
              <td className="p-3 border">{b.author}</td>
              <td className="p-3 border">{b.genre}</td>
              <td className="p-3 border">{b.owner?.name || "—"}</td>
              <td className="p-3 border">{b.readingstatus}</td>
              <td className="p-3 border">
                <button
                  onClick={() => handleDelete(b._id)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminBooks;

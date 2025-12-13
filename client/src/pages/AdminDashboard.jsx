import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../hooks/AuthHOC";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../utils/vars";

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;
    if (user.role !== "admin") navigate("/dashboard"); // redirect non-admins

    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");

        const config = {
          headers: { Authorization: `Bearer ${token}` },
        };

        const [usersRes, booksRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/v1/admin/users`, config),
          axios.get(`${BASE_URL}/api/v1/admin/books`, config),
        ]);

        setUsers(usersRes.data);
        setBooks(booksRes.data);
      } catch (err) {
        console.error("Admin dashboard fetch error:", err);
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, navigate]);

  if (loading) return <div className="p-10 text-xl">Loading admin dashboard...</div>;
  if (error) return <div className="p-10 text-red-500">Error: {error}</div>;

  return (
    <div className="h-[calc(100%-80px)] w-[calc(100%-100px)] ml-[100px] px-10 flex flex-col gap-6 relative">
      <div>
        <h1 className="text-[60px] font-bold">Admin Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-[30px]">Welcome,</span>
          <span className="text-[30px] text-[#2e876e]">{user?.name}</span>
        </div>
        <div className="text-right italic text-gray-600 mt-2">
          "With great power comes great responsibility."
        </div>
      </div>

      <div className="flex gap-10 mt-6">
        <div className="bg-[var(--ternary-background)] text-black px-6 pt-5 pb-3 rounded-xl shadow-md w-1/6">
          <p className="text-xl mb-3 font-medium">Total Users</p>
          <p className="text-4xl font-semibold text-right">{users.length}</p>
        </div>
        <div className="bg-[var(--ternary-background)] text-black px-6 pt-5 pb-3 rounded-xl shadow-md w-1/6">
          <p className="text-xl mb-3 font-medium">Total Books</p>
          <p className="text-4xl font-semibold text-right">{books.length}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

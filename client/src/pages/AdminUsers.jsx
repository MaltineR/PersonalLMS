import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/vars";
import { AuthContext } from "../hooks/AuthHOC";

const AdminUsers = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user || user.role !== "admin") return;

    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${BASE_URL}/api/v1/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data);
      } catch (err) {
        setError("Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [user]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${BASE_URL}/api/v1/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(prev => prev.filter(u => u._id !== id));
    } catch {
      alert("Delete failed");
    }
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="p-10 text-2xl">Loading users...</div>;
  if (error) return <div className="p-10 text-red-500">{error}</div>;

  return (
    <div className="h-[calc(100%-80px)] w-[calc(100%-100px)] ml-[100px] px-10 flex flex-col gap-6">
      <h1 className="text-[40px] font-bold">Manage Users</h1>

      <input
        placeholder="Search users..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-1/3 px-4 py-2 rounded-lg bg-white shadow outline-none"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredUsers.map(u => (
          <div
            key={u._id}
            className="bg-[var(--ternary-background)] rounded-2xl p-6 shadow-md flex flex-col gap-2"
          >
            <p className="text-xl font-semibold">{u.name}</p>
            <p className="text-gray-600">{u.email}</p>
            <p className="text-sm italic">Role: {u.role}</p>

            {u._id !== user._id ? (
              <button
                onClick={() => handleDelete(u._id)}
                className="mt-4 w-fit px-4 py-1 text-sm rounded-full
                           bg-red-100 text-red-600
                           hover:bg-red-500 hover:text-white transition"
              >
                Delete
              </button>
            ) : (
              <span className="mt-4 text-sm text-gray-400 italic">You</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminUsers;

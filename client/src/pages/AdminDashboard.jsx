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

  // 🤖 AI QUERY STATES
  const [aiQuery, setAiQuery] = useState("");
  const [aiResult, setAiResult] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  useEffect(() => {
    if (!user) return;
    if (user.role !== "admin") navigate("/dashboard");

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

  // 🤖 HANDLE AI QUERY (FIXED)
  const handleAIQuery = async () => {
    if (!aiQuery.trim() || aiLoading) return;

    try {
      setAiLoading(true);
      setAiError(null);
      setAiResult([]);

      const token = localStorage.getItem("token");
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      const res = await axios.post(
        `${BASE_URL}/api/v1/admin/ai-query`,
        { query: aiQuery },
        config
      );

      const data = res.data?.data;

      // ✅ VALID EMPTY RESULT
      if (Array.isArray(data)) {
        if (data.length === 0) {
          setAiError("No results match this query.");
        } else {
          setAiResult(data);
        }
      }
      // ✅ VALID NON-ARRAY RESULT (stats)
      else if (data !== undefined && data !== null) {
        setAiResult([data]);
      }
      // ❌ AI FAILURE
      else {
        setAiError("AI failed to understand the query.");
      }

    } catch (err) {
      console.error("AI query error:", err);
      setAiError("Failed to process AI query.");
    } finally {
      setAiLoading(false);
    }
  };

  if (loading)
    return <div className="p-10 text-xl">Loading admin dashboard...</div>;
  if (error)
    return <div className="p-10 text-red-500">Error: {error}</div>;

  return (
    <div className="h-[calc(100%-80px)] w-[calc(100%-100px)] ml-[100px] px-10 flex flex-col gap-6 relative">
      {/* HEADER */}
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

      {/* STATS */}
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

      {/* 🤖 AI QUERY ASSISTANT */}
      <div className="bg-white rounded-xl shadow-md p-6 mt-8">
        <h2 className="text-2xl font-semibold mb-4">AI Query Assistant</h2>
        <div className="flex gap-4">
          <input
            type="text"
            className="border p-3 flex-1 rounded-md"
            placeholder='Ask something like: "Show users with no books"'
            value={aiQuery}
            onChange={(e) => setAiQuery(e.target.value)}
          />
          <button
            onClick={handleAIQuery}
            className={`px-6 rounded-md text-white ${
              aiLoading ? "bg-gray-400 cursor-not-allowed" : "bg-[#2e876e]"
            }`}
            disabled={aiLoading}
          >
            {aiLoading ? "Thinking..." : "Ask AI"}
          </button>
        </div>

        {aiError && <p className="mt-4 text-red-500">{aiError}</p>}

        {/* RESULTS */}
{aiResult.length > 0 && (
  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {aiResult.map((row, idx) => {
      // remove _id from row
      const displayRow = { ...row };
      delete displayRow._id;

      return (
        <div
          key={idx}
          className="bg-green-50 shadow-md rounded-lg p-4 flex flex-col gap-2"
        >
          {Object.entries(displayRow).map(([key, val]) => (
            <div key={key} className="flex justify-between">
              <span className="font-semibold capitalize">{key}</span>
              <span>{typeof val === "object" ? JSON.stringify(val) : val}</span>
            </div>
          ))}
        </div>
      );
    })}
  </div>
)}

      </div>
    </div>
  );
};

export default AdminDashboard;

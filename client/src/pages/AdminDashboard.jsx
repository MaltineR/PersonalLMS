import { useContext, useEffect, useState, useRef } from "react";
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

  const [aiQuery, setAiQuery] = useState("");
  const [aiResult, setAiResult] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  const [insights, setInsights] = useState(null);
  const [selectedUser, setSelectedUser] = useState("");
  const [userInsights, setUserInsights] = useState(null);

  const insightsRef = useRef(null);

  useEffect(() => {
    if (insights && insightsRef.current) {
      insightsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [insights]);

  useEffect(() => {
    if (!user) return;
    if (user.role !== "admin") navigate("/dashboard");

    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");

        const config = { headers: { Authorization: `Bearer ${token}` } };

        const [usersRes, booksRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/v1/admin/users`, config),
          axios.get(`${BASE_URL}/api/v1/admin/books`, config),
        ]);

        setUsers(usersRes.data || []);
        setBooks(booksRes.data || []);
      } catch (err) {
        console.error("Admin dashboard fetch error:", err);
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, navigate]);

  // AI Query
  const handleAIQuery = async () => {
    if (!aiQuery.trim() || aiLoading) return;

    try {
      setAiLoading(true);
      setAiError(null);
      setAiResult([]);

      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const res = await axios.post(
        `${BASE_URL}/api/v1/admin/ai-query`,
        { query: aiQuery },
        config
      );

      const data = res.data?.data;

      if (Array.isArray(data)) {
        if (data.length === 0) setAiError("No results match this query.");
        else setAiResult(data);
      } else if (data !== undefined && data !== null) {
        setAiResult([data]);
      } else {
        setAiError("AI failed to understand the query.");
      }
    } catch (err) {
      console.error("AI query error:", err);
      setAiError("Failed to process AI query.");
    } finally {
      setAiLoading(false);
    }
  };

  // Library Insights
  const loadLibraryInsights = async () => {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${BASE_URL}/api/v1/admin/library-insights`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setInsights(res.data);

    if (selectedUser) loadUserInsights(selectedUser); // load user insights too
  };

  // User Insights
  const loadUserInsights = async (userId) => {
    if (!userId) return;
    const token = localStorage.getItem("token");
    const res = await axios.get(
      `${BASE_URL}/api/v1/admin/user-insights/${userId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setUserInsights(res.data);
  };

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

      <div className="flex gap-6 mt-6">
        <div className="bg-[var(--ternary-background)] text-black px-6 pt-5 pb-3 rounded-xl shadow-md w-1/6 flex flex-col justify-between">
          <p className="text-xl mb-3 font-medium">Total Users</p>
          <p className="text-4xl font-semibold text-right">{users.length}</p>
        </div>
        <div className="bg-[var(--ternary-background)] text-black px-6 pt-5 pb-3 rounded-xl shadow-md w-1/6 flex flex-col justify-between">
          <p className="text-xl mb-3 font-medium">Total Books</p>
          <p className="text-4xl font-semibold text-right">{books.length}</p>
        </div>
        <div
          onClick={loadLibraryInsights}
          className="bg-[#2e876e] text-white px-6 pt-5 pb-3 rounded-xl shadow-md w-1/4 cursor-pointer flex flex-col justify-center items-center hover:bg-[#2d7a67] transition"
        >
          <p className="text-xl mb-2 font-medium">Insights Dashboard</p>
          <p className="text-2xl font-semibold">View</p>
        </div>
      </div>

      {/* AI Query */}
      <div className="bg-white rounded-xl shadow-md p-6 mt-6">
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
            className={`px-6 rounded-md text-white ${aiLoading ? "bg-gray-400 cursor-not-allowed" : "bg-[#2e876e]"}`}
            disabled={aiLoading}
          >
            {aiLoading ? "Thinking..." : "Ask AI"}
          </button>
        </div>

        {aiError && <p className="mt-4 text-red-500">{aiError}</p>}

        {Array.isArray(aiResult) && aiResult.length > 0 && (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {aiResult.map((row, idx) => {
              const displayRow = { ...row };
              delete displayRow._id;
              return (
                <div key={idx} className="bg-green-50 shadow-md rounded-lg p-4 flex flex-col gap-2">
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

      {/* Insights Dashboard */}
      {insights && (
        <div ref={insightsRef} className="bg-white shadow-lg rounded-xl p-6 mt-6 relative">
          <button
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-xl font-bold"
            onClick={() => { setInsights(null); setUserInsights(null); }}
          >
            ×
          </button>

          <h2 className="text-2xl font-semibold mb-4">Insights Dashboard</h2>

          {/* Library Insights */}
          <div>
            <h3 className="font-semibold mb-2">Top Genres</h3>
            {Array.isArray(insights.genres) && insights.genres.map((g, i) => {
              const percentage = Math.min((g.count / (insights.totalBooks || 1)) * 100, 100);
              return (
                <div key={i} className="mb-2">
                  <p className="font-medium">{g.genre} ({g.count})</p>
                  <div className="w-full h-4 bg-gray-200 rounded-full">
                    <div className="h-4 bg-[#2d7a67] rounded-full" style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6">
            <h3 className="font-semibold mb-2">Top Readers</h3>
            {Array.isArray(insights.topReaders) && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {insights.topReaders.map((r, i) => (
                  <div key={i} className="bg-green-50 rounded-lg p-3 flex justify-between items-center shadow">
                    <span>{r.name}</span>
                    <span className="font-semibold">{r.booksRead} books</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* User Insights */}
          <div className="mt-6">
            <h3 className="font-semibold mb-2">Analyze User</h3>
            <select
              className="border p-3 rounded w-full mb-4"
              value={selectedUser}
              onChange={(e) => { setSelectedUser(e.target.value); loadUserInsights(e.target.value); }}
            >
              <option value="">Select user</option>
              {Array.isArray(users) && users.map((u) => (
                <option key={u._id} value={u._id}>{u.name}</option>
              ))}
            </select>

            {userInsights && (
              <div className="bg-green-50 p-4 rounded shadow mt-2 relative">
                <h4 className="font-bold mb-2">{userInsights.user.name}</h4>
                <p className="italic mb-2">{userInsights.summary}</p>
                <h5 className="font-semibold mb-1">Insights</h5>
                {Array.isArray(userInsights.insights) && (
                  <ul className="list-disc ml-5">
                    {userInsights.insights.map((i, idx) => <li key={idx}>{i}</li>)}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

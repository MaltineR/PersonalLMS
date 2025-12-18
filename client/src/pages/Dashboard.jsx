import React, { useState, useEffect } from "react";
import ContinueLearningBookCard from "../components/ContinueLearningBookCard";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../utils/vars";

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [allBooks, setAllBooks] = useState([]);
  const [readingBooks, setReadingBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  
  const [aiQuery, setAiQuery] = useState("");
  const [aiResult, setAiResult] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  
  const [recommendations, setRecommendations] = useState([]);
  const [recLoading, setRecLoading] = useState(false);
  const [recError, setRecError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    fetchRecommendations();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token");

      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [userRes, booksRes] = await Promise.all([
        axios.get(`${BASE_URL}/api/v1/user/me`, config),
        axios.get(`${BASE_URL}/api/v1/book/getallbooks`, config),
      ]);

      const userData = userRes.data.user;
      setUser(userData);

      const books = booksRes.data.books || [];
      setAllBooks(books);

      setReadingBooks(
        books.filter((b) => b.readingstatus?.toLowerCase() === "reading")
      );
    } catch (err) {
      console.error(err);
      setError("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleAIQuery = async () => {
    if (!aiQuery.trim() || aiLoading) return;

    try {
      setAiLoading(true);
      setAiError(null);
      setAiResult([]);

      const token = localStorage.getItem("token");

      const res = await axios.post(
        `${BASE_URL}/api/v1/user/ai-query`,
        { query: aiQuery },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = res.data?.data;
      if (Array.isArray(data) && data.length > 0) {
        setAiResult(data);
      } else {
        setAiError("No results found.");
      }
    } catch (err) {
      console.error(err);
      setAiError("AI failed to process the query.");
    } finally {
      setAiLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    try {
      setRecLoading(true);
      setRecError(null);
      setRecommendations([]);

      const token = localStorage.getItem("token");

      const res = await axios.get(`${BASE_URL}/api/v1/user/recommendations`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setRecommendations(res.data.data || []);
    } catch (err) {
      console.error(err);
      setRecError("Failed to fetch recommendations.");
    } finally {
      setRecLoading(false);
    }
  };

  if (loading) return <div className="p-10 text-xl">Loading dashboard...</div>;
  if (error) return <div className="p-10 text-red-500">{error}</div>;

  return (
    <div className="h-[calc(100%-80px)] w-[calc(100%-100px)] ml-[100px] px-10 flex flex-col gap-6 relative">
      
      <div>
        <h1 className="text-[60px] font-bold">Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-[30px]">Welcome,</span>
          <span className="text-[30px] text-[#2e876e]">{user?.name}</span>
        </div>
        <div className="text-right italic text-gray-600 mt-2">
          "A reader lives a thousand lives before he dies."
        </div>
      </div>

      
      <div className="flex gap-10 mt-6">
        <div className="bg-[var(--ternary-background)] px-6 pt-5 pb-3 rounded-xl shadow-md w-1/4">
          <p className="text-xl mb-3 font-medium">My Books</p>
          <p className="text-4xl font-semibold text-right">
            {user?.booksOwned?.length || 0}
          </p>
        </div>

        <div className="bg-[var(--ternary-background)] px-6 pt-5 pb-3 rounded-xl shadow-md w-1/4">
          <p className="text-xl mb-3 font-medium">Currently Reading</p>
          <p className="text-4xl font-semibold text-right">{readingBooks.length}</p>
        </div>
      </div>
{/* Continue Reading Card */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Continue Reading</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {readingBooks.length > 0 ? (
            readingBooks.map((book) => (
              <ContinueLearningBookCard
                key={book._id}
                book={book}
                onClick={() => navigate("/mylibrary")}
                showProgress
              />
            ))
          ) : (
            <p className="text-gray-500">No books currently being read</p>
          )}
        </div>
      </div>
     

      {/* Recommended books */}
      <div className="bg-white rounded-xl shadow-md p-6 mt-8">
        <h2 className="text-2xl font-semibold mb-4">Recommended for You</h2>
        {recLoading && <p className="italic">Generating recommendations...</p>}
        {recError && <p className="text-red-500">{recError}</p>}
        {!recLoading && !recError && recommendations.length === 0 && (
          <p>No recommendations yet.</p>
        )}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
  {recommendations.map((book, idx) => (
    <div
      key={idx}
      className="bg-green-50 shadow-md rounded-lg p-4 flex flex-col gap-2"
    >
      <p className="font-semibold text-lg">{book.title}</p>
      <p className="italic text-gray-700">{book.genre}</p>
      {book.reason && <p className="text-sm">{book.reason}</p>}
    </div>
  ))}
</div>
      </div>
       {/* AI search */}
      <div className="bg-white rounded-xl shadow-md p-6 mt-8">
        <h2 className="text-2xl font-semibold mb-4">AI Assistant</h2>
        <div className="flex gap-4">
          <input
            type="text"
            className="border p-3 flex-1 rounded-md"
            placeholder='Ask: "List all the books i own"'
            value={aiQuery}
            onChange={(e) => setAiQuery(e.target.value)}
          />
          <button
            onClick={handleAIQuery}
            disabled={aiLoading}
            className={`px-6 rounded-md text-white ${
              aiLoading ? "bg-gray-400 cursor-not-allowed" : "bg-[#2e876e]"
            }`}
          >
            {aiLoading ? "Thinking..." : "Ask AI"}
          </button>
        </div>
        {aiError && <p className="mt-4 text-red-500">{aiError}</p>}
        {aiResult.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {aiResult.map((item, idx) => (
              <div
                key={idx}
                className="bg-green-50 shadow-md rounded-lg p-4 flex flex-col gap-2"
              >
                {Object.entries(item)
                  .filter(([key]) => key !== "_id")
                  .map(([key, value]) => (
                    <p key={key} className="text-l mb-3">
                      <span className="font-semibold capitalize">
                        {key.replace(/_/g, " ")}:
                      </span>{" "}
                      {value}
                    </p>
                  ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;

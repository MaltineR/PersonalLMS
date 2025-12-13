import React, { useState, useEffect } from 'react';
import BookCard from '../components/BookCard';
import ContinueLearningBookCard from '../components/ContinueLearningBookCard';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from '../utils/vars';

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [allBooks, setAllBooks] = useState([]);
  const [readingBooks, setReadingBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    borrowedBooks: 0,
    booksLent: 0,
    booksRead: 0
  });
  const [noOfBooksLent, setNoOfBooksLent] = useState(0);
  const [noOfBooksOwned, setNoOfBooksOwned] = useState(0);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [userRes, booksRes, statsRes] = await Promise.all([
        axios.get(`${BASE_URL}/api/v1/user/me`, config),
        axios.get(`${BASE_URL}/api/v1/book/getallbooks`, config),
        axios.get(`${BASE_URL}/api/v1/book/dashboard/stats`, config).catch(() => ({
          data: { stats: { borrowedBooks: 0, booksLent: 0, booksRead: 0 } }
        }))
      ]);

      const userData = userRes.data.user;
      setUser(userData);
      setNoOfBooksLent(userData.noofbooksLent || 0);
      setNoOfBooksOwned(userData.booksOwned?.length || 0);

      const books = booksRes.data.books || [];
      setAllBooks(books);

      const currentlyReading = books.filter(book => book.readingstatus.toLowerCase() === 'reading');
      setReadingBooks(currentlyReading);

      setStats(statsRes.data.stats || { borrowedBooks: 0, booksLent: 0, booksRead: 0 });

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleContinueReading = () => {
    navigate('/mylibrary');
  };

  if (loading) {
    return <div className="h-[calc(100%-80px)] w-[calc(100%-100px)] ml-[100px] px-10 flex items-center justify-center">Loading dashboard...</div>;
  }

  if (error) {
    return (
      <div className="h-[calc(100%-80px)] w-[calc(100%-100px)] ml-[100px] px-10 flex items-center justify-center">
        <div className="text-red-500 text-2xl">
          {error}
          <button onClick={fetchDashboardData} className="block mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100%-80px)] w-[calc(100%-100px)] ml-[100px] px-10 flex flex-col gap-6 relative">
      {/* Welcome Section */}
      <div>
        <h1 className="text-[60px] font-bold">Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-[30px]">Welcome</span>
          <span className="text-[30px] text-[#9883D5]">{user?.name}</span>
        </div>
        <div className="text-right italic text-gray-600 mt-2">
          "A reader lives a thousand lives before he dies. The man who never reads lives only one."
          <span className="block">— George R.R. Martin</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="flex gap-10 mt-6">
        <div className="bg-[var(--ternary-background)] text-black px-6 pt-5 pb-3 rounded-xl shadow-md w-1/6">
          <p className="text-xl mb-3 font-medium">Books Owned</p>
          <p className="text-4xl font-semibold text-right">{noOfBooksOwned}</p>
        </div>
        <div className="bg-[var(--ternary-background)] text-black px-6 pt-5 pb-3 rounded-xl shadow-md w-1/6">
          <p className="text-xl mb-3 font-medium">Total Books</p>
          <p className="text-4xl font-semibold text-right">{allBooks.length}</p>
        </div>
        <div className="bg-[var(--ternary-background)] text-black px-6 pt-5 pb-3 rounded-xl shadow-md w-1/6">
          <p className="text-xl mb-3 font-medium">Current Reading</p>
          <p className="text-4xl font-semibold text-right">{readingBooks.length}</p>
        </div>
      </div>

      {/* Continue Reading Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Continue Reading</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {readingBooks.length > 0 ? (
            readingBooks.map(book => (
              <ContinueLearningBookCard key={book._id} book={book} onClick={handleContinueReading} showProgress />
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500 py-8">
              <p className="text-lg">No books currently being read</p>
              <p className="text-sm mt-2">Start reading a book to see it here!</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer Date */}
      <div className="mt-8 text-right text-gray-500">
        {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} | {new Date().toLocaleDateString('en-US', { weekday: 'long', hour: '2-digit', minute: '2-digit' })}
      </div>
    </div>
  );
}

export default Dashboard;

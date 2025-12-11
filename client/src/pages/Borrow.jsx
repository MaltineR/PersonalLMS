import React, { useState, useEffect } from 'react';
import { Trash2, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from '../utils/vars';
const Borrow = () => {
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch borrowed books (pending and approved requests where current user is borrower)
  const fetchBorrowedBooks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/v1/borrow/my-borrowed-books`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setBorrowedBooks(response.data.requests);
    } catch (err) {
      console.error('Error fetching borrowed books:', err);
      setError(err.response?.data?.message || 'Failed to fetch borrowed books');
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchBorrowedBooks();
  }, []);

  // Handle deleting completed borrow request
  const handleDeleteBook = async (requestId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${BASE_URL}/api/v1/borrow/delete-request/${requestId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Remove from state
      setBorrowedBooks(prev => prev.filter(book => book._id !== requestId));
    } catch (err) {
      console.error('Error deleting request:', err);
      alert(err.response?.data?.message || 'Failed to delete request');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-[#69C3EA] text-white';
      case 'pending':
        return 'bg-[#EEBE39] text-white';
      case 'overdue':
        return 'bg-[#E54335] text-white';
      case 'completed':
        return 'bg-[#34A353] text-white';
      default:
        return 'bg-[#8D8D8D] text-white';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved':
        return 'borrowed';
      case 'pending':
        return 'pending';
      case 'completed':
        return 'completed';
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB'); // DD/MM/YYYY format
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FCF8F5] p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-gray-600">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FCF8F5] p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-red-600">Error: {error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCF8F5] p-4 md:p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold">
            <Link to={'/book/borrow'} className="text-[#9883D5] hover:text-[#8571c7] transition-colors">
              Borrowed
            </Link>
            <span className="text-gray-400 mx-2">/</span>
            <Link to={'/book/lent'} className="text-gray-600 hover:text-[#9883D5] transition-colors">
              Lent
            </Link>
          </h1>
        </div>

        {/* Content */}
        <div className="mb-8">
          <h3 className="text-xl md:text-2xl font-medium mb-4">Books Borrowed</h3>
          
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {borrowedBooks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No books borrowed yet
              </div>
            ) : (
              borrowedBooks.map((request) => (
                <div
                  key={request._id}
                  className="bg-white w-full rounded-lg flex flex-col md:flex-row items-center justify-between p-4 shadow-sm border border-gray-200"
                >
                  <div className="w-full md:w-[40%] mb-3 md:mb-0">
                    <h2 className="text-lg font-semibold text-gray-800 mb-1">
                      {request.book?.title || 'Unknown Book'}
                    </h2>
                    <div className="flex items-center text-gray-600 text-sm">
                      <User size={16} className="mr-1" />
                      Owner: {request.toUser?.name || 'Unknown User'}
                    </div>
                  </div>

                  <div className="w-full md:w-[30%] text-gray-600 text-sm md:text-base mb-3 md:mb-0">
                    <span className="font-medium">Due: </span>
                    {formatDate(request.dueDate || request.returndate)}
                  </div>

                  <div className="w-full md:w-[30%] flex items-center justify-end gap-3">
                    <span className={`px-3 py-1 rounded-md text-sm font-medium capitalize cursor-pointer ${getStatusColor(request.status)}`}>
                      {getStatusText(request.status)}
                    </span>
                    {request.status === 'completed' && (
                      <button
                        onClick={() => handleDeleteBook(request._id)}
                        className="text-gray-500 hover:text-[#E54335] transition-colors p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Borrow;
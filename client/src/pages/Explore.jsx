import React from 'react';
import { 
  Filter, 
  Search, 
  Book, 
  User, 
  Calendar, 
  MessageSquare, 
  Clock, 
  Check, 
  X, 
  Heart, 
  MapPin, 
  Star 
} from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from 'axios';

import { BASE_URL } from '../utils/vars'; // Adjust the import path as necessary

// RequestBookCard Component
const RequestBookCard = ({ book, onRequestBook }) => {
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [message, setMessage] = useState('');
  const [isRequesting, setIsRequesting] = useState(false);

  const handleRequestBook = async () => {
    setIsRequesting(true);
    try {
      await onRequestBook(book._id, message);
      setShowRequestModal(false);
      setMessage('');
    } catch (error) {
      console.error('Request failed:', error);
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-4 w-80 flex-shrink-0 border border-gray-200 hover:shadow-lg transition-shadow">
        <div className="flex gap-4">
          <div className="w-20 h-28 bg-gray-200 rounded-md flex items-center justify-center">
            {book.coverImage ? (
              <img 
                src={book.coverImage} 
                alt={book.title}
                className="w-full h-full object-cover rounded-md"
              />
            ) : (
              <Book size={24} className="text-gray-400" />
            )}
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1 line-clamp-2">{book.title}</h3>
            <p className="text-gray-600 text-sm mb-2">by {book.author}</p>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {book.genre}
              </span>
              <span className={`text-xs px-2 py-1 rounded ${
                book.isAvailable 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {book.isAvailable ? 'Available' : 'Unavailable'}
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
              <User size={14} />
              <span>{book.owner?.name || 'Anonymous'}</span>
            </div>
            
            {book.location && (
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                <MapPin size={14} />
                <span>{book.location}</span>
              </div>
            )}
            
            <button
              onClick={() => setShowRequestModal(true)}
              disabled={!book.isAvailable}
              className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
                book.isAvailable
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {book.isAvailable ? 'Request to Borrow' : 'Not Available'}
            </button>
          </div>
        </div>
      </div>

      {/* Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-90vw">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Request Book</h2>
              <button
                onClick={() => setShowRequestModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="mb-4">
              <h3 className="font-medium mb-2">{book.title}</h3>
              <p className="text-gray-600 text-sm">by {book.author}</p>
              <p className="text-gray-600 text-sm mt-1">Owner: {book.owner?.name}</p>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message (optional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell the owner why you'd like to borrow this book..."
                className="w-full p-3 border border-gray-300 rounded-md resize-none"
                rows="4"
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowRequestModal(false)}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestBook}
                disabled={isRequesting}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isRequesting ? 'Sending...' : 'Send Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Main Explore Component
function Explore() {
  const [searchQuery, setSearchQuery] = useState('');
  const [books, setBooks] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchPublicBooks();
  }, []);

  const getAuthToken = () => {
    return localStorage.getItem('token'); // Replace with actual token retrieval
  };

const fetchPublicBooks = async () => {
  try {
    setLoading(true);
    const token = getAuthToken();

    const response = await axios.get(`${BASE_URL}/api/v1/book/getpublicbooks`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Fetched public books:', response.data);
    setBooks(response.data.books || []);
    setError(null); // clear previous error if any
  } catch (err) {
    console.error('Error fetching public books:', err);
    setError('Failed to load books.');
  } finally {
    setLoading(false); // make sure to reset loading state whether success or failure
  }
};

  const handleRequestBook = async (bookId, message) => {
    try {
      const token = getAuthToken();
      
      const response = await axios.post(
        `${BASE_URL}/api/v1/borrow/request/${bookId}`,
        { message },
        {
          headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
          }
        }
      );

      if (response.status !== 200) {
        throw new Error(response.data.message || 'Failed to send request');
      }
      
      alert('request sent successfully');
      
    } catch (err) {
      console.error('Error sending request:', err);
      // alert(err.message || 'Failed to send request');

      throw err;
    }
  };



  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = !selectedGenre || book.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  const genres = [...new Set(books.map(book => book.genre))];

  if (loading) {
    return (
      <div className="h-[calc(100%-80px)] w-[calc(100%-100px)] ml-[100px] px-10 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading books...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100%-80px)] w-[calc(100%-100px)] ml-[100px] px-10 flex flex-col gap-6">
      <h1 className="text-[50px] font-bold">Explore</h1>

      <div className="w-full flex">
        <p className="text-md text-neutral-500 max-w-[500px]">
          Explore the shelves as you would the stars — each book, a universe waiting to be found.
        </p>
      </div>

      {/* Search and Filter Section */}
      <div className="flex flex-col gap-2">
        {/* Search Bar */}
        <div className="flex w-full items-center justify-center h-16 gap-7 mt-0">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white w-[30rem] h-full rounded-3xl border border-gray-300 shadow-sm outline-none px-7 text-[20px]"
            placeholder="Search books or authors..."
          />
          <div className="bg-blue-600 p-4 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
            <Search size={30} className="text-white" />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-gray-100 p-4 rounded-full cursor-pointer hover:bg-gray-200 transition-colors"
          >
            <Filter size={30} className="text-gray-600" />
          </button>
        </div>

        {/* Filter Section */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
            <div className="flex flex-wrap gap-4 items-center">
              <label className="font-medium text-gray-700">Filter by Genre:</label>
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 bg-white"
              >
                <option value="">All Genres</option>
                {genres.map(genre => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
              {selectedGenre && (
                <button
                  onClick={() => setSelectedGenre('')}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Clear Filter
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="flex justify-between items-center">
        <p className="text-gray-600">
          {filteredBooks.length} book{filteredBooks.length !== 1 ? 's' : ''} found
          {searchQuery && ` for "${searchQuery}"`}
        </p>
      </div>

      {/* Book List */}
      <div className="w-full flex flex-wrap gap-5 overflow-x-auto py-5">
        {error ? (
          <div className="w-full text-center py-8">
            <p className="text-red-500 text-lg">{error}</p>
            <button
              onClick={fetchPublicBooks}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        ) : filteredBooks.length > 0 ? (
          filteredBooks.map((book) => (
            <RequestBookCard 
              key={book._id} 
              book={book} 
              onRequestBook={handleRequestBook}
            />
          ))
        ) : (
          <div className="w-full text-center py-8">
            <Book size={48} className="text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {searchQuery ? `No books found for "${searchQuery}"` : 'No books available'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 text-blue-600 hover:text-blue-800"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Explore;
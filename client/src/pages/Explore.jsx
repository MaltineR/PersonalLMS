import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '../utils/vars';
import { Book, User, MapPin, Search, Filter, X } from 'lucide-react';

const RequestBookCard = ({ book }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 w-80 flex-shrink-0 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex gap-4">
        <div className="w-20 h-28 bg-green-100 rounded-md flex items-center justify-center">
          {book.coverImage ? (
            <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover rounded-md" />
          ) : (
            <Book size={24} className="text-gray-400" />
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-1 line-clamp-2">{book.title}</h3>
          <p className="text-gray-600 text-sm mb-2">by {book.author}</p>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{book.genre}</span>
            <span className={`text-xs px-2 py-1 rounded ${book.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {book.isAvailable ? 'Available' : 'Unavailable'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
            <User size={14} />
            <span>{book.owner?.name || ''}</span>
          </div>
          {book.location && (
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
              <MapPin size={14} />
              <span>{book.location}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function Explore() {
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');

  const fetchLibraryBooks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/api/v1/book/getallbooks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBooks(response.data.books || []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to load your library.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLibraryBooks();
  }, []);

  const genres = [...new Set(books.map(b => b.genre))];

  const filteredBooks = books.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(searchQuery.toLowerCase()) || b.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = !selectedGenre || b.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  if (loading) return <div className="p-10 text-center">Loading your library...</div>;
  if (error) return <div className="p-10 text-center text-red-500">{error}</div>;

  return (
    <div className="h-[calc(100%-80px)] w-[calc(100%-100px)] ml-[100px] px-10 flex flex-col gap-6">
      <h1 className="text-[50px] font-bold">Explore by Genre</h1>

      {/* Search & Filter */}
      <div className="flex flex-col gap-2">
        <div className="flex w-full items-center gap-4">
          <input
            type="text"
            placeholder="Search by title or author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-80 px-4 py-2 border rounded-full focus:outline-none"
          />
          <button onClick={() => setShowFilters(!showFilters)} className="p-2 bg-gray-200 rounded-full">
            <Filter size={20} />
          </button>
        </div>
        {showFilters && (
          <div className="flex gap-4 items-center mt-2">
            <label>Filter by Genre:</label>
            <select className="border rounded px-2 py-1" value={selectedGenre} onChange={(e) => setSelectedGenre(e.target.value)}>
              <option value="">All Genres</option>
              {genres.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            {selectedGenre && (
              <button onClick={() => setSelectedGenre('')} className="text-blue-600 hover:text-blue-800 text-sm">Clear Filter</button>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-5 overflow-x-auto py-5">
        {filteredBooks.length > 0 ? (
          filteredBooks.map(b => <RequestBookCard key={b._id} book={b} />)
        ) : (
          <div className="text-center w-full py-10">
            <p className="text-gray-500">No books found.</p>
          </div>
        )}
      </div>
    </div>
  );
}

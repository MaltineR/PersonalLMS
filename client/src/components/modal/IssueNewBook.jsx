import { X } from 'lucide-react';
import React, { useState } from 'react';

const IssueBook = ({ onClose, onSubmit }) => {
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    genre: '',
    pagesread: '',
    totalpages: '',
    price: '',
    public: false
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleStatusSelect = (status) => {
    setSelectedStatus(status);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedStatus) {
      alert('Please select a status for the book.');
      return;
    }
    
    
    let readingStatus;
    switch(selectedStatus) {
      case 'read':
        readingStatus = 'read';
        break;
      case 'reading':
        readingStatus = 'reading';
        break;
      case 'yet-to-read':
        readingStatus = 'to-read';
        break;
      default:
        readingStatus = 'to-read';
    }
    
    const bookData = {
      title: formData.title,
      author: formData.author,
      genre: formData.genre,
      totalpages: parseInt(formData.totalpages),
      pagesread: selectedStatus === 'read' ? parseInt(formData.totalpages) : parseInt(formData.pagesread) || 0,
      price: parseFloat(formData.price) || 0,
      public: formData.public,
      readingstatus: readingStatus
    };
    
    console.log('Submitting book data:', bookData);
    onSubmit(bookData);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden border border-gray-200">
      
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3 text-2xl font-semibold text-[#2d7a67]">
            <div className="bg-[#2d7a67] rounded-lg flex items-center justify-center text-white">
            </div>
            Add New Book
          </div>
          <button 
            className="text-gray-500 hover:text-gray-700 transition-colors"
            onClick={onClose}
          >
            <X size={24} />
          </button>
        </div>

      
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 flex-1">
         
          <div className="mb-6">
            <label className="block mb-2 font-semibold text-gray-800">Name of book</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#9883D5] placeholder-gray-400"
              placeholder="Name of book"
              required
            />
          </div>

          
          <div className="mb-6">
            <label className="block mb-2 font-semibold text-gray-800">Author Name</label>
            <input
              type="text"
              name="author"
              value={formData.author}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#9883D5] placeholder-gray-400"
              placeholder="Author Name"
              required
            />
          </div>

          
          <div className="mb-6">
            <label className="block mb-2 font-semibold text-gray-800">Genre</label>
            <input
              type="text"
              name="genre"
              value={formData.genre}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#9883D5] placeholder-gray-400"
              placeholder="Genre"
              required
            />
          </div>

          
          <div className="mb-6">
            <label className="block mb-2 font-semibold text-gray-800">Total no. of pages</label>
            <input
              type="number"
              name="totalpages"
              value={formData.totalpages}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#9883D5] placeholder-gray-400"
              placeholder="Total no. of pages"
              min="1"
              required
            />
          </div>

          {/* Price Field */}
          <div className="mb-6">
            <label className="block mb-2 font-semibold text-gray-800">Price (optional)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#9883D5] placeholder-gray-400"
              placeholder="Price"
              min="0"
              step="0.01"
            />
          </div>

          

          <div className="mb-6">
            <label className="block mb-2 font-semibold text-gray-800">Status</label>
            <div className="flex gap-3 mt-2">
              <div
                className={`flex items-center gap-2 cursor-pointer px-3 py-2 rounded-full transition-all border-2 ${selectedStatus === 'read' ? 'border-[#9883D5] bg-[#D5D2FD]' : 'border-transparent'} hover:bg-gray-50`}
                onClick={() => handleStatusSelect('read')}
              >
                <div className="w-3 h-3 rounded-full bg-[#f56565]"></div>
                <span className="font-medium text-gray-800">Read</span>
              </div>
              <div
                className={`flex items-center gap-2 cursor-pointer px-3 py-2 rounded-full transition-all border-2 ${selectedStatus === 'reading' ? 'border-[#9883D5] bg-[#D5D2FD]' : 'border-transparent'} hover:bg-gray-50`}
                onClick={() => handleStatusSelect('reading')}
              >
                <div className="w-3 h-3 rounded-full bg-[#48bb78]"></div>
                <span className="font-medium text-gray-800">Reading</span>
              </div>
              <div
                className={`flex items-center gap-2 cursor-pointer px-3 py-2 rounded-full transition-all border-2 ${selectedStatus === 'yet-to-read' ? 'border-[#9883D5] bg-[#D5D2FD]' : 'border-transparent'} hover:bg-gray-50`}
                onClick={() => handleStatusSelect('yet-to-read')}
              >
                <div className="w-3 h-3 rounded-full bg-[#f6ad55]"></div>
                <span className="font-medium text-gray-800">Yet to Read</span>
              </div>
            </div>
          </div>

          
          {selectedStatus !== 'read' && (
            <div className="mb-6">
              <label className="block mb-2 font-semibold text-gray-800">No. of pages read</label>
              <input
                type="number"
                name="pagesread"
                value={formData.pagesread}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#9883D5] placeholder-gray-400"
                placeholder="No. of pages read"
                min="0"
                max={formData.totalpages || ''}
              />
            </div>
          )}

          
          <div className="pt-4">
            <button 
              type="submit" 
              className="w-full bg-[#2d7a67] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#80acaa] transition-colors"
            >
              SUBMIT
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IssueBook;
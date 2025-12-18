import React, { useState, useEffect } from "react";

const EditPage = ({ book, onSubmit, onClose }) => {
  const [selectedStatus, setSelectedStatus] = useState(book?.readingstatus || null);
  const [formData, setFormData] = useState({
    title: book?.title || "",
    author: book?.author || "",
    genre: book?.genre || "",
    totalpages: book?.totalpages || "",
    pagesread: book?.pagesread || "",
    price: book?.price || "",
    public: book?.public || false,
  });

  useEffect(() => {
    if (book) {
      setFormData({
        title: book.title || "",
        author: book.author || "",
        genre: book.genre || "",
        totalpages: book.totalpages || "",
        pagesread: book.pagesread || "",
        price: book.price || "",
        public: book.public || false,
      });
      setSelectedStatus(book.readingstatus || null);
    }
  }, [book]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleStatusSelect = (status) => setSelectedStatus(status);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedStatus) {
      alert("Please select a status for the book.");
      return;
    }

    const updatedBook = {
      ...formData,
      readingstatus: selectedStatus,
      totalpages: Number(formData.totalpages),
      pagesread: Number(formData.pagesread),
      price: Number(formData.price),
      _id: book._id, 
    };

    onSubmit(updatedBook); 
  };

  const handleClose = () => onClose();

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) handleClose();
  };

  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handleEscapeKey);
    return () => document.removeEventListener("keydown", handleEscapeKey);
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden border border-gray-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3 text-2xl font-semibold text-[#2d7a67]">
            <div className="bg-[#2d7a67] flex items-center justify-center text-white"></div>
            Edit Book
          </div>
          <button className="text-gray-500 hover:text-gray-700 transition-colors" onClick={onClose}  aria-label="Close modal">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 flex-1">
          {/* Title */}
          <div className="mb-6">
            <label className="block mb-2 font-semibold text-gray-800">Name of book</label>
            <input type="text" name="title" value={formData.title} onChange={handleInputChange} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#9883D5]" placeholder="Name of book" required />
          </div>

          {/* Author */}
          <div className="mb-6">
            <label className="block mb-2 font-semibold text-gray-800">Author Name</label>
            <input type="text" name="author" value={formData.author} onChange={handleInputChange} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#9883D5]" placeholder="Author Name" required />
          </div>

          {/* Genre */}
          <div className="mb-6">
            <label className="block mb-2 font-semibold text-gray-800">Genre</label>
            <input type="text" name="genre" value={formData.genre} onChange={handleInputChange} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#9883D5]" placeholder="Genre" required />
          </div>

          {/* Total Pages */}
          <div className="mb-6">
            <label className="block mb-2 font-semibold text-gray-800">Total no. of pages</label>
            <input type="number" name="totalpages" value={formData.totalpages} onChange={handleInputChange} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#9883D5]" placeholder="Total no. of pages" min="1" required />
          </div>

          {/* Pages Read (only if not read) */}
          {selectedStatus !== "read" && (
            <div className="mb-6">
              <label className="block mb-2 font-semibold text-gray-800">No. of pages read</label>
              <input type="number" name="pagesread" value={formData.pagesread} onChange={handleInputChange} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#9883D5]" placeholder="No. of pages read" min="0" max={formData.totalpages || ""} />
            </div>
          )}

          {/* Price */}
          <div className="mb-6">
            <label className="block mb-2 font-semibold text-gray-800">Price (optional)</label>
            <input type="number" name="price" value={formData.price} onChange={handleInputChange} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#9883D5]" placeholder="Price" min="0" step="0.01" />
          </div>

          {/* Reading status */}
          <div className="mb-6">
            <label className="block mb-2 font-semibold text-gray-800">Status</label>
            <div className="flex gap-3 mt-2">
              {["read", "reading", "to-read"].map((status) => (
                <div
                  key={status}
                  className={`flex items-center gap-2 cursor-pointer px-3 py-2 rounded-full transition-all border-2 ${
                    selectedStatus === status ? "border-[#9883D5] bg-[#D5D2FD]" : "border-transparent"
                  } hover:bg-gray-50`}
                  onClick={() => handleStatusSelect(status)}
                >
                  <div
                    className={`w-3 h-3 rounded-full ${
                      status === "read" ? "bg-[#f56565]" : status === "reading" ? "bg-[#48bb78]" : "bg-[#f6ad55]"
                    }`}
                  ></div>
                  <span className="font-medium text-gray-800">{status.replace("-", " ")}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <button type="submit" className="w-full bg-[#2d7a67] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#80acaa] transition-colors">
              UPDATE
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPage;

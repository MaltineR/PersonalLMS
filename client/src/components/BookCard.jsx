import { Album, Edit3, EllipsisVertical } from "lucide-react";
import { useState } from "react";
import EditPage from "./modal/EditBook";

function BookCard({ book = {
  title: 'The Alchemist',
  author: 'Paulo Coelho',
  genre: 'Fiction',
  totalpages: 208,
  pagesread: 50,
  owner: 'user123abc',
  status: true,
  sharedWith: 'user456def',
  price: 299,
  public: true,
  readingstatus: 'reading'
}}) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const toggleEditModal = () => {
    setIsEditModalOpen(!isEditModalOpen);
  };

  const handleSubmit = (updatedBook) => {
    console.log("Updated book data:", updatedBook);
    // Here you would typically make an API call to update the book
    // Then close the modal
    toggleEditModal();
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 w-64 relative">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Album color={`${!book.public ? "red" : "green"}`} />
            <span className={`${!book.public ? "text-[var(--deep-red)]" : "text-[var(--deep-green)]"} text-xl font-medium`}>
              {book.public ? `Public` : `Private`}
            </span>
          </div>
          <button className="text-gray-400 hover:text-gray-600 p-1">
            <EllipsisVertical size={20} />
          </button>
        </div>

        <h3 className="text-xl font-semibold text-black">
          {book.title}
        </h3>

        <p className="text-[var(--grey)] text-sm mb-3">
          {book.author}
        </p>

        <p className="text-[var(--grey)] text-sm mb-3">
          Genre: {book.genre}
        </p>

        <div className="mb-4">
          <span className="bg-[var(--high)] text-white px-2 py-1 rounded-full text-xs font-medium">
            {book.readingstatus}
          </span>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-700 text-md font-medium">Progress</span>
            <span className="text-gray-500 text-xs">{book.pagesread}/{book.totalpages} pages</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(book.pagesread/book.totalpages) * 100}%` }}
            ></div>
          </div>
        </div>
        
        <button 
          onClick={toggleEditModal}
          className="ml-auto right-4 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white hover:bg-purple-600 transition-colors"
        >
          <Edit3 size={16} />
        </button>
      </div>

      {isEditModalOpen && (
        <EditPage 
          book={book} 
          onSubmit={handleSubmit}
          onClose={toggleEditModal}
        />
      )}
    </>
  );
}

export default BookCard;
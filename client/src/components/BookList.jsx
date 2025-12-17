
import BookCard from "./BookCard";

function BookList({ books, onDelete, onUpdate, onTogglePublic }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {books.map((book) => (
        <BookCard
          key={book._id}
          book={book}
          onDelete={onDelete}
          onUpdate={onUpdate}
          onTogglePublic={onTogglePublic}
        />
      ))}
    </div>
  );
}

export default BookList;

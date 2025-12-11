import { Album} from 'lucide-react';

function RequestBookCard({
  book = {
    title: 'The Alchemist',
    author: 'Paulo Coelho',
    genre: 'Fiction',
    totalpages: 208,
    pagesread: 50,
    owner: 'user123abc',
    ownerName: 'Mallya',
    status: true,
    sharedWith: 'user456def',
    price: 299,
    public: true,
    readingstatus: 'reading',
  },
}) {

const handleRequest = () =>{
  console.log("handled request")
}


  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 w-64 relative flex flex-col justify-between min-h-[260px]">

      <div className="flex items-start justify-between">
        <div className="flex items-center">
          <Album size={30}/>
        </div>
      </div>


      <div className="flex flex-col gap-1 mb-4">
        <h3
          className="text-xl font-semibold text-black truncate"
          title={book.title}
        >
          {book.title}
        </h3>

        <p className="text-[var(--grey)] text-sm">{book.author}</p>

        <p className="text-[var(--grey)] text-sm">Genre: {book.genre}</p>

        <p className="text-[var(--grey)] text-sm">
          Owner: {book.ownerName || 'Unknown'}
        </p>
      </div>
      <div className="flex flex-col gap-2">
        
        <button className="px-3 py-2 bg-[var(--deep-green)] text-white rounded-2xl w-full" onClick={handleRequest}>
          Request Book
        </button>
      </div>
    </div>
  );
}

export default RequestBookCard;
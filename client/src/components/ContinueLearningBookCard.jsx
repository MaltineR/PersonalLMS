import { Album } from "lucide-react";

const ContinueLearningBookCard = ({ book = {}, onClick }) => {
  const {
    title = "Untitled Book",
    author = "Unknown Author",
    genre = "",
    pagesread = 0,
    totalpages = 1,
    readingstatus = "to-read"
  } = book;

 
  const statusColors = {
    'read': {
      bg: 'bg-[#34A353]',
      text: 'Read'
    },
    'reading': {
      bg: 'bg-[#EEBE39]',
      text: 'Reading'
    },
    'to-read': {
      bg: 'bg-[#E54335]',
      text: 'To Read'
    }
  };

  const progress = Math.round((pagesread / totalpages) * 100);
  const currentStatus = statusColors[readingstatus];

  return (
    <div 
      className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 
                cursor-pointer transition-all flex flex-col w-[280px] h-full
                hover:-translate-y-1 hover:shadow-lg"
      onClick={onClick}
      style={{
        transition: 'all 0.3s ease',
        animation: 'fadeIn 0.5s ease-out'
      }}
    >
      <div className="p-5 flex flex-col flex-grow">
       
        <div 
          className="mb-4 text-[#2e876e] transition-transform duration-300 hover:scale-110"
          style={{ transformOrigin: 'center' }}
        >
          <Album size={32} />
        </div>

        
        <h3 
          className="text-xl font-bold mb-2 truncate transition-colors duration-200 hover:text-[#2e876e]"
        >
          {title}
        </h3>
        
        
        <p className="text-gray-600 text-sm mb-3 truncate">{author}</p>
        
      
        {genre && (
          <p className="text-gray-500 text-xs mb-4 transition-transform duration-200 hover:translate-x-1">
            Genre: {genre}
          </p>
        )}
        
   
        <div className="flex items-center mb-4">
          <div 
            className={`w-3 h-3 rounded-full ${currentStatus.bg} mr-2 animate-pulse`}
            style={{ animationDuration: '2s' }}
          />
          <span className="text-xs font-medium">
            {currentStatus.text}
          </span>
        </div>

       
        <div className="mt-auto">
          <div className="flex justify-between text-xs mb-1">
            <span>Progress</span>
            <span 
              className="transition-transform duration-200 hover:scale-110"
              style={{ display: 'inline-block' }}
            >
              {progress}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <div 
              className={`h-2.5 rounded-full ${currentStatus.bg}`}
              style={{
                width: `${progress}%`,
                transition: 'width 1s ease-out',
              }}
            />
          </div>
          <p 
            className="text-right text-xs mt-1 transition-transform duration-200 hover:scale-105"
            style={{ display: 'inline-block' }}
          >
            {pagesread}/{totalpages} pages
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0% { opacity: 0.8; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
          100% { opacity: 0.8; transform: scale(1); }
        }
        .animate-pulse {
          animation: pulse 2s infinite;
        }
      `}</style>
    </div>
  );
};

ContinueLearningBookCard.defaultProps = {
  book: {
    title: "Untitled Book",
    author: "Unknown Author",
    genre: "",
    pagesread: 0,
    totalpages: 1,
    readingstatus: "to-read"
  },
  onClick: () => {}
};

export default ContinueLearningBookCard;
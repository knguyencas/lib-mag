import { useNavigate } from 'react-router-dom';
import './ReaderHeader.css';

function ReaderHeader({ book, currentChapter, onMenuToggle }) {
  const navigate = useNavigate();

  return (
    <header className="reader-header">
      <div className="reader-header-content">
        <button 
          className="back-btn"
          onClick={() => navigate(`/book-detail?id=${book?.book_id}`)}
          aria-label="Back to book detail"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M19 12H5M5 12L12 19M5 12L12 5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div className="book-info">
          <h1 className="book-title">{book?.title || 'Loading...'}</h1>
          <p className="chapter-info">
            {currentChapter?.title || `Chapter ${currentChapter?.chapterNumber || ''}`}
          </p>
        </div>

        <button 
          className="menu-btn"
          onClick={onMenuToggle}
          aria-label="Toggle menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M3 12H21M3 6H21M3 18H21"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </header>
  );
}

export default ReaderHeader;
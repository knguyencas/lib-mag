import { useState } from 'react';
import InlineRating from './InlineRating';
import './BookInfo.css';

function BookInfo({ 
  book,
  isFavorited, 
  onToggleFavorite, 
  favoriteLoading,
  hasProgress,
  progressPercentage,
  onStartReading,
  onContinueReading,
  isLoggedIn
}) {
  const [currentRating, setCurrentRating] = useState(book?.rating || 0);
  const [currentRatingCount, setCurrentRatingCount] = useState(book?.rating_count || 0);

  const handleRatingChange = (ratingData) => {
    if (ratingData.rating !== undefined) {
      setCurrentRating(ratingData.rating);
    }
    if (ratingData.count !== undefined) {
      setCurrentRatingCount(ratingData.count);
    }
  };

  if (!book) {
    return <div className="book-info">Loading...</div>;
  }

  return (
    <div className="book-info">
      {/* ✅ Bookmark button - góc phải */}
      {isLoggedIn && (
        <button 
          className={`btn-bookmark ${isFavorited ? 'bookmarked' : ''}`}
          onClick={onToggleFavorite}
          disabled={favoriteLoading}
          title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
        >
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill={isFavorited ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
        </button>
      )}

      <h1 className="book-title">{book.title}</h1>
      
      <div className="book-author">
        <span className="by-text">by</span>{' '}
        <span className="author-name">{book.author}</span>
      </div>

      {/* Inline Rating */}
      <InlineRating 
        bookId={book.book_id}
        initialRating={currentRating}
        ratingCount={currentRatingCount}
        onRatingChange={handleRatingChange}
      />

      {book.punchline && (
        <p className="book-punchline">{book.punchline}</p>
      )}

      {book.blurb && (
        <div className="book-blurb">
          <p>{book.blurb}</p>
        </div>
      )}

      {/* ✅ Reading buttons - ALWAYS show both buttons */}
      <div className="book-action-buttons">
        <button 
          className="btn-start-reading"
          onClick={onStartReading}
        >
          Start Reading
        </button>
        
        <button 
          className="btn-continue-reading"
          onClick={onContinueReading}
        >
          Continue reading
        </button>
      </div>
    </div>
  );
}

export default BookInfo;
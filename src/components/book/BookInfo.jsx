import { useState, useEffect } from 'react';
import InlineRating from './InlineRating';
import './BookInfo.css';

function BookInfo({ 
  book,
  isFavorited, 
  onToggleFavorite, 
  favoriteLoading,
  onStartReading,
  onContinueReading,
  isLoggedIn
}) {
  const [currentRating, setCurrentRating] = useState(book?.rating || 0);
  const [currentRatingCount, setCurrentRatingCount] = useState(book?.rating_count || 0);

  useEffect(() => {
    setCurrentRating(book?.rating || 0);
    setCurrentRatingCount(book?.rating_count || 0);
  }, [book]);

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

  const categories = Array.isArray(book.categories)
    ? book.categories
        .map((c) => (typeof c === 'string' ? c : (c.name || c.slug || '')))
        .filter(Boolean)
    : [];

  return (
    <div className="book-info">
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

      {(book.primary_genre || categories.length > 0) && (
        <div className="categories">
          {book.primary_genre && (
            <span className="primary-genre">{book.primary_genre}</span>
          )}

          {categories.map((cat) => (
            <span key={cat} className="category-tag">
              {cat}
            </span>
          ))}
        </div>
      )}

      <h2 className="book-title">{book.title || 'Untitled'}</h2>
      <p className="book-author">
        {book.author ? `by ${book.author}` : ''}
      </p>

      <div className="star-rating">
        <InlineRating 
          bookId={book.book_id}
          initialRating={currentRating}
          ratingCount={currentRatingCount}
          onRatingChange={handleRatingChange}
        />
      </div>

      {book.punchline && (
        <p className="book-punchline">{book.punchline}</p>
      )}

      {book.blurb && (
        <div className="book-blurb">
          <p>{book.blurb}</p>
        </div>
      )}

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

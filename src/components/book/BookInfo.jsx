import { useState } from 'react';
import InlineRating from './InlineRating';
import './BookInfo.css';

function BookInfo({ book }) {
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
      <h1 className="book-title">{book.title}</h1>
      
      <div className="book-author">
        <span className="by-text">by</span>{' '}
        <span className="author-name">{book.author}</span>
      </div>

      {/* Inline Rating - ngay dưới author */}
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

      <div className="book-action-buttons">
        <button className="btn-start-reading">
          {book.userProgress && book.userProgress > 0 ? 'Continue Reading' : 'Start Reading'}
        </button>
        <button className="btn-save">Save</button>
      </div>
    </div>
  );
}

export default BookInfo;
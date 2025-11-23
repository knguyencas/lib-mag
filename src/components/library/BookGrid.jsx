import { useState } from 'react';
import BookCard from './BookCard';
import './BookGrid.css';

function BookGrid({ title, books = [], onShowMore, isExpanded = false, maxRows = 3 }) {
  const [currentRows, setCurrentRows] = useState(1);

  const handleShowMore = () => {
    if (currentRows >= maxRows) {
      setCurrentRows(1);
      onShowMore?.(1);
    } else {
      const newRows = currentRows + 1;
      setCurrentRows(newRows);
      onShowMore?.(newRows);
    }
  };

  const booksToShow = books.slice(0, currentRows * 5);

  return (
    <section className="section">
      <h2 className="section-title">{title}</h2>
      <div className="section-grid">
        <div className="book-grid">
          {booksToShow.length === 0 ? (
            <p style={{ color: 'white', gridColumn: '1 / -1' }}>
              No books found
            </p>
          ) : (
            booksToShow.map((book) => (
              <BookCard key={book.book_id} book={book} />
            ))
          )}
        </div>

        <div className="divider-with-button">
          <div className="divider-line"></div>
          <button
            className={`show-more-btn ${currentRows >= maxRows ? 'expanded' : ''}`}
            onClick={handleShowMore}
          >
            {currentRows >= maxRows ? 'Show less' : 'Show more'}{' '}
            <span className="show-more-icon">▼</span>
          </button>
          <div className="divider-line"></div>
        </div>
      </div>
    </section>
  );
}

export default BookGrid;
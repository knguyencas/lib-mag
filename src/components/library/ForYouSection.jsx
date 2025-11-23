import { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ForYouSection.css';

function ForYouSection({ books = [] }) {
  const gridRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const handleWheel = (e) => {
      e.preventDefault();
      grid.scrollLeft += e.deltaY;
    };

    grid.addEventListener('wheel', handleWheel, { passive: false });
    return () => grid.removeEventListener('wheel', handleWheel);
  }, []);

  const handleCardClick = (bookId) => {
    navigate(`/book-detail?id=${bookId}`);
  };

  const calculateRating = (rating) => {
    const value = parseFloat(rating || 0);
    const fullStars = Math.floor(value);
    const fraction = value - fullStars;
    const hasHalf = fraction >= 0.25 && fraction < 0.75;
    const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

    return { fullStars, hasHalf, emptyStars, value };
  };

  const getTitleClass = (title) => {
    if (title.length > 60) return 'popup-title very-long-title';
    if (title.length > 40) return 'popup-title long-title';
    return 'popup-title';
  };

  const truncateText = (text, maxLength) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  };

  return (
    <section className="section for-you-section">
      <h2 className="section-title">For You</h2>
      <div ref={gridRef} className="for-you-grid">
        {books.length === 0 ? (
          <p style={{ color: 'white' }}>No books available</p>
        ) : (
          books.map((book) => {
            const coverUrl = book.coverImage_cloud?.url || '';
            const rating = calculateRating(book.rating);
            const summaryText = book.blurb || book.punchline || 'No description available.';

            return (
              <div
                key={book.book_id}
                className="for-you-card"
                onClick={() => handleCardClick(book.book_id)}
              >
                <div
                  className="for-you-card-image"
                  style={
                    coverUrl
                      ? {
                          backgroundImage: `url('${coverUrl}')`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center'
                        }
                      : { background: '#666' }
                  }
                >
                  {!coverUrl && (
                    <strong style={{ color: '#fff', padding: '10px' }}>
                      {truncateText(book.title, 30)}
                    </strong>
                  )}
                </div>

                <div className="for-you-card-info">
                  <div className="for-you-card-title">{book.title}</div>
                  <div className="for-you-card-author">by {book.author}</div>
                  <div className="for-you-card-rating">
                    <span className="rating-stars">
                      {[...Array(rating.fullStars)].map((_, i) => (
                        <span key={`full-${i}`} className="star full">
                          ★
                        </span>
                      ))}
                      {rating.hasHalf && <span className="star half">★</span>}
                      {[...Array(rating.emptyStars)].map((_, i) => (
                        <span key={`empty-${i}`} className="star empty">
                          ☆
                        </span>
                      ))}
                    </span>
                    <span className="rating-number">
                      {rating.value ? rating.value.toFixed(1) : ''}
                    </span>
                  </div>
                </div>

                <div className="for-you-card-popup">
                  <div
                    className="popup-image"
                    style={
                      coverUrl
                        ? {
                            backgroundImage: `url('${coverUrl}')`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                          }
                        : { background: '#666' }
                    }
                  >
                    {!coverUrl && (
                      <>
                        <strong style={{ color: '#fff', fontSize: '20px' }}>
                          {book.title}
                        </strong>
                        <div style={{ color: '#fff', fontSize: '14px', marginTop: '15px' }}>
                          by {book.author}
                        </div>
                      </>
                    )}
                  </div>

                  <div className="popup-content">
                    <div className={getTitleClass(book.title)}>{book.title}</div>
                    <div className="popup-summary-container">
                      <div className="popup-summary">{summaryText}</div>
                      <span className="show-more-popup">Show more</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

export default ForYouSection;
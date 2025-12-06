import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './ForYouCard.css';

function ForYouCard({ book }) {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const [isTruncated, setIsTruncated] = useState(false);
  const cardRef = useRef(null);
  const summaryRef = useRef(null);

  const coverUrl = book.coverImage_cloud?.url || '';
  const ratingValue = parseFloat(book.rating || 0);
  const summaryText = book.blurb || book.punchline || 'No description available.';

  const fullStars = Math.floor(ratingValue);
  const fraction = ratingValue - fullStars;
  const hasHalf = fraction >= 0.25 && fraction < 0.75;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  const renderStars = () => {
    const stars = [];
    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={`full-${i}`} className="star full">★</span>);
    }
    if (hasHalf) {
      stars.push(<span key="half" className="star half">★</span>);
    }
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="star empty">☆</span>);
    }
    return stars;
  };

  const handleMouseEnter = () => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const centerY = rect.top + rect.height / 2;
      const popupTop = centerY - 225;

      setPopupPosition({
        top: popupTop,
        left: rect.left
      });
      setShowPopup(true);
    }
  };

  const handleMouseLeave = () => {
    setShowPopup(false);
  };

  useEffect(() => {
    if (showPopup && summaryRef.current) {
      const titleEl = summaryRef.current.previousElementSibling;
      const titleHeight = titleEl ? titleEl.offsetHeight : 0;
      const availableHeight = 401 - titleHeight - 40;
      
      summaryRef.current.style.maxHeight = availableHeight + 'px';
      
      const isOverflowing = summaryRef.current.scrollHeight > availableHeight;
      setIsTruncated(isOverflowing);
    }
  }, [showPopup]);

  const handleClick = (e) => {
    if (e.target.classList.contains('show-more-popup')) {
      e.stopPropagation();
    }
    navigate(`/book/${book.book_id}`);
  };

  const getTitleClass = () => {
    if (book.title.length > 60) return 'popup-title very-long-title';
    if (book.title.length > 40) return 'popup-title long-title';
    return 'popup-title';
  };

  return (
    <>
      <div
        ref={cardRef}
        className="for-you-card"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        <div
          className="for-you-card-image"
          style={
            coverUrl
              ? { backgroundImage: `url('${coverUrl}')`, backgroundSize: 'cover', backgroundPosition: 'center' }
              : { background: '#666' }
          }
        >
          {!coverUrl && (
            <strong style={{ color: '#fff', padding: '10px', textAlign: 'center' }}>
              {book.title.length > 30 ? book.title.substring(0, 30) + '...' : book.title}
            </strong>
          )}
        </div>
        
        <div className="for-you-card-info">
          <div className="for-you-card-title">{book.title}</div>
          <div className="for-you-card-author">by {book.author}</div>
          <div className="for-you-card-rating">
            <span className="rating-stars">{renderStars()}</span>
            <span className="rating-number">{ratingValue ? ratingValue.toFixed(1) : '0.0'}</span>
          </div>
        </div>
      </div>

      {showPopup && (
        <div
          className="for-you-card-popup"
          style={{
            top: `${popupPosition.top}px`,
            left: `${popupPosition.left}px`
          }}
        >
          <div
            className="popup-image"
            style={
              coverUrl
                ? { backgroundImage: `url('${coverUrl}')`, backgroundSize: 'cover', backgroundPosition: 'center' }
                : { background: '#666' }
            }
          >
            {!coverUrl && (
              <>
                <strong style={{ color: '#fff', fontSize: '20px' }}>{book.title}</strong>
                <div style={{ color: '#fff', fontSize: '14px', marginTop: '15px' }}>
                  by {book.author}
                </div>
              </>
            )}
          </div>
          
          <div className="popup-content">
            <div className={getTitleClass()}>{book.title}</div>
            <div className="popup-summary-container">
              <div
                ref={summaryRef}
                className={`popup-summary ${isTruncated ? 'truncated' : ''}`}
              >
                {summaryText}
              </div>
              {isTruncated && (
                <span className="show-more-popup">
                  Show more
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ForYouCard;
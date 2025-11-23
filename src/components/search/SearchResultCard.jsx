import { useNavigate } from 'react-router-dom';
import './SearchResultCard.css';

function SearchResultCard({ book }) {
  const navigate = useNavigate();

  const coverUrl = book.coverImage_cloud?.url || book.coverImage || '';

  const renderRating = (rating) => {
    const stars = [];
    const rounded = Math.round(rating || 0);
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={`star ${i <= rounded ? 'filled' : ''}`}>
          ★
        </span>
      );
    }
    
    return stars;
  };

  const truncateText = (text, maxLength = 200) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div
      className="search-result-card"
      onClick={() => navigate(`/book-detail?id=${book.book_id}`)}
    >
      <div
        className="result-cover"
        style={
          coverUrl
            ? {
                backgroundImage: `url('${coverUrl}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }
            : {
                background: '#F5F5F5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#999',
                fontSize: '12px'
              }
        }
      >
        {!coverUrl && 'No cover'}
      </div>

      <div className="result-info">
        <h3 className="result-title">{book.title}</h3>
        <p className="result-author">{book.author}</p>

        {book.primary_genre && (
          <span className="result-genre">{book.primary_genre}</span>
        )}

        <div className="result-rating">
          {renderRating(book.rating)}
          {book.rating && (
            <span className="rating-value">
              {book.rating.toFixed(1)}
            </span>
          )}
        </div>

        {book.blurb && (
          <p className="result-description">
            {truncateText(book.blurb, 150)}
          </p>
        )}

        <div className="result-meta">
          {book.publishedDate && (
            <span>Published: {new Date(book.publishedDate).getFullYear()}</span>
          )}
          {book.views && <span>{book.views} views</span>}
        </div>
      </div>
    </div>
  );
}

export default SearchResultCard;
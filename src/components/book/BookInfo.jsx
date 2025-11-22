import './BookInfo.css';
import { useNavigate } from 'react-router-dom';

function BookInfo({ book }) {
    const navigate = useNavigate(); 
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

    const handleStartReading = () => {
        navigate(`/reader?id=${book.book_id}&chapter=1`);
    };

    const handleContinueReading = () => {
    const lastChapter = 1; // Placeholder
    navigate(`/reader?id=${book.book_id}&chapter=${lastChapter}`);
    };

    return (
        <div className="book-info-column">
        <div className="categories">
            {book.primary_genre && (
            <span className="primary-genre">{book.primary_genre}</span>
            )}
            {Array.isArray(book.categories) &&
            book.categories.map((cat, idx) => (
                <span key={idx} className="category-tag">
                {cat}
                </span>
            ))}
        </div>

        <h2 className="book-title">{book.title || 'Untitled'}</h2>
        <p className="book-author">
            {book.author ? `by ${book.author}` : ''}
        </p>

        <button className="bookmark-btn" aria-label="Bookmark">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
                d="M19 21L12 16L5 21V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H17C17.5304 3 18.0391 3.21071 18.4142 3.58579C18.7893 3.96086 19 4.46957 19 5V21Z"
                stroke="black"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            </svg>
        </button>

        <div className="star-rating">
            {renderRating(book.rating)}
            <span style={{ marginLeft: '8px', fontSize: '14px' }}>
            {book.rating ? `${book.rating.toFixed(1)} / 5.0` : ''}
            </span>
        </div>

        <div className="book-description">
            {book.punchline && <p className="quote">{book.punchline}</p>}
            {book.blurb && <p>{book.blurb}</p>}
        </div>

        <div className="action-buttons">
            <button className="btn-primary" onClick={handleStartReading}>
            Start Reading
            </button>
            <button className="btn-secondary" onClick={handleContinueReading}>
            Continue reading
            </button>
        </div>
        </div>
    );
}

export default BookInfo;
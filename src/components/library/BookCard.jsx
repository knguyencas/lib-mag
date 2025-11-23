import { useNavigate } from 'react-router-dom';
import './BookCard.css';

function BookCard({ book }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/book-detail?id=${book.book_id}`);
  };

  const coverUrl = book.coverImage_cloud?.url || '';

  const truncateText = (text, maxLength) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  };

  return (
    <div className="book-card" onClick={handleClick}>
      <div
        className="book-card-cover"
        style={
          coverUrl
            ? {
                backgroundImage: `url('${coverUrl}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }
            : {
                background: '#666',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }
        }
      >
        {!coverUrl && (
          <strong
            style={{
              color: '#fff',
              padding: '10px',
              textAlign: 'center'
            }}
          >
            {truncateText(book.title, 30)}
          </strong>
        )}
      </div>
      <div className="book-card-title">{truncateText(book.title, 40)}</div>
      <div className="book-card-author">{book.author}</div>
    </div>
  );
}

export default BookCard;
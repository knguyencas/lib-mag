import { useNavigate } from 'react-router-dom';
import './RelatedBooks.css';

function RelatedBooks({ books = [] }) {
  const navigate = useNavigate();

  if (!books || books.length === 0) {
    return (
      <div className="related-books-column">
        <h3 className="section-title">Related Books</h3>
        <p style={{ color: '#999' }}>No related books to display.</p>
      </div>
    );
  }

  const handleBookClick = (bookId) => {
    navigate(`/book-detail?id=${bookId}`);
    window.scrollTo(0, 0);
  };

  return (
    <div className="related-books-column">
      <h3 className="section-title">Related Books</h3>
      <div className="related-books-grid">
        {books.map((book) => {
          const coverUrl = book.coverImage_cloud?.url || book.coverImage || '';
          
          return (
            <div
              key={book.book_id}
              className="related-book"
              onClick={() => handleBookClick(book.book_id)}
            >
              <div
                className="related-book-cover"
                style={
                  coverUrl
                    ? {
                        backgroundImage: `url('${coverUrl}')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }
                    : {
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        color: '#666'
                      }
                }
              >
                {!coverUrl && 'No cover'}
              </div>
              <div className="related-book-title">{book.title}</div>
              <div className="related-book-author">{book.author}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RelatedBooks;
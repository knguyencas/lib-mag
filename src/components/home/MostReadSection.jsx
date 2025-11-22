import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookService } from '../../services/bookService';
import './MostReadSection.css';

function MostReadSection() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const gridRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const data = await bookService.getMostReadBooks(30);
      setBooks(data);
    } catch (error) {
      console.error('Failed to load books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWheel = (e) => {
    if (!isHovering) return;
    
    e.preventDefault();
    
    if (e.deltaY > 0) {
      setScrollPosition(prev => Math.min(prev + 1, books.length - 1));
    } else {
      setScrollPosition(prev => Math.max(prev - 1, 0));
    }
  };

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    grid.addEventListener('wheel', handleWheel, { passive: false });
    return () => grid.removeEventListener('wheel', handleWheel);
  }, [isHovering, books.length]);

  const getBookStyle = (index) => {
    let marginRight;
    let zIndex;

    if (index < scrollPosition) {
      marginRight = -(240 * 0.8);
      zIndex = index;
    } else if (index === scrollPosition) {
      marginRight = 0;
      zIndex = 100;
      return {
        marginRight: `${marginRight}px`,
        zIndex,
        transform: 'scale(1.05) translateY(-10px)'
      };
    } else if (index === scrollPosition + 1) {
      marginRight = -(240 * 0.25);
      zIndex = 50;
    } else if (index === scrollPosition + 2) {
      marginRight = -(240 * 0.5);
      zIndex = 49;
    } else if (index === scrollPosition + 3) {
      marginRight = -(240 * 0.75);
      zIndex = 48;
    } else {
      marginRight = -(240 * 0.8);
      zIndex = 47 - (index - scrollPosition);
    }

    return {
      marginRight: `${marginRight}px`,
      zIndex,
      transform: 'scale(1) translateY(0)'
    };
  };

  const handleBookClick = (bookId) => {
    navigate(`/book-detail?id=${bookId}`);
  };

  if (loading) {
    return (
      <section className="most_read">
        <h3>MOST READ</h3>
        <div className="most_read_grid">
          <p style={{ color: '#666', padding: '20px' }}>Loading books...</p>
        </div>
      </section>
    );
  }

  if (books.length === 0) {
    return (
      <section className="most_read">
        <h3>MOST READ</h3>
        <div className="most_read_grid">
          <p style={{ color: '#666', padding: '20px' }}>No books available</p>
        </div>
      </section>
    );
  }

  return (
    <section className="most_read">
      <h3>MOST READ</h3>
      <div 
        ref={gridRef}
        className="most_read_grid"
        onMouseEnter={() => {
          setIsHovering(true);
          setScrollPosition(0);
        }}
        onMouseLeave={() => setIsHovering(false)}
      >
        {books.map((book, index) => {
          const coverUrl = book.coverImage_cloud?.url || '';
          
          return (
            <div
              key={book.book_id}
              className="book"
              style={isHovering ? getBookStyle(index) : {}}
              onClick={() => handleBookClick(book.book_id)}
            >
              {coverUrl ? (
                <img src={coverUrl} alt={book.title} />
              ) : (
                <div
                  style={{
                    width: '240px',
                    height: '360px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    padding: '20px',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    fontSize: '18px'
                  }}
                >
                  {book.title}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default MostReadSection;
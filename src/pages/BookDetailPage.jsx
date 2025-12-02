import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import SearchBar from '../components/layout/SearchBar';
import BookCover from '@/components/book/BookCover';
import BookInfo from '@/components/book/BookInfo';
import ContentsSection from '@/components/book/ContentsSection';
import RelatedBooks from '@/components/book/RelatedBooks';
import BookComments from '@/components/book/BookComments';
import { bookDetailService } from '@/services/bookDetailService';
import '../styles/book-detail.css';

function BookDetailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bookId = searchParams.get('id');

  const [book, setBook] = useState(null);
  const [structure, setStructure] = useState(null);
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.body.classList.add('book-detail');
    document.body.classList.remove('home', 'library');
    
    return () => {
      document.body.classList.remove('book-detail');
    };
  }, []);

  useEffect(() => {
    if (!bookId) {
      setError('Book ID not found');
      setLoading(false);
      return;
    }

    loadBookDetails();
  }, [bookId]);

  const loadBookDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const [bookData, structureData, relatedData] = await Promise.all([
        bookDetailService.getBookById(bookId),
        bookDetailService.getBookStructure(bookId),
        bookDetailService.getRelatedBooks(bookId, 4)
      ]);

      setBook(bookData);
      setStructure(structureData || bookData.structure);
      setRelatedBooks(relatedData);

      document.title = `${bookData.title || 'Book'} - Psyche Journey`;
    } catch (err) {
      console.error('Error loading book details:', err);
      setError(err.message || 'Failed to load book details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="book-detail-page">
        <Header />
        <main className="main-content">
          <div style={{ padding: '60px 52px', color: '#666' }}>
            Loading book details...
          </div>
        </main>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="book-detail-page">
        <Header />
        <main className="main-content">
          <div style={{ padding: '60px 52px' }}>
            <h2 style={{ color: '#c33', marginBottom: '16px' }}>Error</h2>
            <p>{error || 'Book not found'}</p>
            <button
              onClick={() => navigate('/library')}
              style={{
                marginTop: '20px',
                padding: '10px 20px',
                background: '#000',
                color: '#fff',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Back to Library
            </button>
          </div>
        </main>
      </div>
    );
  }

  const coverUrl = book.coverImage_cloud?.url || book.coverImage || '';

  return (
    <div className="book-detail-page">
      <Header />
      <SearchBar />

      <main className="main-content">
        <div className="book-detail-wrapper">
          <div className="book-detail-grid">
            <BookCover image={coverUrl} title={book.title} author={book.author} />
            <BookInfo book={book} />
          </div>
        </div>

        <ContentsSection structure={structure} bookId={bookId} />

        <section className="bottom-section">
          <div className="two-column-layout">
            <div className="comments-column">
              <BookComments bookId={bookId} />
            </div>

            <RelatedBooks books={relatedBooks} />
          </div>
        </section>
      </main>
    </div>
  );
}

export default BookDetailPage;
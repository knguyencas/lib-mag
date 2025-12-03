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
import { favoriteService } from '@/services/favoriteService';
import { readingProgressService } from '@/services/readingProgressService';
import { authService } from '@/services/authService';
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

  const [isFavorited, setIsFavorited] = useState(false);
  const [readingProgress, setReadingProgress] = useState(null);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const isLoggedIn = authService.isLoggedIn();

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
    
    if (isLoggedIn) {
      loadFavoriteStatus();
      loadReadingProgress();
    }
  }, [bookId, isLoggedIn]);

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

  const loadFavoriteStatus = async () => {
    try {
      const result = await favoriteService.isFavorited(bookId);
      console.log('Favorite status:', result);
      setIsFavorited(result.isFavorited);
    } catch (err) {
      console.error('Error loading favorite status:', err);
    }
  };

  const loadReadingProgress = async () => {
    try {
      const progress = await readingProgressService.getProgress(bookId);
      console.log('Reading progress:', progress);
      setReadingProgress(progress);
    } catch (err) {
      console.error('Error loading progress:', err);
      setReadingProgress(null);
    }
  };

  const handleToggleFavorite = async () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    console.log('Toggling favorite for bookId:', bookId);
    
    setFavoriteLoading(true);
    try {
      const result = await favoriteService.toggleFavorite(bookId);
      console.log('Toggle result:', result);
      
      setIsFavorited(result.data.action === 'added');
    } catch (err) {
      console.error('Error toggling favorite:', err);
      alert('Failed to update favorite: ' + err.message);
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleStartReading = async () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    try {
      await readingProgressService.updateProgress(bookId, {
        chapter_index: 1,
        scroll_position: 0,
        progress_percentage: 0
      });

      console.log('Started reading from Chapter 1');
      
      navigate(`/reader?id=${bookId}&chapter=1`);
    } catch (err) {
      console.error('Failed to start reading:', err);
      navigate(`/reader?id=${bookId}&chapter=1`);
    }
  };

  const handleContinueReading = () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    const lastChapter = readingProgress?.chapter_index || 1;
    
    console.log(`Continuing from chapter ${lastChapter}`);
    
    navigate(`/reader?id=${bookId}&chapter=${lastChapter}`);
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
  
  const hasProgress = readingProgress && 
                      readingProgress.chapter_index > 0 && 
                      readingProgress.progress_percentage > 0;

  return (
    <div className="book-detail-page">
      <Header />
      <SearchBar />

      <main className="main-content">
        <div className="book-detail-wrapper">
          <div className="book-detail-grid">
            <BookCover image={coverUrl} title={book.title} author={book.author} />
            
            <BookInfo 
              book={book}
              isFavorited={isFavorited}
              onToggleFavorite={handleToggleFavorite}
              favoriteLoading={favoriteLoading}
              hasProgress={hasProgress}
              progressPercentage={readingProgress?.progress_percentage || 0}
              onStartReading={handleStartReading}
              onContinueReading={handleContinueReading}
              isLoggedIn={isLoggedIn}
            />
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
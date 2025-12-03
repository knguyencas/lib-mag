import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import SearchBar from '@/components/layout/SearchBar';
import { favoriteService } from '@/services/favoriteService';
import { authService } from '@/services/authService';
import '@/styles/favorites.css';

function FavoriteBooksPage() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    document.title = 'My Favorites - Psyche Journey';
    document.body.classList.add('favorites');
    document.body.classList.remove('home', 'library', 'book-detail');

    if (!authService.isLoggedIn()) {
      navigate('/login');
      return;
    }

    return () => {
      document.body.classList.remove('favorites');
    };
  }, [navigate]);

  useEffect(() => {
    if (authService.isLoggedIn()) {
      loadFavorites();
    }
  }, [currentPage]);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const result = await favoriteService.getFavorites(currentPage, 12);
      
      console.log('Favorites loaded:', result);
      
      setFavorites(result.data || []);
      setTotalPages(result.pagination?.pages || 1);
      setTotalCount(result.pagination?.total || 0);
    } catch (err) {
      console.error('Error loading favorites:', err);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBookClick = (bookId) => {
    navigate(`/book-detail?id=${bookId}`);
  };

  const handleRemoveFavorite = async (bookId, e) => {
    e.stopPropagation();
    
    if (!confirm('Remove this book from favorites?')) return;

    try {
      await favoriteService.toggleFavorite(bookId);
      await loadFavorites();
    } catch (err) {
      alert('Failed to remove favorite');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="favorites-page">
        <Header />
        <SearchBar />
        <main className="favorites-main">
          <div className="loading">Loading favorites...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="favorites-page">
      <Header />
      <SearchBar />

      <main className="favorites-main">
        <div className="favorites-header">
          <h1>My Favorites</h1>
          <p className="favorites-count">
            {totalCount} {totalCount === 1 ? 'book' : 'books'} saved
          </p>
        </div>

        {favorites.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <h2>No favorites yet</h2>
            <p>Start building your personal library by bookmarking books you love</p>
            <button 
              className="btn-browse"
              onClick={() => navigate('/library')}
            >
              Browse Library
            </button>
          </div>
        ) : (
          <>
            <div className="favorites-grid">
              {favorites.map((fav) => (
                <div
                  key={fav.favorite_id}
                  className="favorite-card"
                  onClick={() => handleBookClick(fav.book.book_id)}
                >
                  <div className="favorite-cover">
                    <img
                      src={fav.book.coverImage_cloud?.url || fav.book.coverImage || '/placeholder-book.png'}
                      alt={fav.book.title}
                      onError={(e) => {
                        e.target.src = '/placeholder-book.png';
                      }}
                    />
                    <button
                      className="btn-remove"
                      onClick={(e) => handleRemoveFavorite(fav.book.book_id, e)}
                      title="Remove from favorites"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="favorite-info">
                    <h3 className="favorite-title">{fav.book.title}</h3>
                    <p className="favorite-author">
                      {fav.book.author?.name || fav.book.author || 'Unknown Author'}
                    </p>
                    <p className="favorite-added">
                      Added {formatDate(fav.added_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="page-btn"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  ← Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    className={`page-btn ${page === currentPage ? 'active' : ''}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}

                <button
                  className="page-btn"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <footer className="footer">
        <p>© 2025 Psyche Journey. Your personal library.</p>
      </footer>
    </div>
  );
}

export default FavoriteBooksPage;
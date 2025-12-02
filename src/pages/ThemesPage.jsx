import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import VisualPostCard from '../components/posts/VisualPostCard';
import { authService } from '../services/authService';
import '../styles/themes.css';
import SearchBar from '../components/layout/SearchBar';

const POSTS_PER_PAGE = 6;

function ThemesPage() {
  const navigate = useNavigate();
  const [visualPosts, setVisualPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    document.title = 'Psyche Journey – Themes';
    document.body.classList.add('themes');
    document.body.classList.remove('home', 'library');

    setIsLoggedIn(authService.isLoggedIn());

    return () => {
      document.body.classList.remove('themes');
    };
  }, []);

  useEffect(() => {
    loadVisualPosts();
  }, [sortBy]);

  const loadVisualPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`http://localhost:3000/api/visualpost?limit=100&sort=${sortBy}`);
      
      if (!response.ok) {
        throw new Error('Failed to load visual posts');
      }

      const result = await response.json();

      if (result.success) {
        const transformedPosts = result.data.map(post => ({
          id: post.post_id,
          title: post.title,
          description: post.content?.substring(0, 150) || '',
          imageUrl: post.image_url || '',
          genre: post.primary_genre || 'General',
          author: post.author_id || { username: 'unknown' },
          createdAt: post.createdAt,
          likes: post.likes || 0,
          views: post.views || 0,
        }));

        setVisualPosts(transformedPosts);
      } else {
        throw new Error(result.message || 'Failed to load posts');
      }

    } catch (err) {
      console.error('Error loading visual posts:', err);
      setError(err.message);
      setVisualPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    navigate('/create-visual-post');
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(visualPosts.length / POSTS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const paginatedPosts = visualPosts.slice(
    startIndex,
    startIndex + POSTS_PER_PAGE
  );

  const handleChangePage = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="themes-page">
        <Header />
        <SearchBar />

        <main className="themes-page-main">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading themes...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="themes-page">
        <Header />
        <main className="themes-page-main">
          <div className="error-state">
            <p style={{ color: '#f48771', marginBottom: '20px' }}>Error: {error}</p>
            <button 
              onClick={loadVisualPosts} 
              style={{
                padding: '12px 24px',
                background: '#f5f5f5',
                color: '#000',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="themes-page">
      <Header />
      <SearchBar />

      <main className="themes-page-main">
        <div style={{ 
          marginBottom: '40px', 
          display: 'flex', 
          justifyContent: 'flex-end',
          gap: '12px',
          alignItems: 'center'
        }}>
          <span style={{ 
            fontSize: '13px', 
            color: '#ccc',
            fontFamily: 'Poppins, sans-serif'
          }}>
            Sort by:
          </span>
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            style={{
              padding: '8px 16px',
              background: '#1a1a1a',
              color: '#f5f5f5',
              border: '1px solid #3b3b3b',
              borderRadius: '6px',
              fontSize: '13px',
              fontFamily: 'Poppins, sans-serif',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="likes">Most Liked</option>
          </select>
        </div>

        {/* POSTS GRID */}
        <section className="themes-grid-wrapper">
          {paginatedPosts.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '80px 20px',
              color: '#999'
            }}>
              <p style={{ fontSize: '16px', marginBottom: '8px' }}>
                No visual posts available yet
              </p>
              <p style={{ fontSize: '13px' }}>
                Be the first to share your visual perspective!
              </p>
            </div>
          ) : (
            <div className="visual-grid">
              {paginatedPosts.map((post) => (
                <VisualPostCard key={post.id} post={post} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="themes-pagination">
              <div className="pagination-inner">
                {Array.from({ length: totalPages }).map((_, index) => {
                  const page = index + 1;
                  return (
                    <button
                      key={page}
                      className={`page-pill ${page === currentPage ? 'active' : ''}`}
                      onClick={() => handleChangePage(page)}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  className="page-next"
                  onClick={() => handleChangePage(Math.min(currentPage + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </section>

        {/* FLOATING CREATE BUTTON */}
        {isLoggedIn && (
          <button className="floating-create-btn" onClick={handleCreatePost}>
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        )}
      </main>

      <footer className="footer">
        <p>© 2025 Psyche Journey. Visual exploration of the mind.</p>
      </footer>
    </div>
  );
}

export default ThemesPage;
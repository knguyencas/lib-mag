import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import SearchBar from '../components/layout/SearchBar';
import Footer from '../components/layout/Footer';
import { authService } from '../services/authService';
import { voteService } from '../services/voteService';
import api from '../services/api';
import '../styles/themes.css';

const POSTS_PER_PAGE = 12;

function ThemesPage() {
  const navigate = useNavigate();

  const [allPosts, setAllPosts] = useState([]);
  const [visualPosts, setVisualPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('newest');

  const [votesState, setVotesState] = useState({});

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
    loadVisualPosts(sortBy);
  }, [sortBy]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && allPosts.length > 0 && authService.isLoggedIn()) {
        console.log('🔄 Page visible, reloading votes...');
        loadUserVotes(allPosts);
      }
    };

    const handleFocus = () => {
      if (allPosts.length > 0 && authService.isLoggedIn()) {
        console.log('Window focused, reloading votes...');
        loadUserVotes(allPosts);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [allPosts]);

  useEffect(() => {
    if (allPosts.length === 0) {
      setVisualPosts([]);
      setTotalPages(1);
      setCurrentPage(1);
      return;
    }

    const pages = Math.ceil(allPosts.length / POSTS_PER_PAGE) || 1;
    setTotalPages(pages);

    const safePage = Math.min(currentPage, pages);
    if (safePage !== currentPage) {
      setCurrentPage(safePage);
      return;
    }

    const start = (safePage - 1) * POSTS_PER_PAGE;
    const sliced = allPosts.slice(start, start + POSTS_PER_PAGE);
    setVisualPosts(sliced);
  }, [allPosts, currentPage]);

  const loadVisualPosts = async (sort = 'newest') => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get('/visualpost', {
        params: {
          limit: 200,
          sort: sort
        }
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to load visual posts');
      }

      const posts = response.data.data || [];
      setAllPosts(posts);
      setCurrentPage(1);

      if (authService.isLoggedIn()) {
        await loadUserVotes(posts);
      } else {
        const initialVotes = {};
        posts.forEach((p) => {
          const id = p.post_id || p.id;
          if (!id) return;
          initialVotes[id] = {
            liked: false,
            likes: p.likes || 0,
          };
        });
        setVotesState(initialVotes);
      }
    } catch (err) {
      console.error('Error loading posts:', err);
      setError(err.message || 'Failed to load themes. Please try again later.');
      setAllPosts([]);
      setVisualPosts([]);
      setVotesState({});
    } finally {
      setLoading(false);
    }
  };

  const loadUserVotes = async (posts) => {
    try {
      const postIds = posts.map(p => p.post_id || p.id).filter(Boolean);
      
      if (postIds.length === 0) return;

      console.log('Loading user votes for', postIds.length, 'posts');

      const votesWithUserData = {};
      
      for (const post of posts) {
        const id = post.post_id || post.id;
        if (!id) continue;
        
        try {
          const vote = await voteService.getMyVote('visual_post', id);
          votesWithUserData[id] = {
            liked: vote?.voteType === 'like',
            likes: post.likes || 0,
          };
        } catch (err) {
          votesWithUserData[id] = {
            liked: false,
            likes: post.likes || 0,
          };
        }
      }

      console.log('User votes loaded:', votesWithUserData);
      setVotesState(votesWithUserData);

    } catch (err) {
      console.error('Error loading user votes:', err);
      
      const initialVotes = {};
      posts.forEach((p) => {
        const id = p.post_id || p.id;
        if (!id) return;
        initialVotes[id] = {
          liked: false,
          likes: p.likes || 0,
        };
      });
      setVotesState(initialVotes);
    }
  };

  const handleChangePage = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCreatePost = () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    navigate('/create-visual-post');
  };

  const handleCardClick = (post) => {
    const id = post.post_id || post.id;
    if (!id) return;
    navigate(`/visual-post/${id}`);
  };

  const handleToggleLike = async (post, e) => {
    e.stopPropagation();
    
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    const id = post.post_id || post.id;
    if (!id) return;

    const currentState = votesState[id] || { liked: false, likes: post.likes || 0 };

    setVotesState((prev) => ({
      ...prev,
      [id]: {
        liked: !currentState.liked,
        likes: currentState.liked ? currentState.likes - 1 : currentState.likes + 1,
      },
    }));

    try {
      const result = await voteService.likeVisualPost(id);
      console.log('Like toggled:', result);
      
      if (result.success) {
        setVotesState((prev) => ({
          ...prev,
          [id]: {
            liked: result.data.action !== 'removed',
            likes: result.data.counts.likes,
          },
        }));
      }
    } catch (err) {
      console.error('Error toggling like:', err);
      
      setVotesState((prev) => ({
        ...prev,
        [id]: currentState,
      }));
      
      alert('Failed to update like');
    }
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
        <SearchBar />
        <main className="themes-page-main">
          <div className="no-results">
            <h3>Error</h3>
            <p>{error}</p>
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
        <div
          style={{
            marginBottom: '32px',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              fontSize: '13px',
              color: '#999',
              fontFamily: 'Poppins, sans-serif',
            }}
          >
            Sort by:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: '8px 16px',
              background: '#111',
              color: '#f5f5f5',
              border: '1px solid #3b3b3b',
              borderRadius: '6px',
              fontSize: '13px',
              fontFamily: 'Poppins, sans-serif',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="likes">Most Liked</option>
          </select>
        </div>

        {visualPosts.length === 0 ? (
          <div className="no-results">
            <h3>No themes found</h3>
            <p>No visual themes found</p>
          </div>
        ) : (
          <div className="visual-grid">
            {visualPosts.map((post) => {
              const id = post.post_id || post.id;
              const title = post.title || 'Article Title';
              const authorUsername =
                post.author_username ||
                post.author?.username ||
                'user_name';
              const imageUrl =
                post.image?.url ||
                post.image_url ||
                post.imageUrl ||
                '';

              const likeInfo = votesState[id] || {
                liked: false,
                likes: post.likes || 0,
              };

              return (
                <div
                  key={id}
                  className="visual-card"
                  onClick={() => handleCardClick(post)}
                >
                  <div className="card-image-container">
                    {imageUrl ? (
                      <img
                        className="card-image"
                        src={imageUrl}
                        alt={title}
                        loading="lazy"
                      />
                    ) : (
                      <div className="card-image placeholder" />
                    )}
                  </div>
                  <div className="card-info">
                    <h3 className="card-title">{title}</h3>
                    <div className="card-meta">
                      <span className="card-author">@{authorUsername}</span>
                    </div>
                    <div className="card-stats">
                      <button
                        className={`heart-button ${
                          likeInfo.liked ? 'liked' : ''
                        }`}
                        onClick={(e) => handleToggleLike(post, e)}
                      >
                        <svg viewBox="0 0 24 24" className="heart-icon">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                      </button>
                      <span className="heart-count">{likeInfo.likes}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <section className="pagination-section">
            {Array.from({ length: totalPages }).map((_, index) => {
              const page = index + 1;
              return (
                <button
                  key={page}
                  className={`page-number ${
                    page === currentPage ? 'active' : ''
                  }`}
                  onClick={() => handleChangePage(page)}
                >
                  {page}
                </button>
              );
            })}

            {currentPage < totalPages && (
              <button
                className="page-next"
                onClick={() => handleChangePage(currentPage + 1)}
              >
                Next
              </button>
            )}
          </section>
        )}
      </main>

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

      <Footer />
    </div>
  );
}

export default ThemesPage;
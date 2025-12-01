import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import { authService } from '../services/authService';
import { perspectiveService } from '../services/perspectiveService';
import '../styles/perspective.css';

const POSTS_PER_PAGE = 5;

function formatShortDate(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  const month = monthNames[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

function PerspectivePage() {
  const navigate = useNavigate();

  const [allPosts, setAllPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchVisible, setSearchVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchError, setSearchError] = useState('');

  const [sortBy, setSortBy] = useState('newest');
  const [genre, setGenre] = useState('all');
  const [genres, setGenres] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [contentRevealed, setContentRevealed] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [votes, setVotes] = useState({});

  useEffect(() => {
    document.title = 'Psyche Journey – Perspective';
    document.body.classList.add('perspective');
    document.body.classList.remove('home', 'library');

    const user = authService.getUser();
    setIsLoggedIn(!!user);

    const handleScroll = () => {
      const y = window.scrollY;
      const reminder = document.querySelector('.reminder-overlay');
      if (reminder) {
        const alpha = Math.max(0, Math.min(1, 1 - y / 400));
        reminder.style.opacity = alpha;
      }
      if (!contentRevealed && y > 80) {
        setContentRevealed(true);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      document.body.classList.remove('perspective');
      window.removeEventListener('scroll', handleScroll);
    };
  }, [contentRevealed]);

  useEffect(() => {
    const loadGenres = async () => {
      try {
        const genreList = await perspectiveService.getGenres();
        setGenres(genreList);
      } catch (err) {
        console.error('Error loading genres:', err);
      }
    };

    loadGenres();
  }, []);

  useEffect(() => {
    loadPosts();
  }, [sortBy, genre, currentPage]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await perspectiveService.getAllPosts({
        page: currentPage,
        limit: POSTS_PER_PAGE,
        sortBy,
        genre
      });

      setAllPosts(result.posts);
      setTotalPages(result.pagination.pages || 1);

      const votesState = {};
      result.posts.forEach(post => {
        votesState[post.post_id || post.id] = {
          upvoted: false,
          downvoted: false,
          upvotes: post.upvotes || 0,
          downvotes: post.downvotes || 0
        };
      });
      setVotes(votesState);

    } catch (err) {
      console.error('Error loading posts:', err);
      setError('Failed to load posts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (contentRevealed) {
      const cards = document.querySelectorAll('.post-card');
      cards.forEach((c) => c.classList.add('visible'));
      const sortPanel = document.querySelector('.sort-panel');
      if (sortPanel) sortPanel.classList.add('visible');
      const pagination = document.querySelector('.perspective-pagination');
      if (pagination) pagination.classList.add('visible');
    }
  }, [contentRevealed, allPosts, currentPage]);

  const handleSearch = () => {
    if (!searchText.trim()) {
      setSearchError('Please enter a search term');
      return;
    }
    setSearchError('');
    navigate(`/search-results?q=${encodeURIComponent(searchText.trim())}`);
  };

  const goToPage = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setContentRevealed(true);
  };

  const handleVote = async (postId, voteType) => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    const currentVote = votes[postId];
    if (!currentVote) return;

    try {
      if (voteType === 'upvote') {
        if (currentVote.upvoted) {
          setVotes(prev => ({
            ...prev,
            [postId]: {
              ...prev[postId],
              upvoted: false,
              upvotes: prev[postId].upvotes - 1
            }
          }));
        } else {
          await perspectiveService.upvotePost(postId);
          setVotes(prev => ({
            ...prev,
            [postId]: {
              ...prev[postId],
              upvoted: true,
              upvotes: prev[postId].upvotes + 1,
              downvoted: false,
              downvotes: prev[postId].downvoted ? prev[postId].downvotes - 1 : prev[postId].downvotes
            }
          }));
        }
      } else {
        if (currentVote.downvoted) {
          setVotes(prev => ({
            ...prev,
            [postId]: {
              ...prev[postId],
              downvoted: false,
              downvotes: prev[postId].downvotes - 1
            }
          }));
        } else {
          await perspectiveService.downvotePost(postId);
          setVotes(prev => ({
            ...prev,
            [postId]: {
              ...prev[postId],
              downvoted: true,
              downvotes: prev[postId].downvotes + 1,
              upvoted: false,
              upvotes: prev[postId].upvoted ? prev[postId].upvotes - 1 : prev[postId].upvotes
            }
          }));
        }
      }
    } catch (err) {
      console.error('Error voting:', err);
    }
  };

  return (
    <div>
      <Header />
      <div className="sub_nav" id="subNav">
        <div className="search_bar">
          {!searchVisible && (
            <button
              id="searchToggle"
              className="search_toggle_btn"
              onClick={() => setSearchVisible(true)}
            >
              Search
            </button>
          )}

          <div
            className={
              'search_input_group' +
              (searchVisible ? ' visible' : '')
            }
            id="searchInputGroup"
          >
            <input
              type="text"
              id="perspectiveSearchInput"
              className="search_input"
              placeholder="Enter"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              id="perspectiveSearchBtn"
              className="search_btn"
              onClick={handleSearch}
            >
              Search
            </button>
          </div>

          <span id="searchError" className="search_error">
            {searchError}
          </span>
        </div>
      </div>

      <section className="reminder-overlay" id="reminderOverlay">
        <div className="reminder-inner">
          <h1 className="reminder-title">Friendly reminder</h1>
          <div className="reminder-text">
            <p>
              Please maintain a respectful, equal, and friendly tone in
              all discussions.
            </p>
            <p>
              Shared content should uphold accuracy and academic
              integrity, avoiding misinformation or distortion.
            </p>
            <p>
              This space is not for political viewpoints or criticism of
              any specific organization or government.
            </p>
            <p>
              Thank you for helping keep this environment positive and
              safe.
            </p>
          </div>
        </div>
      </section>

      <main className="perspective-page">
        <section className="content-row">
          <div className="posts-column" id="postsColumn">
            {loading ? (
              <p>Loading posts...</p>
            ) : error ? (
              <p style={{ color: '#c33' }}>{error}</p>
            ) : allPosts.length === 0 ? (
              <p>No posts yet.</p>
            ) : (
              allPosts.map((post) => {
                const postId = post.post_id || post.id;
                const voteState = votes[postId] || {};

                return (
                  <article
                    key={postId}
                    className="post-card"
                  >
                    <div className="post-date">
                      {formatShortDate(post.updatedAt || post.createdAt)}
                    </div>
                    <div className="post-header">
                      <div className="post-avatar"></div>
                      <div className="post-title-wrapper">
                        <div className="post-topic-line">
                          <span 
                            className="post-topic"
                            onClick={() => navigate(`/perspective-post/${postId}`)}
                            style={{ cursor: 'pointer' }}
                          >
                            {post.title || post.topic}
                          </span>
                          <span className="post-by">
                            By @{post.author?.username || post.author_username || 'anonymous'}
                          </span>
                        </div>
                        {post.tags && post.tags.length > 0 && (
                          <div className="post-tag">
                            {Array.isArray(post.tags) ? post.tags.join(', ') : post.tags}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="post-content">
                      <p>
                        {post.content 
                          ? post.content.substring(0, 500) + (post.content.length > 500 ? '...' : '')
                          : 'Click the topic above to read the full post and comment.'
                        }
                      </p>
                    </div>

                    <div className="post-footer">
                      <span 
                        className={`vote-link ${voteState.upvoted ? 'favorite-active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVote(postId, 'upvote');
                        }}
                      >
                        Upvote ({voteState.upvotes || 0})
                      </span>
                      <span 
                        className={`vote-link ${voteState.downvoted ? 'favorite-active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVote(postId, 'downvote');
                        }}
                      >
                        Downvote ({voteState.downvotes || 0})
                      </span>
                    </div>
                  </article>
                );
              })
            )}
          </div>

          <aside className="sort-column">
            <div className="sort-panel scroll-animate">
              <div className="sort-header-bar">
                <span className="sort-title">Sort And Filter</span>
              </div>

              <div className="sort-label">Sort By</div>
              <div className="sort-divider"></div>
              <select
                className="sort-select"
                id="sortSelect"
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="newest">Newest update (default)</option>
                <option value="upvotes">Most upvote</option>
              </select>

              <div className="sort-label sort-with-label">With</div>
              <div className="sort-divider"></div>
              <select
                className="sort-select"
                id="genreSelect"
                value={genre}
                onChange={(e) => {
                  setGenre(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">All primary genres</option>
                {genres.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>

              <div
                className="clear-filter"
                id="clearFilterBtn"
                onClick={() => {
                  setSortBy('newest');
                  setGenre('all');
                  setCurrentPage(1);
                }}
              >
                Clear Filter
              </div>
            </div>
          </aside>
        </section>

        {totalPages > 1 && (
          <div
            className="perspective-pagination"
            id="perspectivePagination"
          >
            <div className="pagination-inner">
              <button
                className="page-prev"
                disabled={currentPage === 1}
                onClick={() => goToPage(currentPage - 1)}
              >
                Prev
              </button>

              {Array.from({ length: totalPages }).map((_, idx) => {
                const page = idx + 1;
                if (page === currentPage) {
                  return (
                    <div key={page} className="page-dot">
                      {page}
                    </div>
                  );
                }
                return (
                  <button
                    key={page}
                    className="page-number"
                    onClick={() => goToPage(page)}
                  >
                    {page}
                  </button>
                );
              })}

              <button
                className="page-next"
                disabled={currentPage === totalPages}
                onClick={() => goToPage(currentPage + 1)}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </main>

      {isLoggedIn && (
        <button 
          className="floating-create-btn" 
          onClick={() => navigate('/create-perspective-post')}
          title="Create new perspective post"
        >
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

      <footer className="footer">
        <p>
          © 2025 Psyche Journey. A quiet place for thoughts,
          perspectives, and conversations.
        </p>
      </footer>
    </div>
  );
}

export default PerspectivePage;
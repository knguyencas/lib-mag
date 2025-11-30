import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { authService } from '@/services/authService';
import '@/styles/perspective.css';

const API_BASE_URL = 'http://localhost:3000/api';
const POSTS_PER_PAGE = 5;

const MOCK_POSTS = [
  {
    id: '1',
    title: 'On Loneliness and Modern Cities',
    author: 'user_aster',
    tags: ['Psychology', 'Urban life'],
    primary_genre: 'Psychology',
    updatedAt: '2025-11-18T10:00:00Z',
    upvotes: 23,
  },
  {
    id: '2',
    title: 'When Thinking Too Much Becomes a Habit',
    author: 'stckww',
    tags: ['Overthinking'],
    primary_genre: 'Self-help',
    updatedAt: '2025-11-17T16:20:00Z',
    upvotes: 45,
  },
  {
    id: '3',
    title: 'Existential Dread at 2AM',
    author: 'dulce_de_cas',
    tags: ['Existentialism', 'Night thoughts'],
    primary_genre: 'Philosophy',
    updatedAt: '2025-11-16T08:30:00Z',
    upvotes: 12,
  },
  {
    id: '4',
    title: 'Learning to Sit with Discomfort',
    author: 'psyche_reader',
    tags: ['Mindfulness'],
    primary_genre: 'Psychology',
    updatedAt: '2025-11-15T13:15:00Z',
    upvotes: 31,
  },
  {
    id: '5',
    title: 'Why Do We Need Others to See Us?',
    author: 'inner_child',
    tags: ['Attachment', 'Relationships'],
    primary_genre: 'Psychology',
    updatedAt: '2025-11-14T09:10:00Z',
    upvotes: 19,
  },
  {
    id: '6',
    title: 'Notes from a Tired Student',
    author: 'cas',
    tags: ['Burnout'],
    primary_genre: 'Self-help',
    updatedAt: '2025-11-13T21:05:00Z',
    upvotes: 40,
  },
];

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

  const [searchVisible, setSearchVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchError, setSearchError] = useState('');

  const [sortBy, setSortBy] = useState('newest');
  const [genre, setGenre] = useState('all');
  const [genres, setGenres] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [contentRevealed, setContentRevealed] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(false);

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
    const fetchData = async () => {
      try {
        setLoading(true);

        try {
          const res = await fetch(`${API_BASE_URL}/primarygenres`);
          if (res.ok) {
            const json = await res.json();
            const data = json.data || json.genres || [];
            const names = data.map((item) =>
              typeof item === 'string'
                ? item
                : item.name || item.primary_genre || item.genre || ''
            );
            setGenres(names.filter(Boolean));
          } else {
            setGenres([]);
          }
        } catch {
          setGenres([]);
        }

        try {
          const res = await fetch(`${API_BASE_URL}/perspectivepost`);
          if (res.ok) {
            const json = await res.json();
            const raw = json.data || json.posts || [];
            const normalized = raw.map((r) => ({
              id: r.id || r._id || Math.random().toString(36).slice(2),
              title: r.title || r.topic || 'Untitled',
              author:
                r.author?.username ||
                r.author ||
                r.user?.username ||
                r.username ||
                'anonymous',
              tags: r.tags || [],
              primary_genre:
                r.primary_genre || r.primaryGenre || r.genre || 'General',
              updatedAt:
                r.updatedAt || r.lastUpdated || r.createdAt || new Date(),
              upvotes: r.upvotes || r.votes || r.likeCount || 0,
            }));
            setAllPosts(normalized);
          } else {
            setAllPosts(MOCK_POSTS);
          }
        } catch {
          setAllPosts(MOCK_POSTS);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (contentRevealed) {
      const cards = document.querySelectorAll('.post-card');
      cards.forEach((c) => c.classList.add('visible'));
      const sortPanel = document.querySelector('.sort-panel');
      if (sortPanel) sortPanel.classList.add('visible');
      const pagination = document.querySelector('.perspective-pagination');
      if (pagination) pagination.classList.add('visible');
    }
  }, [contentRevealed, allPosts, sortBy, genre, currentPage]);

  const filteredSortedPosts = useMemo(() => {
    let posts = [...allPosts];
    if (genre !== 'all') {
      posts = posts.filter((p) => p.primary_genre === genre);
    }
    if (sortBy === 'newest') {
      posts.sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
      );
    } else if (sortBy === 'upvotes') {
      posts.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
    }
    return posts;
  }, [allPosts, sortBy, genre]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredSortedPosts.length / POSTS_PER_PAGE)
  );

  const pagePosts = useMemo(() => {
    const start = (currentPage - 1) * POSTS_PER_PAGE;
    return filteredSortedPosts.slice(start, start + POSTS_PER_PAGE);
  }, [filteredSortedPosts, currentPage]);

  const handleSearch = () => {
    if (!searchText.trim()) {
      setSearchError('Please enter a search term');
      return;
    }
    setSearchError('');
    navigate(
      `/search-results?q=${encodeURIComponent(searchText.trim())}`
    );
  };

  const goToPage = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setContentRevealed(true);
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
            ) : pagePosts.length === 0 ? (
              <p>No posts yet.</p>
            ) : (
              pagePosts.map((post) => (
                <article
                  key={post.id}
                  className="post-card"
                  onClick={() =>
                    navigate(`/perspective-post/${post.id}`)
                  }
                  style={{ cursor: 'pointer' }}
                >
                  <div className="post-date">
                    {formatShortDate(post.updatedAt)}
                  </div>
                  <div className="post-header">
                    <div className="post-avatar"></div>
                    <div className="post-title-wrapper">
                      <div className="post-topic-line">
                        <span className="post-topic">
                          {post.title}
                        </span>
                        <span className="post-by">
                          By @{post.author}
                        </span>
                      </div>
                      {post.tags && post.tags.length > 0 && (
                        <div className="post-tag">
                          {post.tags.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="post-content">
                    <p>
                      This is the content of the post, when you click on
                      the topic name above, you can see all the pages
                      and allowed to comment.
                    </p>
                    <p>
                      This is the content of the post, when you click on
                      the topic name above, you can see all the pages
                      and allowed to comment.
                    </p>
                    <p>
                      This is the content of the post, when you click on
                      the topic name above, you can see all the pages
                      and allowed to comment.
                    </p>
                    <p>
                      This is the content of the post, when you click on
                      the topic name above, you can see all the pages
                      and allowed to comment.
                    </p>
                    <p>
                      This is the content of the post, when you click on
                      the topic name above, you can see all the pages
                      and allowed to comment.
                    </p>
                  </div>

                  <div className="post-footer">
                    <span className="vote-link">
                      Upvote ({post.upvotes || 0})
                    </span>
                    <span className="vote-link">Downvote</span>
                  </div>
                </article>
              ))
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

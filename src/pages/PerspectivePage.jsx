import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import PerspectivePostCard from '@/components/posts/PerspectivePostCard';
import { authService } from '@/services/authService';
import '@/styles/perspective.css';

function PerspectivePage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState({
    sortBy: 'newest',
    genre: 'all'
  });

  useEffect(() => {
    document.title = 'Psyche Journey – Perspective';
    document.body.classList.add('perspective');
    document.body.classList.remove('home', 'library');

    const user = authService.getUser();
    if (!user) {
      navigate('/login');
      return;
    }

    loadPosts();

    return () => {
      document.body.classList.remove('perspective');
    };
  }, [navigate, filters]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const mockPosts = [
        {
          id: '1',
          title: 'The Role of Archetypes in Modern Psychology',
          content: 'I\'ve been studying Jung\'s work on archetypes and I\'m fascinated by how they appear in modern therapy. Has anyone else noticed these patterns in their own work or personal development? I\'d love to discuss how the concept of the shadow plays out in contemporary settings...',
          genre: 'Psychology',
          tags: ['jung', 'archetypes', 'therapy'],
          author: { username: 'psychstudent' },
          createdAt: '2024-11-29',
          upvotes: 24,
          downvotes: 2,
          commentsCount: 15,
          views: 89
        },
        {
          id: '2',
          title: 'Mindfulness vs. Traditional Meditation',
          content: 'There seems to be a lot of confusion about the difference between mindfulness practices and traditional meditation. From my understanding, mindfulness is more about present-moment awareness while meditation can have various goals. What are your thoughts?',
          genre: 'Mindfulness',
          tags: ['mindfulness', 'meditation', 'practice'],
          author: { username: 'zenmaster' },
          createdAt: '2024-11-28',
          upvotes: 18,
          downvotes: 1,
          commentsCount: 8,
          views: 56
        }
      ];
      
      setPosts(mockPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!searchText.trim()) return;
    console.log('Searching for:', searchText);
  };

  const handleClearFilter = () => {
    setFilters({
      sortBy: 'newest',
      genre: 'all'
    });
  };

  return (
    <div className="perspective-page">
      <Header />

      <div className="sub_nav">
        <div className="search_bar">
          <button className="search_toggle_btn" onClick={() => setSearchVisible(!searchVisible)}>
            Search
          </button>

          {searchVisible && (
            <div className="search_input_group">
              <input
                type="text"
                className="search_input"
                placeholder="Enter"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button className="search_btn" onClick={handleSearch}>Search</button>
            </div>
          )}
        </div>
      </div>

      <section className="reminder-overlay">
        <div className="reminder-inner">
          <h1 className="reminder-title">Friendly reminder</h1>
          <div className="reminder-text">
            <p>Please maintain a respectful, equal, and friendly tone in all discussions.</p>
            <p>Shared content should uphold accuracy and academic integrity.</p>
          </div>
        </div>
      </section>

      <main className="perspective-page-main">
        <section className="content-row">
          <div className="posts-column">
            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading posts...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="empty-state">
                <p>No posts available yet. Be the first to share your perspective!</p>
              </div>
            ) : (
              posts.map(post => (
                <PerspectivePostCard key={post.id} post={post} />
              ))
            )}
          </div>

          <aside className="sort-column">
            <div className="sort-panel">
              <div className="sort-header-bar">
                <span className="sort-title">Sort and Filter</span>
              </div>

              <div className="sort-label">Sort By</div>
              <div className="sort-divider"></div>
              <select 
                className="sort-select" 
                value={filters.sortBy} 
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
              >
                <option value="newest">Newest update</option>
                <option value="upvotes">Most upvote</option>
              </select>

              <div className="sort-label sort-with-label">Filter by Genre</div>
              <div className="sort-divider"></div>
              <select 
                className="sort-select" 
                value={filters.genre} 
                onChange={(e) => setFilters({ ...filters, genre: e.target.value })}
              >
                <option value="all">All genres</option>
                <option value="Psychology">Psychology</option>
                <option value="Philosophy">Philosophy</option>
                <option value="Mindfulness">Mindfulness</option>
              </select>

              <div className="clear-filter" onClick={handleClearFilter}>Clear Filter</div>
            </div>
          </aside>
        </section>
      </main>

      <footer className="footer">
        <p>© 2025 Psyche Journey. A quiet place for thoughts and conversations.</p>
      </footer>
    </div>
  );
}

export default PerspectivePage;

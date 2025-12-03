import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import { authService } from '../services/authService';
import { visualService } from '../services/visualService';
import { voteService } from '@/services/voteService';
import '../styles/visual-post.css';

function VisualPostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchText, setSearchText] = useState('');

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    document.title = 'Psyche Journey – Visual Post';

    const currentUser = authService.getUser();
    if (currentUser) {
      setIsLoggedIn(true);
      setUser(currentUser);
    } else {
      setIsLoggedIn(false);
      setUser(null);
    }

    if (id) {
      loadPost(id);
    }
  }, [id]);

  const loadPost = async (postId) => {
    try {
      setLoading(true);
      console.log('Loading visual post with ID:', postId);
      
      const postData = await visualService.getPostById(postId);
      console.log('Visual post data received:', postData);
      
      if (!postData) {
        console.error('No post data returned from API');
        setPost(null);
        return;
      }
      
      setPost(postData);
      setLikeCount(postData.likes || 0);
      
      if (authService.isLoggedIn()) {
        loadUserVote(postId);
      }
      
    } catch (err) {
      console.error('Error loading visual post:', err);
      setPost(null);
    } finally {
      setLoading(false);
    }
  };

  const loadUserVote = async (postId) => {
    try {
      const vote = await voteService.getMyVote('visual_post', postId);
      console.log('User vote:', vote);
      setLiked(vote?.voteType === 'like');
    } catch (err) {
      console.error('Error loading user vote:', err);
    }
  };

  const formatDate = (dateString) => {
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
  };

  const handleSearch = () => {
    const q = searchText.trim();
    if (!q) return;
    navigate(`/search-results?q=${encodeURIComponent(q)}`);
  };

  const handleLike = async () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount(prev => newLiked ? prev + 1 : Math.max(0, prev - 1));

    try {
      const result = await voteService.likeVisualPost(id);
      console.log('Like result:', result);
      
      if (result.success) {
        setLiked(result.data.action !== 'removed');
        setLikeCount(result.data.counts.likes);
      }
    } catch (err) {
      console.error('Error toggling like:', err);
      
      setLiked(!newLiked);
      setLikeCount(prev => newLiked ? Math.max(0, prev - 1) : prev + 1);
      
      alert('Failed to update like. Please try again.');
    }
  };

  const getImageUrl = () => {
    if (!post) return '';
    
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const imageField = post.image_url || post.image || post.imageUrl || post.photo_url || '';
    
    if (!imageField) return '';
    
    if (imageField.startsWith('http://') || imageField.startsWith('https://')) {
      return imageField;
    }
    
    if (imageField.startsWith('/')) {
      return `${baseUrl}${imageField}`;
    }
    
    return `${baseUrl}/${imageField}`;
  };

  if (loading && !post) {
    return (
      <div className="visual-post-page">
        <Header />
        <main className="post-page">
          <div className="loading-state">Loading post...</div>
        </main>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="visual-post-page">
        <Header />
        <main className="post-page">
          <div className="loading-state">Post not found.</div>
        </main>
      </div>
    );
  }

  const imageUrl = getImageUrl();

  return (
    <div className="visual-post-page">
      <Header />
      <div className="sub_nav">
        <div className="search_bar">
          {!searchVisible && (
            <button
              className="search_toggle_btn"
              onClick={() => setSearchVisible(true)}
            >
              Search
            </button>
          )}

          {searchVisible && (
            <div className="search_input_group visible">
              <input
                type="text"
                className="search_input"
                placeholder="Enter"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearch();
                }}
              />
              <button className="search_btn" onClick={handleSearch}>
                Search
              </button>
            </div>
          )}
        </div>
      </div>

      <main className="post-page">
        <div
          style={{
            maxWidth: '900px',
            margin: '0 auto 16px',
            padding: '0 30px',
          }}
        >
          <Link to="/themes" className="nav-link-inline">
            &larr; Back to Visuals
          </Link>
        </div>

        <section className="visual-post-wrapper">
          <article className="visual-post-card">
            <div className="post-date">{formatDate(post.updatedAt || post.createdAt)}</div>

            <div className="visual-post-image">
              {imageUrl ? (
                <img src={imageUrl} alt={post.title || post.caption || 'Visual post'} />
              ) : (
                <div className="no-image">No image available</div>
              )}
            </div>

            <div className="visual-post-header">
              <div className="post-avatar"></div>
              <div className="post-info">
                <div className="post-author">
                  @{post.author?.username || post.author_username || 'anonymous'}
                </div>
                {(post.caption || post.content) && (
                  <div className="post-caption">
                    {post.caption || post.content}
                  </div>
                )}
                {post.tags && post.tags.length > 0 && (
                  <div className="post-tag">
                    {Array.isArray(post.tags) ? post.tags.join(', ') : post.tags}
                  </div>
                )}
              </div>
            </div>

            <div className="visual-post-footer">
              <button 
                className={`like-btn ${liked ? 'liked' : ''}`}
                onClick={handleLike}
                disabled={!isLoggedIn}
                title={isLoggedIn ? (liked ? 'Unlike' : 'Like') : 'Please log in to like'}
              >
                <span className="heart-icon">{liked ? '❤️' : '🤍'}</span>
                <span className="like-count">{likeCount}</span>
              </button>
            </div>
          </article>
        </section>

      </main>

      <footer className="footer">
        <p>
          © 2025 Psyche Journey. Visual exploration of the mind.
        </p>
      </footer>
    </div>
  );
}

export default VisualPostDetailPage;
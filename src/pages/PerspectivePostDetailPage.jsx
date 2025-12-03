import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { authService } from '@/services/authService';
import { perspectiveService } from '@/services/perspectiveService';
import PerspectiveVoteButtons from '@/components/posts/PerspectivePostVoteButtons';
import PerspectiveComments from '@/components/posts/PerspectiveComments';

import '@/styles/perspective-post.css';
import '@/components/posts/PerspectivePostCard.css';

function PerspectivePostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [loadingPost, setLoadingPost] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    document.title = 'Psyche Journey – Perspective Post';

    const currentUser = authService.getUser();
    setIsLoggedIn(!!currentUser);

    if (id) {
      loadPost(id);
    }
  }, [id]);

  const loadPost = async (postId) => {
    try {
      setLoadingPost(true);
      const postData = await perspectiveService.getPostById(postId);

      if (!postData) {
        setPost(null);
        return;
      }

      setPost(postData);
    } catch (err) {
      console.error('Error loading post detail:', err);
      setPost(null);
    } finally {
      setLoadingPost(false);
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

  if (loadingPost && !post) {
    return (
      <div className="perspective-post-page">
        <Header />
        <main className="perspective-detail-main">
          <div className="loading-state">Loading post...</div>
        </main>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="perspective-post-page">
        <Header />
        <main className="perspective-detail-main">
          <div className="loading-state" style={{ color: '#c33' }}>
            Post not found.
          </div>
        </main>
      </div>
    );
  }

  const paragraphs = (post.content || '')
    .split(/\n\s*\n/)
    .filter((p) => p.trim().length > 0);

  return (
    <div className="perspective-post-page">
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

      <main className="perspective-detail-main">
        <div className="perspective-detail-inner">
          <div className="detail-top-row">
            <Link to="/perspective" className="nav-link-inline">
              &larr; Back to Perspective
            </Link>
          </div>

          <article className="perspective-post-card perspective-post-card--detail">
            <div className="post-main-content">
              <div className="post-header">
                <div className="post-author-info">
                  <div className="post-avatar">
                    {post.authorUsername?.[0]?.toUpperCase() ||
                      post.author?.username?.[0]?.toUpperCase() ||
                      'P'}
                  </div>
                  <div className="post-author-details">
                    <div className="post-author-name">
                      @{post.authorUsername || post.author?.username || 'anonymous'}
                    </div>
                    <div className="post-date">
                      {formatDate(post.updatedAt || post.created_at)}
                    </div>
                  </div>
                </div>

                {post.primary_genre && (
                  <div className="post-genre-badge">
                    {post.primary_genre}
                  </div>
                )}
              </div>

              <h3 className="post-title">{post.topic || post.title}</h3>

              <div className="post-content-full">
                {paragraphs.length === 0 ? (
                  <p>{post.content || 'No content available for this post.'}</p>
                ) : (
                  paragraphs.map((p, idx) => <p key={idx}>{p}</p>)
                )}
              </div>

              {Array.isArray(post.tags) && post.tags.length > 0 && (
                <div className="post-tags">
                  {post.tags.map((tag) => (
                    <span key={tag} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="post-footer">
              <div className="footer-left">
                <PerspectiveVoteButtons 
                  postId={post.post_id} 
                  initialUpvotes={post.upvotes || 0}
                  initialDownvotes={post.downvotes || 0}
                />
                <span className="comment-count-footer">
                  💬 {post.commentsCount || 0}
                </span>
              </div>
            </div>
          </article>

          <PerspectiveComments 
            postId={post.post_id} 
            onCommentChange={() => loadPost(id)}
          />
        </div>
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

export default PerspectivePostDetailPage;
import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { authService } from '@/services/authService';
import { perspectiveService } from '@/services/perspectiveService';

import '@/styles/perspective-post.css';
import '@/components/posts/PerspectivePostCard.css';

function PerspectivePostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loadingPost, setLoadingPost] = useState(true);
  const [loadingComments, setLoadingComments] = useState(true);

  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [searchVisible, setSearchVisible] = useState(false);
  const [searchText, setSearchText] = useState('');

  const [upvoted, setUpvoted] = useState(false);
  const [downvoted, setDownvoted] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(0);
  const [downvoteCount, setDownvoteCount] = useState(0);

  useEffect(() => {
    document.title = 'Psyche Journey – Perspective Post';

    const currentUser = authService.getUser();
    setIsLoggedIn(!!currentUser);

    if (id) {
      loadPost(id);
      loadComments(id);
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
      setUpvoteCount(postData.upvotes || 0);
      setDownvoteCount(postData.downvotes || 0);
    } catch (err) {
      console.error('Error loading post detail:', err);
      setPost(null);
    } finally {
      setLoadingPost(false);
    }
  };

  const loadComments = async (postId) => {
    try {
      setLoadingComments(true);
      const commentsData = await perspectiveService.getComments(postId);
      setComments(commentsData || []);
    } catch (err) {
      console.error('Error loading comments:', err);
      setComments([]);
    } finally {
      setLoadingComments(false);
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

  const handleSubmitComment = async (e) => {
    if (e) e.preventDefault();
    const text = commentText.trim();
    if (!text) return;

    if (!authService.isLoggedIn()) {
      navigate('/login');
      return;
    }

    try {
      setSubmitting(true);
      const newComment = await perspectiveService.addComment(id, text);
      setComments((prev) => [newComment, ...prev]);
      setCommentText('');
    } catch (err) {
      console.error('Error submitting comment:', err);
      alert('Failed to add comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCommentKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitComment(e);
    }
  };

  const handleUpvote = () => {
    if (upvoted) {
      setUpvoted(false);
      setUpvoteCount((prev) => Math.max(0, prev - 1));
    } else {
      setUpvoted(true);
      setUpvoteCount((prev) => prev + 1);
      if (downvoted) {
        setDownvoted(false);
        setDownvoteCount((prev) => Math.max(0, prev - 1));
      }
    }
  };

  const handleDownvote = () => {
    if (downvoted) {
      setDownvoted(false);
      setDownvoteCount((prev) => Math.max(0, prev - 1));
    } else {
      setDownvoted(true);
      setDownvoteCount((prev) => prev + 1);
      if (upvoted) {
        setUpvoted(false);
        setUpvoteCount((prev) => Math.max(0, prev - 1));
      }
    }
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
              <div className="vote-section">
                <button
                  className={`vote-button upvote ${upvoted ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUpvote();
                  }}
                >
                  ▲ {upvoteCount}
                </button>
                <button
                  className={`vote-button downvote ${downvoted ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownvote();
                  }}
                >
                  ▼ {downvoteCount}
                </button>
              </div>

              <div className="post-stats detail-stats">
                <span className="stat-item">
                  {comments.length} comments
                </span>
              </div>
            </div>
          </article>

          <section className="comment-title-wrapper">
            <h2 className="comment-title">Comment</h2>
          </section>

          <section className="comments-wrapper">
            {loadingComments ? (
              <div className="loading-state">Loading comments...</div>
            ) : comments.length === 0 ? (
              <div className="no-comments">No comments yet.</div>
            ) : (
              comments.map((comment) => (
                <article
                  key={comment.id || comment._id}
                  className="comment-card comment-root"
                >
                  <div className="comment-date">
                    {formatDate(comment.createdAt)}
                  </div>
                  <div className="comment-header">
                    <div className="comment-avatar" />
                    <div className="comment-meta">
                      <span className="comment-user">
                        @{comment.user?.username || comment.username || 'User'}
                      </span>
                    </div>
                  </div>
                  <div className="comment-body">
                    {comment.content || comment.text || ''}
                  </div>
                  <div className="comment-footer">
                    <span className="comment-action">Reply</span>
                    <span className="comment-action">Upvote</span>
                    <span className="comment-action">Downvote</span>
                  </div>
                </article>
              ))
            )}
          </section>

          <section className="comment-form-wrapper">
            <div className="comment-form-card">
              <form onSubmit={handleSubmitComment}>
                <textarea
                  className="comment-input"
                  placeholder={
                    isLoggedIn ? 'Comment...' : 'Please log in to comment'
                  }
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={handleCommentKeyDown}
                  disabled={!isLoggedIn || submitting}
                />
                <button
                  type="submit"
                  className="comment-submit-btn"
                  disabled={submitting || !isLoggedIn}
                >
                  {submitting ? 'Submitting…' : 'Enter'}
                </button>
              </form>
            </div>

            {!isLoggedIn && (
              <div className="comment-login-hint">
                You can still type your thoughts here. When you submit,
                you'll be asked to log in so your comment can be posted
                under your account.
              </div>
            )}
          </section>
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

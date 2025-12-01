import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import { authService } from '../services/authService';
import { perspectiveService } from '../services/perspectiveService';
import '../styles/perspective-post.css';

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
  const [user, setUser] = useState(null);

  const [searchVisible, setSearchVisible] = useState(false);
  const [searchText, setSearchText] = useState('');

  const [voteState, setVoteState] = useState({
    upvoted: false,
    downvoted: false,
    upvotes: 0,
    downvotes: 0
  });

  useEffect(() => {
    document.title = 'Psyche Journey – Perspective Post';

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
      loadComments(id);
    }
  }, [id]);

  const loadPost = async (postId) => {
    try {
      setLoadingPost(true);
      const postData = await perspectiveService.getPostById(postId);
      setPost(postData);
      
      setVoteState({
        upvoted: false,
        downvoted: false,
        upvotes: postData.upvotes || 0,
        downvotes: postData.downvotes || 0
      });
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
      setComments(commentsData);
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

  const paragraphs = (post?.content || '')
    .split(/\n\s*\n/)
    .filter((p) => p.trim().length > 0);

  const handleSearch = () => {
    const q = searchText.trim();
    if (!q) return;
    navigate(`/search-results?q=${encodeURIComponent(q)}`);
  };

  const handleSubmitComment = async (e) => {
    if (e) e.preventDefault();
    const text = commentText.trim();
    if (!text) return;

    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    try {
      setSubmitting(true);
      const newComment = await perspectiveService.addComment(id, text);
      
      setComments(prev => [{
        id: newComment.id || newComment._id,
        user: '@' + (user.username || 'User'),
        content: text,
        createdAt: new Date().toISOString(),
        isRoot: true
      }, ...prev]);
      
      setCommentText('');
    } catch (err) {
      console.error('Error submitting comment:', err);
      alert('Failed to post comment. Please try again.');
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

  const handleVote = async (voteType) => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    try {
      if (voteType === 'upvote') {
        if (voteState.upvoted) {
          setVoteState(prev => ({
            ...prev,
            upvoted: false,
            upvotes: prev.upvotes - 1
          }));
        } else {
          await perspectiveService.upvotePost(id);
          setVoteState(prev => ({
            ...prev,
            upvoted: true,
            upvotes: prev.upvotes + 1,
            downvoted: false,
            downvotes: prev.downvoted ? prev.downvotes - 1 : prev.downvotes
          }));
        }
      } else {
        if (voteState.downvoted) {
          setVoteState(prev => ({
            ...prev,
            downvoted: false,
            downvotes: prev.downvotes - 1
          }));
        } else {
          await perspectiveService.downvotePost(id);
          setVoteState(prev => ({
            ...prev,
            downvoted: true,
            downvotes: prev.downvotes + 1,
            upvoted: false,
            upvotes: prev.upvoted ? prev.upvotes - 1 : prev.upvotes
          }));
        }
      }
    } catch (err) {
      console.error('Error voting:', err);
    }
  };

  if (loadingPost && !post) {
    return (
      <div className="perspective-post-page">
        <Header />
        <main className="post-page">
          <div className="loading-state">Loading post...</div>
        </main>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="perspective-post-page">
        <Header />
        <main className="post-page">
          <div className="loading-state">Post not found.</div>
        </main>
      </div>
    );
  }

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

      <main className="post-page">
        <div
          style={{
            maxWidth: '1174px',
            margin: '0 auto 16px',
            padding: '0 30px',
          }}
        >
          <Link to="/perspective" className="nav-link-inline">
            &larr; Back to Perspective
          </Link>
        </div>

        <section className="post-wrapper">
          <article className="post-card">
            <div className="post-date">{formatDate(post.updatedAt || post.createdAt)}</div>

            <div className="post-header">
              <div className="post-avatar"></div>
              <div className="post-title-wrapper">
                <div className="post-topic-line">
                  <span className="post-topic">{post.title || post.topic}</span>
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
              {paragraphs.length === 0 ? (
                <p>No content available.</p>
              ) : (
                paragraphs.map((p, idx) => <p key={idx}>{p}</p>)
              )}
            </div>

            <div className="post-footer">
              <span 
                className={`vote-link ${voteState.upvoted ? 'favorite-active' : ''}`}
                onClick={() => handleVote('upvote')}
              >
                Upvote ({voteState.upvotes})
              </span>
              <span 
                className={`vote-link ${voteState.downvoted ? 'favorite-active' : ''}`}
                onClick={() => handleVote('downvote')}
              >
                Downvote ({voteState.downvotes})
              </span>
            </div>
          </article>
        </section>

        <section className="comment-title-wrapper">
          <h2 className="comment-title">Comment ({comments.length})</h2>
        </section>

        <section className="comments-wrapper">
          {loadingComments ? (
            <div className="loading-state">Loading comments...</div>
          ) : comments.length === 0 ? (
            <div className="no-comments">No comments yet. Be the first to share your thoughts!</div>
          ) : (
            comments.map((c) => (
              <article
                key={c.id || c._id}
                className={`comment-card ${
                  c.isRoot ? 'comment-root' : 'comment-reply'
                }`}
              >
                <div className="comment-date">
                  {formatDate(c.createdAt)}
                </div>
                <div className="comment-header">
                  <div className="comment-avatar"></div>
                  <div className="comment-meta">
                    <span className="comment-user">
                      {c.user || '@' + (c.author?.username || 'anonymous')}
                    </span>
                  </div>
                </div>
                <div className="comment-body">{c.content}</div>
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
                  isLoggedIn
                    ? 'Share your thoughts...'
                    : 'Please log in to comment'
                }
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={handleCommentKeyDown}
                disabled={!isLoggedIn}
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
              <Link to="/login">Log in</Link> to share your thoughts and join the conversation.
            </div>
          )}
        </section>
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
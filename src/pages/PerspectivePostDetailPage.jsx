import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { authService } from '@/services/authService';
import '@/styles/perspective-post.css';

const API_BASE_URL = 'http://localhost:3000/api';

function normalizePostFromApi(raw, fallbackId) {
  if (!raw) return null;

  const id = raw.id || raw._id || fallbackId;
  const title = raw.title || raw.topic || 'Post Topic';
  const authorUsername =
    raw.author?.username ||
    raw.user?.username ||
    raw.username ||
    'User_name';
  const tags = raw.tags || raw.tag || [];
  const updatedAt = raw.updatedAt || raw.lastUpdated || raw.createdAt || null;
  const content =
    raw.content ||
    raw.body ||
    `This is the content of the post, when you click on the topic name above, you can see all the pages and are allowed to comment.`;

  return {
    id,
    title,
    authorUsername,
    tags,
    updatedAt,
    content,
  };
}

function normalizeCommentFromApi(raw) {
  if (!raw) return null;

  return {
    id: raw.id || raw._id || Math.random().toString(36).slice(2),
    user:
      '@' +
      (raw.user?.username ||
        raw.username ||
        raw.userName ||
        'User_name'),
    content: raw.content || raw.text || '',
    createdAt: raw.createdAt || raw.updatedAt || null,
    isRoot: !raw.parentId && !raw.parent,
  };
}

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
      const res = await fetch(`${API_BASE_URL}/perspectivepost/${postId}`);
      if (!res.ok) {
        throw new Error(`Failed to load post: ${res.status}`);
      }
      const json = await res.json();
      const raw = json.data || json.post || json;
      const mapped = normalizePostFromApi(raw, postId);
      setPost(mapped);
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
      const res = await fetch(
        `${API_BASE_URL}/comments/perspective/${postId}`
      );
      if (!res.ok) {
        throw new Error(`Failed to load comments: ${res.status}`);
      }
      const json = await res.json();
      const rawComments = json.data || json.comments || [];
      const mapped = rawComments
        .map((c) => normalizeCommentFromApi(c))
        .filter(Boolean);
      setComments(mapped);
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
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
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

    if (!authService.isLoggedIn()) {
      navigate('/login');
      return;
    }

    try {
      setSubmitting(true);
      const currentUser = authService.getUser();

      const res = await fetch(
        `${API_BASE_URL}/comments/perspective/${id}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: currentUser.id || currentUser._id,
            content: text,
          }),
        }
      );

      if (!res.ok) {
        throw new Error(`Failed to add comment: ${res.status}`);
      }

      const json = await res.json();
      const createdRaw = json.data || json.comment || json;
      const created = normalizeCommentFromApi(createdRaw);

      const fallbackComment =
        created ||
        normalizeCommentFromApi({
          content: text,
          user: { username: currentUser.username },
          createdAt: new Date().toISOString(),
        });

      setComments((prev) => [fallbackComment, ...prev]);
      setCommentText('');
    } catch (err) {
      console.error('Error submitting comment:', err);
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
            <div className="post-date">{formatDate(post.updatedAt)}</div>

            <div className="post-header">
              <div className="post-avatar"></div>
              <div className="post-title-wrapper">
                <div className="post-topic-line">
                  <span className="post-topic">{post.title}</span>
                  <span className="post-by">
                    By @{post.authorUsername}
                  </span>
                </div>
                <div className="post-tag">
                  {Array.isArray(post.tags)
                    ? post.tags.join(', ')
                    : ''}
                </div>
              </div>
            </div>

            <div className="post-content">
              {paragraphs.length === 0 ? (
                <p>
                  This is the content of the post, when you click on
                  the topic name above, you can see all the pages and
                  are allowed to comment.
                </p>
              ) : (
                paragraphs.map((p, idx) => <p key={idx}>{p}</p>)
              )}
            </div>

            <div className="post-footer">
              <span className="vote-link">Upvote</span>
              <span className="vote-link">Downvote</span>
            </div>
          </article>
        </section>

        <section className="comment-title-wrapper">
          <h2 className="comment-title">Comment</h2>
        </section>

        <section className="comments-wrapper">
          {loadingComments ? (
            <div className="loading-state">Loading comments...</div>
          ) : comments.length === 0 ? (
            <div className="no-comments">No comments yet.</div>
          ) : (
            comments.map((c) => (
              <article
                key={c.id}
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
                    <span className="comment-user">{c.user}</span>
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
                    ? 'Comment...'
                    : 'Please log in to comment'
                }
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={handleCommentKeyDown}
              />
              <button
                type="submit"
                className="comment-submit-btn"
                disabled={submitting}
              >
                {submitting ? 'Submitting…' : 'Enter'}
              </button>
            </form>
          </div>

          {!isLoggedIn && (
            <div className="comment-login-hint">
              You can still type your thoughts here. When you submit,
              you’ll be asked to log in so your comment can be posted
              under your account.
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

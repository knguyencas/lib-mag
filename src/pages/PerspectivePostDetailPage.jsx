import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { authService } from '@/services/authService';
import { perspectiveService } from '@/services/perspectiveService';
import '@/styles/perspective-post.css';

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
      console.log('🔍 Loading perspective post:', postId);
      
      const postData = await perspectiveService.getPostById(postId);
      console.log('Mapped post data:', postData);
      
      if (!postData) {
        console.error('No post data returned');
        setPost(null);
        return;
      }

      console.log('📝 Setting post state with:', {
        title: postData.title,
        content: postData.content,
        contentLength: postData.content?.length,
        author: postData.authorUsername
      });

      setPost(postData);
      
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
      console.log('Comments loaded:', commentsData);
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
      console.log('Comment added:', newComment);
      
      setComments(prev => [newComment, ...prev]);
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

  if (loadingPost && !post) {
    return (
      <div className="perspective-post-page">
        <Header />
        <main className="post-page">
          <div className="loading-state" style={{ color: '#000', padding: '60px 20px' }}>
            Loading post...
          </div>
        </main>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="perspective-post-page">
        <Header />
        <main className="post-page">
          <div className="loading-state" style={{ color: '#c33', padding: '60px 20px' }}>
            Post not found.
          </div>
        </main>
      </div>
    );
  }

  const paragraphs = (post.content || '')
    .split(/\n\s*\n/)
    .filter((p) => p.trim().length > 0);

  console.log('Content paragraphs:', paragraphs);
  console.log('First paragraph:', paragraphs[0]);
  
  const MAX_PARAGRAPHS = 3;
  const MAX_CHARS = 500;
  
  let displayParagraphs = paragraphs.slice(0, MAX_PARAGRAPHS);
  let fullText = displayParagraphs.join('\n\n');
  
  if (fullText.length > MAX_CHARS) {
    fullText = fullText.substring(0, MAX_CHARS) + '...';
    displayParagraphs = [fullText];
  } else if (paragraphs.length > MAX_PARAGRAPHS) {
    displayParagraphs[displayParagraphs.length - 1] += '...';
  }

  console.log('Display paragraphs:', displayParagraphs);

  return (
    <div className="perspective-post-page" style={{ backgroundColor: '#F3F3F3', minHeight: '100vh' }}>
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

      <main className="post-page" style={{ padding: '60px 0 80px' }}>
        <div
          style={{
            maxWidth: '1174px',
            margin: '0 auto 16px',
            padding: '0 30px',
          }}
        >
          <Link 
            to="/perspective" 
            className="nav-link-inline"
            style={{
              color: '#000',
              textDecoration: 'none',
              fontSize: '14px',
              fontFamily: 'Poppins, sans-serif'
            }}
          >
            &larr; Back to Perspective
          </Link>
        </div>

        <section className="post-wrapper" style={{ display: 'flex', justifyContent: 'center' }}>
          <article 
            className="post-card" 
            style={{
              background: '#D9D9D9',
              width: '1174px',
              minHeight: '303px',
              padding: '24px 30px',
              position: 'relative',
              marginBottom: '40px'
            }}
          >
            <div 
              className="post-date" 
              style={{
                position: 'absolute',
                right: '32px',
                top: '26px',
                color: '#828282',
                fontFamily: 'Consolas, monospace',
                fontSize: '12px'
              }}
            >
              {formatDate(post.updatedAt)}
            </div>

            <div className="post-header" style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <div 
                className="post-avatar" 
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: '#915656',
                  flexShrink: 0
                }}
              ></div>
              <div className="post-title-wrapper">
                <div className="post-topic-line" style={{ display: 'flex', gap: '7px', alignItems: 'baseline' }}>
                  <span 
                    className="post-topic"
                    style={{
                      color: '#2A2A2A',
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '20px',
                      fontWeight: 400,
                      textDecoration: 'underline'
                    }}
                  >
                    {post.title}
                  </span>
                  <span 
                    className="post-by"
                    style={{
                      color: '#2A2A2A',
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '20px',
                      fontWeight: 300
                    }}
                  >
                    By @{post.authorUsername}
                  </span>
                </div>
                {post.tags && post.tags.length > 0 && (
                  <div 
                    className="post-tag"
                    style={{
                      marginTop: '2px',
                      fontSize: '13px',
                      color: '#666',
                      fontFamily: 'Poppins, sans-serif'
                    }}
                  >
                    {Array.isArray(post.tags)
                      ? post.tags.join(', ')
                      : post.tags}
                  </div>
                )}
              </div>
            </div>

            <div 
              className="post-content" 
              style={{
                marginTop: '10px',
                width: '100%',
                color: '#000',
                fontFamily: 'Cardo, serif',
                fontSize: '20px',
                fontWeight: 400,
                lineHeight: '110%',
                letterSpacing: '-0.6px'
              }}
            >
              {displayParagraphs.length === 0 ? (
                <p style={{ color: '#000', margin: 0 }}>
                  {post.content || 'No content available for this post.'}
                </p>
              ) : (
                displayParagraphs.map((p, idx) => (
                  <p key={idx} style={{ color: '#000', marginTop: idx > 0 ? '4px' : 0 }}>
                    {p}
                  </p>
                ))
              )}
            </div>

            <div 
              className="post-footer" 
              style={{
                marginTop: 'auto',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '60px',
                paddingRight: '32px',
                paddingTop: '20px'
              }}
            >
              <span 
                className="vote-link"
                style={{
                  color: '#000',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '14px',
                  fontStyle: 'italic',
                  cursor: 'pointer'
                }}
              >
                Upvote
              </span>
              <span 
                className="vote-link"
                style={{
                  color: '#000',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '14px',
                  fontStyle: 'italic',
                  cursor: 'pointer'
                }}
              >
                Downvote
              </span>
            </div>
          </article>
        </section>

        <section 
          className="comment-title-wrapper" 
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: '40px'
          }}
        >
          <h2 
            className="comment-title"
            style={{
              width: '1174px',
              fontFamily: 'Poppins, sans-serif',
              fontSize: '22px',
              fontWeight: 600,
              color: '#000'
            }}
          >
            Comment
          </h2>
        </section>

        <section 
          className="comments-wrapper"
          style={{
            marginTop: '24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '25px'
          }}
        >
          {loadingComments ? (
            <div className="loading-state" style={{ color: '#666', padding: '40px 20px' }}>
              Loading comments...
            </div>
          ) : comments.length === 0 ? (
            <div className="no-comments" style={{ color: '#666', padding: '40px 20px' }}>
              No comments yet.
            </div>
          ) : (
            comments.map((comment) => (
              <article
                key={comment.id || comment._id}
                className="comment-card comment-root"
                style={{
                  background: '#D9D9D9',
                  width: '1174px',
                  minHeight: '150px',
                  padding: '24px 30px',
                  position: 'relative'
                }}
              >
                <div 
                  className="comment-date"
                  style={{
                    position: 'absolute',
                    right: '32px',
                    top: '26px',
                    color: '#828282',
                    fontFamily: 'Consolas, monospace',
                    fontSize: '12px'
                  }}
                >
                  {formatDate(comment.createdAt)}
                </div>
                <div className="comment-header" style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '18px' }}>
                  <div 
                    className="comment-avatar"
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      background: '#915656'
                    }}
                  ></div>
                  <div className="comment-meta">
                    <span 
                      className="comment-user"
                      style={{
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '16px',
                        fontWeight: 400,
                        color: '#000'
                      }}
                    >
                      @{comment.user?.username || comment.username || 'User'}
                    </span>
                  </div>
                </div>
                <div 
                  className="comment-body"
                  style={{
                    marginTop: '4px',
                    fontFamily: 'Cardo, serif',
                    fontSize: '16px',
                    lineHeight: 1.4,
                    color: '#000'
                  }}
                >
                  {comment.content || comment.text || ''}
                </div>
                <div 
                  className="comment-footer"
                  style={{
                    marginTop: 'auto',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '40px',
                    paddingRight: '32px',
                    paddingTop: '12px'
                  }}
                >
                  <span 
                    className="comment-action"
                    style={{
                      color: '#000',
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '13px',
                      fontStyle: 'italic',
                      cursor: 'pointer'
                    }}
                  >
                    Reply
                  </span>
                  <span 
                    className="comment-action"
                    style={{
                      color: '#000',
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '13px',
                      fontStyle: 'italic',
                      cursor: 'pointer'
                    }}
                  >
                    Upvote
                  </span>
                  <span 
                    className="comment-action"
                    style={{
                      color: '#000',
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '13px',
                      fontStyle: 'italic',
                      cursor: 'pointer'
                    }}
                  >
                    Downvote
                  </span>
                </div>
              </article>
            ))
          )}
        </section>

        <section 
          className="comment-form-wrapper"
          style={{
            marginTop: '40px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <div 
            className="comment-form-card"
            style={{
              width: '1174px',
              background: '#FFFFFF',
              padding: '18px 18px 40px 18px',
              cursor: 'text',
              border: '1px solid #D0D0D0'
            }}
          >
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
                disabled={!isLoggedIn || submitting}
                style={{
                  width: '100%',
                  minHeight: '120px',
                  border: 'none',
                  outline: 'none',
                  resize: 'vertical',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '14px',
                  background: '#FFFFFF',
                  cursor: 'text',
                  color: '#000'
                }}
              />
              <button
                type="submit"
                className="comment-submit-btn"
                disabled={submitting || !isLoggedIn}
                style={{
                  marginTop: '18px',
                  float: 'right',
                  padding: '6px 24px',
                  border: 'none',
                  background: '#D9D9D9',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '13px',
                  cursor: 'pointer',
                  color: '#000'
                }}
              >
                {submitting ? 'Submitting…' : 'Enter'}
              </button>
            </form>
          </div>

          {!isLoggedIn && (
            <div 
              className="comment-login-hint"
              style={{
                width: '1174px',
                fontSize: '13px',
                fontFamily: 'Poppins, sans-serif',
                color: '#666',
                marginTop: '4px'
              }}
            >
              You can still type your thoughts here. When you submit,
              you'll be asked to log in so your comment can be posted
              under your account.
            </div>
          )}
        </section>
      </main>

      <footer 
        className="footer"
        style={{
          borderTop: '1px solid #E0E0E0',
          padding: '24px 52px 40px',
          fontSize: '12px',
          color: '#666',
          background: '#F3F3F3',
          textAlign: 'left'
        }}
      >
        <p>
          © 2025 Psyche Journey. A quiet place for thoughts,
          perspectives, and conversations.
        </p>
      </footer>
    </div>
  );
}

export default PerspectivePostDetailPage;
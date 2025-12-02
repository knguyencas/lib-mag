import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import SearchBar from '@/components/layout/SearchBar';
import { authService } from '@/services/authService';
import { perspectiveService } from '@/services/perspectiveService';

function PerspectivePage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    document.title = 'Perspective – Psyche Journey';
    
    const currentUser = authService.getUser();
    setIsLoggedIn(!!currentUser);

    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔍 Loading published posts...');
      
      const postsData = await perspectiveService.getPublishedPosts({
        page: 1,
        limit: 20,
        sort: 'newest'
      });
      
      console.log('Posts loaded:', postsData.length);
      console.log('First post:', postsData[0]);
      
      setPosts(postsData);
      
    } catch (err) {
      console.error('Error loading posts:', err);
      setError('Failed to load posts. Please try again.');
    } finally {
      setLoading(false);
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

  const truncateContent = (content, maxLength = 200) => {
    if (!content) return '';
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const handlePostClick = (postId) => {
    navigate(`/perspective-post/${postId}`);
  };

  const handleCreatePost = () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    navigate('/create-perspective-post');
  };

  return (
    <div style={{ backgroundColor: '#F3F3F3', minHeight: '100vh' }}>
      <Header />
      <SearchBar />
      
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 20px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '40px'
        }}>
          <h1 style={{
            fontFamily: 'Poppins, sans-serif',
            fontSize: '32px',
            fontWeight: 600,
            color: '#000',
            margin: 0
          }}>
            Perspective
          </h1>
          
          <button
            onClick={handleCreatePost}
            style={{
              padding: '12px 24px',
              backgroundColor: '#2A2A2A',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '4px',
              fontFamily: 'Poppins, sans-serif',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            Create Post
          </button>
        </div>

        {loading && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#666',
            fontFamily: 'Poppins, sans-serif',
            fontSize: '16px'
          }}>
            Loading posts...
          </div>
        )}

        {error && !loading && (
          <div style={{
            background: '#ffe6e6',
            border: '1px solid #ffcccc',
            color: '#cc0000',
            padding: '16px 20px',
            borderRadius: '4px',
            marginBottom: '20px',
            fontFamily: 'Poppins, sans-serif',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            {error}
            <button
              onClick={loadPosts}
              style={{
                marginLeft: '16px',
                padding: '6px 16px',
                backgroundColor: '#cc0000',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '13px'
              }}
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && posts.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#666',
            fontFamily: 'Poppins, sans-serif',
            fontSize: '16px'
          }}>
            No posts yet. Be the first to share your perspective!
          </div>
        )}

        {!loading && !error && posts.length > 0 && (
          <div style={{
            display: 'grid',
            gap: '24px'
          }}>
            {posts.map((post) => (
              <article
                key={post.id || post.post_id}
                onClick={() => handlePostClick(post.post_id)}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E0E0E0',
                  borderRadius: '8px',
                  padding: '24px',
                  cursor: 'pointer',
                  transition: 'box-shadow 0.2s',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '16px'
                }}>
                  <div style={{ flex: 1 }}>
                    <h2 style={{
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '20px',
                      fontWeight: 600,
                      color: '#000',
                      margin: '0 0 8px 0',
                      textDecoration: 'underline'
                    }}>
                      {post.title}
                    </h2>
                    <div style={{
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '14px',
                      color: '#666'
                    }}>
                      By @{post.authorUsername} · {formatDate(post.updatedAt)}
                    </div>
                  </div>

                  {post.primary_genre && (
                    <span style={{
                      padding: '4px 12px',
                      backgroundColor: '#E8E8E8',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontFamily: 'Poppins, sans-serif',
                      color: '#666',
                      whiteSpace: 'nowrap',
                      marginLeft: '16px'
                    }}>
                      {post.primary_genre}
                    </span>
                  )}
                </div>

                <p style={{
                  fontFamily: 'Cardo, serif',
                  fontSize: '16px',
                  lineHeight: '1.6',
                  color: '#333',
                  margin: '0 0 16px 0'
                }}>
                  {truncateContent(post.content, 200)}
                </p>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '24px',
                  fontSize: '13px',
                  fontFamily: 'Poppins, sans-serif',
                  color: '#666'
                }}>
                  <span>👁 {post.views || 0} views</span>
                  <span>💬 {post.commentsCount || 0} comments</span>
                  <span>⬆ {post.upvotes || 0}</span>
                  <span>⬇ {post.downvotes || 0}</span>
                  
                  {post.tags && post.tags.length > 0 && (
                    <div style={{
                      marginLeft: 'auto',
                      display: 'flex',
                      gap: '6px',
                      flexWrap: 'wrap'
                    }}>
                      {post.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          style={{
                            fontSize: '11px',
                            color: '#999',
                            fontStyle: 'italic'
                          }}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <footer style={{
        borderTop: '1px solid #E0E0E0',
        padding: '24px 52px 40px',
        fontSize: '12px',
        color: '#666',
        background: '#F3F3F3',
        textAlign: 'center',
        fontFamily: 'Poppins, sans-serif'
      }}>
        <p>© 2025 Psyche Journey. A quiet place for thoughts, perspectives, and conversations.</p>
      </footer>
    </div>
  );
}

export default PerspectivePage;
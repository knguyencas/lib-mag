import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { authService } from '@/services/authService';
import { perspectiveService } from '@/services/perspectiveService';

function MyPostsPage() {
  const navigate = useNavigate();
  
  const [perspectivePosts, setPerspectivePosts] = useState([]);
  const [visualPosts, setVisualPosts] = useState([]);
  
  const [loadingPerspective, setLoadingPerspective] = useState(true);
  const [loadingVisual, setLoadingVisual] = useState(true);
  
  const [errorPerspective, setErrorPerspective] = useState('');
  const [errorVisual, setErrorVisual] = useState('');

  const [activeTab, setActiveTab] = useState('perspective');

  useEffect(() => {
    document.title = 'My Posts – Psyche Journey';

    if (!authService.isLoggedIn()) {
      navigate('/login');
      return;
    }

    loadMyPosts();
  }, [navigate]);

  const loadMyPosts = async () => {
    loadPerspectivePosts();
    
    loadVisualPosts();
  };

  const loadPerspectivePosts = async () => {
    try {
      setLoadingPerspective(true);
      setErrorPerspective('');
      
      console.log('🔍 Loading user perspective posts...');
      
      const posts = await perspectiveService.getUserPosts();
      
      console.log('✅ Perspective posts loaded:', posts.length);
      
      const sortedPosts = posts.sort((a, b) => {
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (a.status !== 'pending' && b.status === 'pending') return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      
      setPerspectivePosts(sortedPosts);
      
    } catch (err) {
      console.error('❌ Error loading perspective posts:', err);
      setErrorPerspective('Failed to load perspective posts.');
    } finally {
      setLoadingPerspective(false);
    }
  };

  const loadVisualPosts = async () => {
    try {
      setLoadingVisual(true);
      setErrorVisual('');
      
      console.log('🔍 Loading user visual posts...');
      
      
      const posts = [];
      
      console.log('✅ Visual posts loaded:', posts.length);
      setVisualPosts(posts);
      
    } catch (err) {
      console.error('❌ Error loading visual posts:', err);
      setErrorVisual('Failed to load visual posts.');
    } finally {
      setLoadingVisual(false);
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

  const truncateContent = (content, maxLength = 150) => {
    if (!content) return '';
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#FFA500';
      case 'published':
        return '#4CAF50';
      case 'rejected':
        return '#F44336';
      case 'archived':
        return '#9E9E9E';
      default:
        return '#666';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending':
        return '⏳ Pending Review';
      case 'published':
        return '✅ Published';
      case 'rejected':
        return '❌ Rejected';
      case 'archived':
        return '📦 Archived';
      default:
        return status;
    }
  };

  const handlePerspectivePostClick = (postId) => {
    navigate(`/perspective-post/${postId}`);
  };

  const handleVisualPostClick = (postId) => {
    navigate(`/visual-post/${postId}`);
  };

  const handleCreatePerspectivePost = () => {
    navigate('/create-perspective-post');
  };

  const handleCreateVisualPost = () => {
    navigate('/create-visual-post');
  };

  return (
    <div style={{ backgroundColor: '#F3F3F3', minHeight: '100vh' }}>
      <Header />
      
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 20px' }}>
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{
            fontFamily: 'Poppins, sans-serif',
            fontSize: '32px',
            fontWeight: 600,
            color: '#000',
            margin: '0 0 8px 0'
          }}>
            My Posts
          </h1>
          <p style={{
            fontFamily: 'Poppins, sans-serif',
            fontSize: '14px',
            color: '#666',
            margin: 0
          }}>
            Manage your perspective posts and visual posts
          </p>
        </div>

        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '32px',
          borderBottom: '2px solid #E0E0E0'
        }}>
          <button
            onClick={() => setActiveTab('perspective')}
            style={{
              padding: '12px 24px',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'perspective' ? '3px solid #2A2A2A' : '3px solid transparent',
              fontFamily: 'Poppins, sans-serif',
              fontSize: '16px',
              fontWeight: activeTab === 'perspective' ? 600 : 400,
              color: activeTab === 'perspective' ? '#000' : '#666',
              cursor: 'pointer',
              marginBottom: '-2px'
            }}
          >
            Perspective Posts ({perspectivePosts.length})
          </button>
          
          <button
            onClick={() => setActiveTab('visual')}
            style={{
              padding: '12px 24px',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'visual' ? '3px solid #2A2A2A' : '3px solid transparent',
              fontFamily: 'Poppins, sans-serif',
              fontSize: '16px',
              fontWeight: activeTab === 'visual' ? 600 : 400,
              color: activeTab === 'visual' ? '#000' : '#666',
              cursor: 'pointer',
              marginBottom: '-2px'
            }}
          >
            Visual Posts ({visualPosts.length})
          </button>
        </div>

        {activeTab === 'perspective' && (
          <div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'flex-end',
              marginBottom: '24px'
            }}>
              <button
                onClick={handleCreatePerspectivePost}
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
                + Create Perspective Post
              </button>
            </div>

            {loadingPerspective && (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: '#666',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '16px'
              }}>
                Loading perspective posts...
              </div>
            )}

            {errorPerspective && !loadingPerspective && (
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
                {errorPerspective}
                <button
                  onClick={loadPerspectivePosts}
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

            {!loadingPerspective && !errorPerspective && perspectivePosts.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: '#666',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '16px'
              }}>
                <p style={{ marginBottom: '16px' }}>You haven't created any perspective posts yet.</p>
                <button
                  onClick={handleCreatePerspectivePost}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#2A2A2A',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '4px',
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Create Your First Post
                </button>
              </div>
            )}

            {!loadingPerspective && !errorPerspective && perspectivePosts.length > 0 && (
              <div style={{
                display: 'grid',
                gap: '20px'
              }}>
                {perspectivePosts.map((post) => (
                  <article
                    key={post.id || post.post_id}
                    onClick={() => handlePerspectivePostClick(post.post_id)}
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E0E0E0',
                      borderRadius: '8px',
                      padding: '20px',
                      cursor: 'pointer',
                      transition: 'box-shadow 0.2s',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                    }}
                  >
                    <div style={{
                      position: 'absolute',
                      top: '16px',
                      right: '16px',
                      padding: '4px 12px',
                      backgroundColor: getStatusColor(post.status) + '20',
                      color: getStatusColor(post.status),
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontFamily: 'Poppins, sans-serif',
                      fontWeight: 600
                    }}>
                      {getStatusLabel(post.status)}
                    </div>

                    <div style={{ paddingRight: '140px' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '8px'
                      }}>
                        <span style={{
                          fontFamily: 'Consolas, monospace',
                          fontSize: '12px',
                          color: '#999',
                          fontWeight: 600
                        }}>
                          {post.post_id}
                        </span>
                        {post.primary_genre && (
                          <span style={{
                            padding: '2px 8px',
                            backgroundColor: '#E8E8E8',
                            borderRadius: '10px',
                            fontSize: '11px',
                            fontFamily: 'Poppins, sans-serif',
                            color: '#666'
                          }}>
                            {post.primary_genre}
                          </span>
                        )}
                      </div>

                      <h3 style={{
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '18px',
                        fontWeight: 600,
                        color: '#000',
                        margin: '0 0 8px 0'
                      }}>
                        {post.title}
                      </h3>

                      <p style={{
                        fontFamily: 'Cardo, serif',
                        fontSize: '14px',
                        lineHeight: '1.5',
                        color: '#666',
                        margin: '0 0 12px 0'
                      }}>
                        {truncateContent(post.content, 150)}
                      </p>

                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        fontSize: '12px',
                        fontFamily: 'Poppins, sans-serif',
                        color: '#999'
                      }}>
                        <span>📅 {formatDate(post.createdAt)}</span>
                        <span>👁 {post.views || 0} views</span>
                        <span>💬 {post.commentsCount || 0} comments</span>
                        <span>⬆ {post.upvotes || 0}</span>
                        <span>⬇ {post.downvotes || 0}</span>
                      </div>

                      {post.tags && post.tags.length > 0 && (
                        <div style={{
                          marginTop: '8px',
                          display: 'flex',
                          gap: '6px',
                          flexWrap: 'wrap'
                        }}>
                          {post.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              style={{
                                fontSize: '11px',
                                color: '#999',
                                fontFamily: 'Poppins, sans-serif',
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
          </div>
        )}

        {activeTab === 'visual' && (
          <div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'flex-end',
              marginBottom: '24px'
            }}>
              <button
                onClick={handleCreateVisualPost}
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
                + Create Visual Post
              </button>
            </div>

            {loadingVisual && (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: '#666',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '16px'
              }}>
                Loading visual posts...
              </div>
            )}

            {errorVisual && !loadingVisual && (
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
                {errorVisual}
                <button
                  onClick={loadVisualPosts}
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

            {!loadingVisual && !errorVisual && visualPosts.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: '#666',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '16px'
              }}>
                <p style={{ marginBottom: '16px' }}>You haven't created any visual posts yet.</p>
                <button
                  onClick={handleCreateVisualPost}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#2A2A2A',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '4px',
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Create Your First Visual Post
                </button>
              </div>
            )}

            {!loadingVisual && !errorVisual && visualPosts.length > 0 && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '20px'
              }}>
                {visualPosts.map((post) => (
                  <article
                    key={post.id}
                    onClick={() => handleVisualPostClick(post.post_id)}
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E0E0E0',
                      borderRadius: '8px',
                      overflow: 'hidden',
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
                      width: '100%',
                      height: '280px',
                      backgroundColor: '#E8E8E8',
                      backgroundImage: post.image ? `url(${post.image})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }} />

                    <div style={{ padding: '16px' }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '8px'
                      }}>
                        <span style={{
                          fontFamily: 'Consolas, monospace',
                          fontSize: '11px',
                          color: '#999'
                        }}>
                          {post.post_id}
                        </span>
                        <span style={{
                          padding: '3px 10px',
                          backgroundColor: getStatusColor(post.status) + '20',
                          color: getStatusColor(post.status),
                          borderRadius: '10px',
                          fontSize: '11px',
                          fontFamily: 'Poppins, sans-serif',
                          fontWeight: 600
                        }}>
                          {post.status}
                        </span>
                      </div>

                      <div style={{
                        fontSize: '12px',
                        fontFamily: 'Poppins, sans-serif',
                        color: '#999',
                        display: 'flex',
                        gap: '12px'
                      }}>
                        <span>❤️ {post.likes || 0}</span>
                        <span>👁 {post.views || 0}</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
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

export default MyPostsPage;
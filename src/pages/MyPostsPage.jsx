import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import '../styles/my-posts.css';

function MyPostsPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState({
    visualPosts: [],
    perspectivePosts: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyPosts();
  }, []);

  const fetchMyPosts = async () => {
    try {
      const token = authService.getToken();
      
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:3000/api/visualpost/my-posts', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load posts');
      }

      setPosts({
        visualPosts: data.data.visualPosts || [],
        perspectivePosts: data.data.perspectivePosts || []
      });

    } catch (err) {
      console.error('Error fetching posts:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { className: 'status-pending', text: '⏳ Pending Approval' },
      published: { className: 'status-published', text: '✓ Published' },
      rejected: { className: 'status-rejected', text: '✗ Rejected' },
      archived: { className: 'status-archived', text: '📦 Archived' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return <span className={`status-badge ${config.className}`}>{config.text}</span>;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="my-posts-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading your posts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-posts-container">
        <div className="error-state">
          <p>Error: {error}</p>
          <button onClick={fetchMyPosts} className="btn-primary">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="my-posts-container">
      <div className="page-header">
        <h1>My Posts</h1>
        <p className="page-description">View and manage all your posts</p>
      </div>

      <section className="posts-section">
        <div className="section-header">
          <h2>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeWidth="2"/>
              <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
              <polyline points="21 15 16 10 5 21" strokeWidth="2"/>
            </svg>
            Visual Posts
          </h2>
          <span className="post-count">{posts.visualPosts.length} posts</span>
        </div>

        {posts.visualPosts.length === 0 ? (
          <div className="empty-state">
            <p>No visual posts yet</p>
            <button onClick={() => navigate('/create-visual-post')} className="btn-primary">
              Create Your First Post
            </button>
          </div>
        ) : (
          <div className="posts-grid">
            {posts.visualPosts.map((post) => (
              <div key={post.post_id} className="post-card">
                {post.image_url && (
                  <div className="post-image" style={{ backgroundImage: `url(${post.image_url})` }} />
                )}
                <div className="post-content">
                  <div className="post-header">
                    <h3 className="post-title">{post.title}</h3>
                    {getStatusBadge(post.status)}
                  </div>
                  <p className="post-text">{post.content.substring(0, 150)}...</p>
                  
                  {post.tags && post.tags.length > 0 && (
                    <div className="post-tags">
                      {post.tags.map((tag, index) => (
                        <span key={index} className="tag">{tag}</span>
                      ))}
                    </div>
                  )}

                  <div className="post-footer">
                    <span className="post-date">{formatDate(post.createdAt)}</span>
                    <div className="post-stats">
                      <span>❤️ {post.likes || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="posts-section">
        <div className="section-header">
          <h2>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeWidth="2"/>
              <polyline points="14 2 14 8 20 8" strokeWidth="2"/>
            </svg>
            Perspective Posts
          </h2>
          <span className="post-count">{posts.perspectivePosts.length} posts</span>
        </div>

        {posts.perspectivePosts.length === 0 ? (
          <div className="empty-state">
            <p>No perspective posts yet</p>
            <button onClick={() => navigate('/create-perspective-post')} className="btn-primary">
              Create Your First Post
            </button>
          </div>
        ) : (
          <div className="posts-list">
            {posts.perspectivePosts.map((post) => (
              <div key={post.post_id} className="post-item">
                <div className="post-item-header">
                  <h3 className="post-item-title">{post.topic}</h3>
                  {getStatusBadge(post.status)}
                </div>
                <p className="post-item-content">{post.content.substring(0, 200)}...</p>
                <div className="post-item-footer">
                  <span className="post-date">{formatDate(post.createdAt)}</span>
                  <div className="post-stats">
                    <span>👍 {post.upvotes || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default MyPostsPage;
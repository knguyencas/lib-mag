import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import '../styles/admin-add-book.css';
import '../styles/admin-page.css';

function ManagePostsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('visual');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [statusFilter, setStatusFilter] = useState('pending');

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  useEffect(() => {
    document.title = 'Manage Posts | Psyche Journey';
    
    const currentUser = authService.getUser();
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'super_admin')) {
      navigate('/');
      return;
    }
    setUser(currentUser);
  }, [navigate]);

  useEffect(() => {
    loadPosts();
  }, [activeTab, pagination.page, statusFilter]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...(statusFilter && { status: statusFilter })
      });

      const endpoint = activeTab === 'visual' ? 'visual' : 'perspective';
      const response = await fetch(`${API_BASE_URL}/admin/posts/${endpoint}?${params}`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      });

      const result = await response.json();
      if (result.success) {
        setPosts(result.data);
        setPagination(result.pagination);
      }
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePost = async (postId) => {
    try {
      const endpoint = activeTab === 'visual' ? 'visual' : 'perspective';
      const response = await fetch(`${API_BASE_URL}/admin/posts/${endpoint}/${postId}/approve`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      });

      const result = await response.json();
      if (result.success) {
        alert('Post approved and published!');
        loadPosts();
      } else {
        alert(result.message || 'Failed to approve post');
      }
    } catch (error) {
      console.error('Error approving post:', error);
      alert('Error approving post');
    }
  };

  const handleRejectPost = async (postId) => {
    if (!confirm('Are you sure you want to reject this post?')) return;

    try {
      const endpoint = activeTab === 'visual' ? 'visual' : 'perspective';
      const response = await fetch(`${API_BASE_URL}/admin/posts/${endpoint}/${postId}/reject`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      });

      const result = await response.json();
      if (result.success) {
        alert('Post rejected!');
        loadPosts();
      } else {
        alert(result.message || 'Failed to reject post');
      }
    } catch (error) {
      console.error('Error rejecting post:', error);
      alert('Error rejecting post');
    }
  };

  const handleDeletePost = async (postId) => {
    if (!confirm('Are you sure you want to delete this post permanently?')) return;

    try {
      const endpoint = activeTab === 'visual' ? 'visual' : 'perspective';
      const response = await fetch(`${API_BASE_URL}/admin/posts/${endpoint}/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      });

      const result = await response.json();
      if (result.success) {
        alert('Post deleted successfully!');
        loadPosts();
      } else {
        alert(result.message || 'Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Error deleting post');
    }
  };

  const handleArchivePost = async (postId) => {
    try {
      const endpoint = activeTab === 'visual' ? 'visual' : 'perspective';
      const response = await fetch(`${API_BASE_URL}/admin/posts/${endpoint}/${postId}/archive`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      });

      const result = await response.json();
      if (result.success) {
        alert('Post archived successfully!');
        loadPosts();
      } else {
        alert(result.message || 'Failed to archive post');
      }
    } catch (error) {
      console.error('Error archiving post:', error);
      alert('Error archiving post');
    }
  };

  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    return null;
  }

  return (
    <div className="admin-add-book-page">
      <header className="admin-header">
        <div className="admin-header-left">
          <h1 className="logo">PSYCHE JOURNEY</h1>
        </div>
        <nav className="top-nav">
          <Link to="/">Home</Link>
          <Link to="/library">Library</Link>
          <span className="divider">|</span>
          <span className="admin-label">Admin panel</span>
        </nav>
      </header>

      <main className="admin-content">
        <h1>Manage Posts</h1>
        <p>Approve, reject, and moderate user posts</p>

        <div className="admin-tabs">
          <button 
            className={`admin-tab ${activeTab === 'visual' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('visual');
              setPagination({...pagination, page: 1});
            }}
          >
            Visual Posts
          </button>
          <button 
            className={`admin-tab ${activeTab === 'perspective' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('perspective');
              setPagination({...pagination, page: 1});
            }}
          >
            Perspective Posts
          </button>
        </div>

        <div className="filters">
          <select 
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPagination({...pagination, page: 1});
            }}
          >
            <option value="">All Status</option>
            <option value="pending">Pending Approval</option>
            <option value="published">Published</option>
            <option value="rejected">Rejected</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {loading ? (
          <div className="loading-state">
            <p>Loading posts...</p>
          </div>
        ) : (
          <>
            <div className="posts-list">
              <h3>{activeTab === 'visual' ? 'Visual' : 'Perspective'} Posts ({pagination.total})</h3>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Post ID</th>
                    <th>{activeTab === 'visual' ? 'Title' : 'Topic'}</th>
                    <th>Author</th>
                    <th>{activeTab === 'visual' ? 'Likes' : 'Upvotes'}</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map(post => (
                    <tr key={post.post_id}>
                      <td>{post.post_id}</td>
                      <td>{activeTab === 'visual' ? post.title : post.topic}</td>
                      <td>{post.author_username}</td>
                      <td>{activeTab === 'visual' ? post.likes : post.upvotes}</td>
                      <td>
                        <span className={`status-badge status-${post.status}`}>
                          {post.status}
                        </span>
                      </td>
                      <td>{new Date(post.createdAt).toLocaleDateString()}</td>
                      <td>
                        {post.status === 'pending' && (
                          <>
                            <button 
                              className="btn-success"
                              onClick={() => handleApprovePost(post.post_id)}
                            >
                              ✓ Approve
                            </button>
                            <button 
                              className="btn-warning"
                              onClick={() => handleRejectPost(post.post_id)}
                            >
                              ✗ Reject
                            </button>
                          </>
                        )}
                        {post.status === 'published' && (
                          <button 
                            className="btn-small"
                            onClick={() => handleArchivePost(post.post_id)}
                          >
                            Archive
                          </button>
                        )}
                        <button 
                          className="btn-danger"
                          onClick={() => handleDeletePost(post.post_id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pagination">
              <button 
                disabled={pagination.page === 1}
                onClick={() => setPagination({...pagination, page: pagination.page - 1})}
              >
                Previous
              </button>
              <span>Page {pagination.page} of {pagination.pages}</span>
              <button 
                disabled={pagination.page === pagination.pages}
                onClick={() => setPagination({...pagination, page: pagination.page + 1})}
              >
                Next
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default ManagePostsPage;
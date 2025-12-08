import { useState, useEffect } from 'react';
import { authService } from '@/services/authService';
import './BookComments.css';

function BookComments({ bookId }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  const isLoggedIn = authService.isLoggedIn();
  const currentUser = authService.getUser();

  useEffect(() => {
    if (bookId) {
      loadComments();
    }
  }, [bookId, pagination.page]);

  const loadComments = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      });

      const response = await fetch(
        `${API_BASE_URL}/books/${bookId}/comments?${params}`
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setComments(result.data || []);
          if (result.pagination) {
            setPagination(prev => ({ ...prev, ...result.pagination }));
          }
        }
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();

    if (!isLoggedIn) {
      alert('Please login to comment');
      return;
    }

    if (!newComment.trim()) {
      alert('Please enter a comment');
      return;
    }

    if (newComment.length > 2000) {
      alert('Comment cannot exceed 2000 characters');
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch(
        `${API_BASE_URL}/books/${bookId}/comments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authService.getToken()}`
          },
          body: JSON.stringify({ content: newComment.trim() })
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setNewComment('');
          await loadComments();
        }
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to post comment');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('Failed to post comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/books/comments/${commentId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${authService.getToken()}`
          }
        }
      );

      if (response.ok) {
        setComments(prev => prev.filter(c => c.comment_id !== commentId));
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to delete comment');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / 60000);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const isCommentOwner = (comment) => {
    if (!currentUser || !comment.user_id) return false;
    
    const userId = typeof comment.user_id === 'object' ? comment.user_id._id : comment.user_id;
    return currentUser._id === userId || currentUser._id === userId.toString();
  };

  const getUsername = (comment) => {
    if (comment.user_id && typeof comment.user_id === 'object') {
      return comment.user_id.username || 'Anonymous';
    }
    return 'Anonymous';
  };

  const getUserInitial = (comment) => {
    const username = getUsername(comment);
    return username.charAt(0).toUpperCase();
  };

  return (
    <div className="book-comments-container">
      <h2 className="comments-title">Comments ({pagination.total})</h2>

      {isLoggedIn ? (
        <form className="comment-form" onSubmit={handleSubmitComment}>
          <div className="comment-input-wrapper">
            <div className="comment-avatar">
              {currentUser?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <textarea
              className="comment-textarea"
              placeholder="Share your thoughts about this book..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={isSubmitting}
              rows={3}
            />
          </div>
          <div className="comment-form-footer">
            <span className="character-count">
              {newComment.length}/2000
            </span>
            <button 
              type="submit" 
              className="btn-post-comment"
              disabled={isSubmitting || !newComment.trim()}
            >
              {isSubmitting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </form>
      ) : (
        <div className="login-prompt">
          <p>Please login to leave a comment</p>
        </div>
      )}

      <div className="comments-list">
        {loading ? (
          <p className="loading-text">Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className="no-comments">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map((comment, index) => (
            <div key={`comment-${comment._id || comment.comment_id}-${index}`} className="comment-item">
              <div className="comment-avatar">
                {getUserInitial(comment)}
              </div>
              <div className="comment-content-wrapper">
                <div className="comment-header">
                  <div className="comment-author-info">
                    <span className="comment-author">
                      {getUsername(comment)}
                    </span>
                    <span className="comment-time">
                      {formatDate(comment.createdAt)}
                    </span>
                    {comment.edited && (
                      <span className="comment-edited">(edited)</span>
                    )}
                  </div>
                  
                  {isCommentOwner(comment) && (
                    <button
                      className="btn-delete-comment"
                      onClick={() => handleDeleteComment(comment.comment_id)}
                      title="Delete comment"
                    >
                      Delete
                    </button>
                  )}
                </div>
                <p className="comment-text">{comment.content}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {pagination.pages > 1 && (
        <div className="comments-pagination">
          <button
            className="btn-page"
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
          >
            Previous
          </button>
          <span className="page-info">
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            className="btn-page"
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.pages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default BookComments;
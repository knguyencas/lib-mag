import { useState, useEffect } from 'react';
import { authService } from '@/services/authService';
import { perspectiveService } from '@/services/perspectiveService';
import './PerspectiveComments.css';

function PerspectiveComments({ postId }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLoggedIn = authService.isLoggedIn();
  const currentUser = authService.getUser();

  useEffect(() => {
    if (postId) {
      loadComments();
    }
  }, [postId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const data = await perspectiveService.getComments(postId);
      setComments(data || []);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setIsSubmitting(true);
      await perspectiveService.addComment(postId, newComment.trim());
      setNewComment('');
      await loadComments();
    } catch (error) {
      alert('Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    try {
      setIsSubmitting(true);
      await perspectiveService.addComment(postId, replyContent.trim(), replyTo.comment_id);
      setReplyContent('');
      setReplyTo(null);
      await loadComments();
    } catch (error) {
      alert('Failed to post reply');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm('Delete this comment and all replies?')) return;

    try {
      await perspectiveService.deleteComment(commentId);
      await loadComments();
    } catch (error) {
      alert('Failed to delete comment');
    }
  };

  const isCommentOwner = (comment) => {
    if (!currentUser || !comment.user_id) return false;
    const userId = typeof comment.user_id === 'object' ? comment.user_id._id : comment.user_id;
    return currentUser._id === userId;
  };

  const getUsername = (comment) => {
    if (comment.user_id && typeof comment.user_id === 'object') {
      return comment.user_id.username || 'Anonymous';
    }
    return 'Anonymous';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const totalComments = comments.reduce((sum, c) => sum + 1 + (c.replies?.length || 0), 0);

  return (
    <div className="perspective-comments">
      <h3>Comment</h3>

      {isLoggedIn && (
        <form onSubmit={handleSubmitComment} className="comment-form">
          <textarea
            placeholder="Comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={isSubmitting}
          />
          <button type="submit" disabled={isSubmitting}>
            Enter
          </button>
        </form>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : (
        comments.map((comment, idx) => (
          <div key={`comment-${comment._id}-${idx}`} className="comment-thread">
            <div className="comment-item">
              <div className="comment-avatar">
                {getUsername(comment).charAt(0).toUpperCase()}
              </div>
              <div className="comment-content">
                <div className="comment-header">
                  <span className="username">@{getUsername(comment)}</span>
                  <span className="date">{formatDate(comment.createdAt)}</span>
                </div>
                <p className="comment-text">{comment.content}</p>
                <div className="comment-actions">
                  {isLoggedIn && (
                    <button onClick={() => setReplyTo({ 
                      comment_id: comment.comment_id, 
                      username: getUsername(comment) 
                    })}>
                      Reply
                    </button>
                  )}
                  <button>Upvote</button>
                  <button>Downvote</button>
                  {isCommentOwner(comment) && (
                    <button onClick={() => handleDeleteComment(comment.comment_id)} className="delete">
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>

            {replyTo?.comment_id === comment.comment_id && (
              <div className="reply-form">
                <form onSubmit={handleSubmitReply}>
                  <textarea
                    placeholder={`Reply to @${replyTo.username}...`}
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    disabled={isSubmitting}
                    autoFocus
                  />
                  <div className="form-actions">
                    <button type="button" onClick={() => { setReplyTo(null); setReplyContent(''); }}>
                      Cancel
                    </button>
                    <button type="submit" disabled={isSubmitting}>
                      Reply
                    </button>
                  </div>
                </form>
              </div>
            )}

            {comment.replies && comment.replies.length > 0 && (
              <div className="replies-list">
                {comment.replies.map((reply, ridx) => (
                  <div key={`reply-${reply._id}-${ridx}`} className="comment-item reply">
                    <div className="comment-avatar small">
                      {getUsername(reply).charAt(0).toUpperCase()}
                    </div>
                    <div className="comment-content">
                      <div className="comment-header">
                        <span className="username">@{getUsername(reply)}</span>
                        <span className="date">{formatDate(reply.createdAt)}</span>
                      </div>
                      <p className="comment-text">{reply.content}</p>
                      {isCommentOwner(reply) && (
                        <div className="comment-actions">
                          <button onClick={() => handleDeleteComment(reply.comment_id)} className="delete">
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default PerspectiveComments;
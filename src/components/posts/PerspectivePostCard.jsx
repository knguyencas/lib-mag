import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PerspectivePostCard.css';

function PerspectivePostCard({ post }) {
  const navigate = useNavigate();
  const [upvoted, setUpvoted] = useState(false);
  const [downvoted, setDownvoted] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(post.upvotes || 0);
  const [downvoteCount, setDownvoteCount] = useState(post.downvotes || 0);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const handleCardClick = (e) => {
    if (e.target.closest('.vote-button')) {
      return;
    }
    navigate(`/perspective-post/${post.id}`);
  };

  const handleUpvote = async () => {
    if (upvoted) {
      setUpvoted(false);
      setUpvoteCount(prev => prev - 1);
    } else {
      setUpvoted(true);
      setUpvoteCount(prev => prev + 1);
      
      if (downvoted) {
        setDownvoted(false);
        setDownvoteCount(prev => prev - 1);
      }
    }
    
  };

  const handleDownvote = async () => {
    if (downvoted) {
      setDownvoted(false);
      setDownvoteCount(prev => prev - 1);
    } else {
      setDownvoted(true);
      setDownvoteCount(prev => prev + 1);
      
      if (upvoted) {
        setUpvoted(false);
        setUpvoteCount(prev => prev - 1);
      }
    }
    
  };

  return (
    <div className="perspective-post-card" onClick={handleCardClick}>
      <div className="post-main-content">
        <div className="post-header">
          <div className="post-author-info">
            <div className="post-avatar">
              {post.author?.username?.substring(0, 2).toUpperCase() || 'U'}
            </div>
            <div className="post-author-details">
              <span className="post-author-name">@{post.author?.username || 'Unknown'}</span>
              <span className="post-date">{formatDate(post.createdAt)}</span>
            </div>
          </div>

          {post.genre && (
            <span className="post-genre-badge">{post.genre}</span>
          )}
        </div>

        <h3 className="post-title">{post.title}</h3>

        <div className="post-content-preview">
          {post.content && post.content.length > 200
            ? `${post.content.substring(0, 200)}...`
            : post.content}
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="post-tags">
            {post.tags.map((tag, index) => (
              <span key={index} className="tag">{tag}</span>
            ))}
          </div>
        )}

        <div className="post-footer">
          <div className="post-stats">
            <span className="stat-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              {post.commentsCount || 0}
            </span>
            <span className="stat-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              {post.views || 0}
            </span>
          </div>

          <div className="post-actions">
            <button 
              className={`vote-button upvote ${upvoted ? 'active' : ''}`}
              onClick={handleUpvote}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill={upvoted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                <path d="M12 19V6M5 12l7-7 7 7"/>
              </svg>
              {upvoteCount}
            </button>

            <button 
              className={`vote-button downvote ${downvoted ? 'active' : ''}`}
              onClick={handleDownvote}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill={downvoted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                <path d="M12 5v13M5 12l7 7 7-7"/>
              </svg>
              {downvoteCount}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PerspectivePostCard;

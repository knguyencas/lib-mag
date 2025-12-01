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
    const postId = post.post_id || post.perspective_id || post.id || post._id || post.slug;
    if (!postId) return;
    navigate(`/perspective-post/${postId}`);
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
      <div className="post-header">
        <div className="post-meta">
          <span className="post-type">Perspective</span>
          <span className="post-date">
            {post.created_at ? formatDate(post.created_at) : 'Unknown date'}
          </span>
        </div>
        <h3 className="post-title">{post.title}</h3>
      </div>

      <div className="post-content-preview">
        {post.content && post.content.length > 200
          ? `${post.content.substring(0, 200)}...`
          : post.content}
      </div>

      <div className="post-footer">
        <div className="vote-section">
          <button 
            className={`vote-button upvote ${upvoted ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              handleUpvote();
            }}
          >
            ▲
            <span className="vote-count">{upvoteCount}</span>
          </button>
          <button 
            className={`vote-button downvote ${downvoted ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              handleDownvote();
            }}
          >
            ▼
            <span className="vote-count">{downvoteCount}</span>
          </button>
        </div>

        <div className="post-stats">
          <span className="comments-count">
            {post.commentsCount || 0} comments
          </span>
        </div>
      </div>
    </div>
  );
}

export default PerspectivePostCard;
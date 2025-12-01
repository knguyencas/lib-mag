import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './VisualPostCard.css';

function VisualPostCard({ post }) {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);

  const handleClick = (e) => {
    // Don't navigate if clicking the like button
    if (e.target.closest('.like-button')) {
      return;
    }
    const postId = post.post_id || post.visual_id || post.id || post._id || post.slug;
    if (!postId) return;
    navigate(`/visual-post/${postId}`);
  };

  const handleLike = (e) => {
    e.stopPropagation();
    
    if (liked) {
      setLiked(false);
      setLikeCount(prev => prev - 1);
    } else {
      setLiked(true);
      setLikeCount(prev => prev + 1);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    if (isNaN(date)) return 'Unknown date';
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div className="visual-post-card" onClick={handleClick}>
      <div className="visual-post-image-container">
        {post.image_url ? (
          <img 
            src={post.image_url} 
            alt={post.title || 'Visual post'} 
            className="visual-post-image"
          />
        ) : (
          <div className="visual-post-image-placeholder">
            <span>No image</span>
          </div>
        )}
      </div>
      
      <div className="visual-post-content">
        <div className="visual-post-header">
          <h3 className="visual-post-title">
            {post.title || 'Untitled visual post'}
          </h3>
          <span className="visual-post-date">
            {formatDate(post.created_at || post.createdAt)}
          </span>
        </div>
        
        {post.caption && (
          <p className="visual-post-caption">
            {post.caption.length > 120 
              ? `${post.caption.substring(0, 120)}...` 
              : post.caption}
          </p>
        )}
        
        <div className="visual-post-footer">
          <button 
            className={`like-button ${liked ? 'liked' : ''}`}
            onClick={handleLike}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              width="18" 
              height="18" 
              fill={liked ? 'currentColor' : 'none'} 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            <span className="like-count">{likeCount}</span>
          </button>
        </div>
        <p className="visual-post-author">
          @{post.author?.username || 'author_name'}
        </p>
      </div>
    </div>
  );
}

export default VisualPostCard;
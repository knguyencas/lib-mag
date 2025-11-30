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
    navigate(`/visual-post/${post.id}`);
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
    
    // TODO: API call to like/unlike post
  };

  return (
    <div className="visual-post-card" onClick={handleClick}>
      <div className="visual-post-placeholder"></div>

      <div className="visual-post-meta">
        <div className="visual-post-title-row">
          <h3 className="visual-post-title">{post.title || 'Article Title'}</h3>
          <button 
            className={`like-button ${liked ? 'liked' : ''}`}
            onClick={handleLike}
            aria-label={liked ? 'Unlike' : 'Like'}
          >
            <svg 
              width="18" 
              height="18" 
              viewBox="0 0 24 24" 
              fill={liked ? 'currentColor' : 'none'}
              stroke="currentColor" 
              strokeWidth="2"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            <span className="like-count">{likeCount}</span>
          </button>
        </div>
        <p className="visual-post-author">@{post.author?.username || 'author_name'}</p>
      </div>
    </div>
  );
}

export default VisualPostCard;
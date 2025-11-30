import { useNavigate } from 'react-router-dom';
import './VisualPostCard.css';

function VisualPostCard({ post }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/visual-post/${post.id}`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div className="visual-post-card" onClick={handleClick}>
      <div className="visual-post-image">
        {post.imageUrl ? (
          <img src={post.imageUrl} alt={post.title} />
        ) : (
          <div className="visual-post-placeholder">No Image</div>
        )}
      </div>

      <div className="visual-post-content">
        <div className="visual-post-header">
          <div className="visual-post-author">
            <div className="author-avatar">
              {post.author?.username?.substring(0, 2).toUpperCase() || 'U'}
            </div>
            <span className="author-name">@{post.author?.username || 'Unknown'}</span>
          </div>
          <span className="visual-post-date">{formatDate(post.createdAt)}</span>
        </div>

        <h3 className="visual-post-title">{post.title}</h3>

        {post.description && (
          <p className="visual-post-description">
            {post.description.length > 100 
              ? `${post.description.substring(0, 100)}...` 
              : post.description}
          </p>
        )}

        <div className="visual-post-footer">
          {post.genre && (
            <span className="visual-post-genre">{post.genre}</span>
          )}

          <div className="visual-post-stats">
            <span className="stat-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              {post.likes || 0}
            </span>
            <span className="stat-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              {post.views || 0}
            </span>
          </div>
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="visual-post-tags">
            {post.tags.map((tag, index) => (
              <span key={index} className="tag">{tag}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default VisualPostCard;

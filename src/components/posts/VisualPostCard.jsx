import { useNavigate } from 'react-router-dom';
import './VisualPostCard.css';

function VisualPostCard({ post }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/visual-post/${post.id}`);
  };

  return (
    <div className="visual-post-card" onClick={handleClick}>
      <div className="visual-post-placeholder"></div>

      <div className="visual-post-meta">
        <h3 className="visual-post-title">Article Title</h3>
        <p className="visual-post-author">@{post.author?.username || 'author_name'}</p>
      </div>
    </div>
  );
}

export default VisualPostCard;

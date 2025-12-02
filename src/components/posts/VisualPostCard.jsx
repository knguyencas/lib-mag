import React, { useState } from 'react';
import '../../styles/themes.css';

const VisualPostCard = ({ post, onClick }) => {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(post.likes || 0);

  const handleCardClick = () => {
    if (onClick) {
      onClick(post);
    }
  };

  const handleHeartClick = (e) => {
    e.stopPropagation();

    setLiked((prev) => {
      const next = !prev;
      setLikes((prevLikes) =>
        Math.max(0, prevLikes + (next ? 1 : -1))
      );
      return next;
    });
  };

  const title = post.title || 'Article Title';
  const authorUsername =
    post.author_username || post.author?.username || 'user1';
  const imageUrl =
    post.image?.url || post.image_url || post.imageUrl || '';

  return (
    <div className="visual-card" onClick={handleCardClick}>
      <div className="card-image-container">
        {imageUrl ? (
          <img
            className="card-image"
            src={imageUrl}
            alt={title}
            loading="lazy"
          />
        ) : (
          <div className="card-image placeholder" />
        )}
      </div>

      <div className="card-info">
        <h3 className="card-title">{title}</h3>

        <div className="card-meta">
          <span className="card-author">@{authorUsername}</span>
        </div>

        <div className="card-stats">
          <button
            className={`heart-button ${liked ? 'liked' : ''}`}
            onClick={handleHeartClick}
          >
            <svg
              viewBox="0 0 24 24"
              className="heart-icon"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                fill="currentColor"
              />
            </svg>
          </button>
          <span className="heart-count">{likes}</span>
        </div>
      </div>
    </div>
  );
};

export default VisualPostCard;

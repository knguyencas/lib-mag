import { useState, useEffect } from 'react';
import { voteService } from '@/services/voteService';
import { authService } from '@/services/authService';

function VisualPostLikeButton({ postId, initialLikes = 0 }) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(initialLikes);
  const [loading, setLoading] = useState(false);

  const isLoggedIn = authService.isLoggedIn();

  useEffect(() => {
    if (isLoggedIn) {
      loadMyVote();
    }
  }, [postId, isLoggedIn]);

  const loadMyVote = async () => {
    const vote = await voteService.getMyVote('visual_post', postId);
    setLiked(vote?.voteType === 'like');
  };

  const handleLike = async () => {
    if (!isLoggedIn) {
      alert('Please login to like');
      return;
    }

    setLoading(true);
    try {
      const result = await voteService.likeVisualPost(postId);
      
      if (result.success) {
        setLiked(result.data.action !== 'removed');
        setLikes(result.data.counts.likes);
      }
    } catch (error) {
      alert('Failed to like post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className={`like-button ${liked ? 'liked' : ''}`}
      onClick={handleLike}
      disabled={loading}
    >
      {liked ? '❤️' : '🤍'} {likes}
    </button>
  );
}

export default VisualPostLikeButton;
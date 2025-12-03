import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { voteService } from '@/services/voteService';
import { authService } from '@/services/authService';
import './PerspectivePostCard.css';

function PerspectivePostCard({ post }) {
  const navigate = useNavigate();
  const [upvoted, setUpvoted] = useState(false);
  const [downvoted, setDownvoted] = useState(false);
  const [upvotes, setUpvotes] = useState(post.upvotes || 0);
  const [downvotes, setDownvotes] = useState(post.downvotes || 0);
  const [loading, setLoading] = useState(false);

  const isLoggedIn = authService.isLoggedIn();

  useEffect(() => {
    if (isLoggedIn) {
      loadMyVote();
    }
  }, [post.post_id, isLoggedIn]);

  const loadMyVote = async () => {
    const vote = await voteService.getMyVote('perspective_post', post.post_id);
    if (vote) {
      setUpvoted(vote.voteType === 'upvote');
      setDownvoted(vote.voteType === 'downvote');
    }
  };

  const handleVote = async (voteType, e) => {
    e.stopPropagation();
    
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const result = await voteService.votePerspectivePost(post.post_id, voteType);
      
      if (result.success) {
        const { action, counts } = result.data;

        if (voteType === 'upvote') {
          setUpvoted(action !== 'removed');
          if (action !== 'removed' && downvoted) setDownvoted(false);
        } else {
          setDownvoted(action !== 'removed');
          if (action !== 'removed' && upvoted) setUpvoted(false);
        }

        setUpvotes(counts.upvotes);
        setDownvotes(counts.downvotes);
      }
    } catch (error) {
      console.error('Vote error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const handleCardClick = (e) => {
    if (e.target.closest('.vote-button')) return;
    navigate(`/perspective-post/${post.post_id}`);
  };

  return (
    <div className="perspective-post-card" onClick={handleCardClick}>
      <div className="post-header">
        <div className="post-meta">
          <span className="post-type">Perspective</span>
          <span className="post-date">
            {formatDate(post.createdAt || post.created_at)}
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
            onClick={(e) => handleVote('upvote', e)}
            disabled={loading}
          >
            ▲ {upvotes}
          </button>
          <button 
            className={`vote-button downvote ${downvoted ? 'active' : ''}`}
            onClick={(e) => handleVote('downvote', e)}
            disabled={loading}
          >
            ▼ {downvotes}
          </button>
        </div>

        <div className="post-stats">
          <span className="comments-count">
            💬 {post.commentsCount || post.comment_count || 0}
          </span>
        </div>
      </div>
    </div>
  );
}

export default PerspectivePostCard;
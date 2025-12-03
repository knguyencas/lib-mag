import { useState, useEffect } from 'react';
import { voteService } from '@/services/voteService';
import { authService } from '@/services/authService';

function PerspectiveVoteButtons({ postId, initialUpvotes = 0, initialDownvotes = 0 }) {
  const [upvoted, setUpvoted] = useState(false);
  const [downvoted, setDownvoted] = useState(false);
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [loading, setLoading] = useState(false);

  const isLoggedIn = authService.isLoggedIn();

  useEffect(() => {
    if (isLoggedIn) {
      loadMyVote();
    }
  }, [postId, isLoggedIn]);

  const loadMyVote = async () => {
    const vote = await voteService.getMyVote('perspective_post', postId);
    if (vote) {
      setUpvoted(vote.voteType === 'upvote');
      setDownvoted(vote.voteType === 'downvote');
    }
  };

  const handleVote = async (voteType) => {
    if (!isLoggedIn) {
      alert('Please login to vote');
      return;
    }

    setLoading(true);
    try {
      const result = await voteService.votePerspectivePost(postId, voteType);
      
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
      alert('Failed to vote');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vote-buttons">
      <button
        className={`vote-btn upvote ${upvoted ? 'active' : ''}`}
        onClick={() => handleVote('upvote')}
        disabled={loading}
      >
        ▲ {upvotes}
      </button>
      <button
        className={`vote-btn downvote ${downvoted ? 'active' : ''}`}
        onClick={() => handleVote('downvote')}
        disabled={loading}
      >
        ▼ {downvotes}
      </button>
    </div>
  );
}

export default PerspectiveVoteButtons;
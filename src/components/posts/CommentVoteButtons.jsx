import { useState, useEffect } from 'react';
import { voteService } from '@/services/voteService';
import { authService } from '@/services/authService';

function CommentVoteButtons({ commentId }) {
  const [upvoted, setUpvoted] = useState(false);
  const [downvoted, setDownvoted] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);

  const isLoggedIn = authService.isLoggedIn();

  useEffect(() => {
    loadVoteData();
  }, [commentId]);

  const loadVoteData = async () => {
    // Get counts
    const counts = await voteService.getVoteCounts('comment', commentId);
    if (counts) {
      setScore(counts.score || 0);
    }

    // Get user's vote if logged in
    if (isLoggedIn) {
      const vote = await voteService.getMyVote('comment', commentId);
      if (vote) {
        setUpvoted(vote.voteType === 'upvote');
        setDownvoted(vote.voteType === 'downvote');
      }
    }
  };

  const handleVote = async (voteType) => {
    if (!isLoggedIn) {
      alert('Please login to vote');
      return;
    }

    setLoading(true);
    try {
      const result = await voteService.voteComment(commentId, voteType);
      
      if (result.success) {
        const { action, counts } = result.data;

        if (voteType === 'upvote') {
          setUpvoted(action !== 'removed');
          if (action !== 'removed' && downvoted) setDownvoted(false);
        } else {
          setDownvoted(action !== 'removed');
          if (action !== 'removed' && upvoted) setUpvoted(false);
        }

        setScore(counts.score);
      }
    } catch (error) {
      alert('Failed to vote');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="comment-vote-buttons">
      <button
        className={`vote-btn-small ${upvoted ? 'active' : ''}`}
        onClick={() => handleVote('upvote')}
        disabled={loading}
      >
        ▲
      </button>
      <span className="vote-score">{score}</span>
      <button
        className={`vote-btn-small ${downvoted ? 'active' : ''}`}
        onClick={() => handleVote('downvote')}
        disabled={loading}
      >
        ▼
      </button>
    </div>
  );
}

export default CommentVoteButtons;
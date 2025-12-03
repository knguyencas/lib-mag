import { useState, useEffect } from 'react';
import { voteService } from '@/services/voteService';
import { authService } from '@/services/authService';

function CommentVoteButtons({ commentId }) {
  const [upvoted, setUpvoted] = useState(false);
  const [downvoted, setDownvoted] = useState(false);
  const [upvotes, setUpvotes] = useState(0);  // ✅ Separate counts
  const [downvotes, setDownvotes] = useState(0);
  const [loading, setLoading] = useState(false);

  const isLoggedIn = authService.isLoggedIn();

  useEffect(() => {
    loadVoteData();
  }, [commentId]);

  const loadVoteData = async () => {
    // Get counts
    const counts = await voteService.getVoteCounts('comment', commentId);
    if (counts) {
      setUpvotes(counts.upvotes || 0);  // ✅ Set both
      setDownvotes(counts.downvotes || 0);
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

        setUpvotes(counts.upvotes);  // ✅ Update both
        setDownvotes(counts.downvotes);
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
        ▲ {upvotes}
      </button>
      <button
        className={`vote-btn-small ${downvoted ? 'active' : ''}`}
        onClick={() => handleVote('downvote')}
        disabled={loading}
      >
        ▼ {downvotes}
      </button>
    </div>
  );
}

export default CommentVoteButtons;
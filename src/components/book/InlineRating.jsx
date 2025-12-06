import { useState, useEffect } from 'react';
import { authService } from '@/services/authService';
import './InlineRating.css';

function InlineRating({ bookId, initialRating = 0, ratingCount = 0, onRatingChange }) {
  const [averageRating, setAverageRating] = useState(initialRating);
  const [totalRatings, setTotalRatings] = useState(ratingCount);
  const [userRating, setUserRating] = useState(null);
  const [hasRated, setHasRated] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const isLoggedIn = authService.isLoggedIn();

  useEffect(() => {
    setAverageRating(initialRating);
    setTotalRatings(ratingCount);
  }, [initialRating, ratingCount]);

  useEffect(() => {
    if (isLoggedIn && bookId) {
      checkUserRating();
    }
  }, [bookId, isLoggedIn]);

  const checkUserRating = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/books/${bookId}/my-rating`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setUserRating(result.data.rating);
          setHasRated(true);
        }
      }
    } catch (error) {
      console.error('Error checking user rating:', error);
    }
  };

  const handleStarClick = async (rating) => {
    if (!isLoggedIn) {
      alert('Please login to rate this book');
      return;
    }

    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      const response = await fetch(`${API_BASE_URL}/api/books/${bookId}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`
        },
        body: JSON.stringify({ rating })
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Backend endpoint not configured. Please check if userBooks.route.js is registered in app.js');
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit rating');
      }

      const result = await response.json();
      
      if (result.success) {
        setUserRating(rating);
        setHasRated(true);
        
        if (result.data.bookRating !== undefined) {
          setAverageRating(result.data.bookRating);
          setTotalRatings(result.data.bookRatingCount || totalRatings);
        }

        if (onRatingChange) {
          onRatingChange({
            rating: result.data.bookRating,
            count: result.data.bookRatingCount
          });
        }
      }
    } catch (error) {
      console.error('Rating error:', error);
      alert(`Error: ${error.message}\n\nPlease ensure:\n1. Backend is running\n2. userBooks.route.js is in backend/routes/\n3. Route is registered in app.js`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStarFilled = (starNumber) => {
    if (hoverRating > 0) {
      return starNumber <= hoverRating;
    }
    return starNumber <= Math.round(averageRating);
  };

  return (
    <div className="inline-rating">
      <div 
        className="rating-stars"
        onMouseLeave={() => setHoverRating(0)}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            className={`star-btn ${isSubmitting ? 'disabled' : ''}`}
            onMouseEnter={() => !hasRated && setHoverRating(star)}
            onClick={() => handleStarClick(star)}
            disabled={isSubmitting}
            title={
              !isLoggedIn 
                ? 'Login to rate' 
                : hasRated 
                  ? `You rated: ${userRating} stars. Click to change.`
                  : `Rate ${star} star${star > 1 ? 's' : ''}`
            }
          >
            <span className={`star ${getStarFilled(star) ? 'filled' : ''}`}>
              ★
            </span>
          </button>
        ))}
      </div>
      
      <div className="rating-text">
        <span className="rating-value">
          {averageRating.toFixed(1)} / 5.0
        </span>
        {totalRatings > 0 && (
          <span className="rating-count">
            ({totalRatings} {totalRatings === 1 ? 'rating' : 'ratings'})
          </span>
        )}
      </div>
    </div>
  );
}

export default InlineRating;
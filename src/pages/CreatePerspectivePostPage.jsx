import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import Header from '../components/layout/Header';
import '../styles/create-visual-post.css';

function CreatePerspectivePostPage() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Create Perspective Post - Psyche Journey';
  }, []);

  const [formData, setFormData] = useState({
    topic: '',
    content: '',
    tags: [],
    primary_genre: ''
  });

  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const genres = [
    'Psychology',
    'Philosophy',
    'Literature',
    'Self-help',
    'Mindfulness',
    'Spirituality',
    'General'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleTagInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    if (!formData.content.trim()) {
      setError('Please enter content');
      return;
    }

    setLoading(true);

    try {
      const token = authService.getToken();
      const user = authService.getUser();

      if (!token || !user) {
        setError('You must be logged in to create a post');
        setLoading(false);
        return;
      }

      const submitData = {
        topic: formData.topic.trim(),
        content: formData.content.trim(),
        tags: formData.tags,
        primary_genre: formData.primary_genre || 'General',
        author_id: user.id || user._id
      };

      const response = await fetch('http://localhost:3000/api/perspectivepost', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submitData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create post');
      }

      setShowSuccessModal(true);

    } catch (err) {
      console.error('Error creating post:', err);
      setError(err.message || 'Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    navigate('/perspective');
  };

  return (
    <div className="create-visual-post-page">
      <Header />
      
      <main className="create-post-main">
        <div className="create-post-container">
          <h1 className="page-title">Create Perspective Post</h1>
          <p className="page-subtitle">Share your thoughts and perspectives with the community</p>

          <div className="post-info">
            ℹ️ Posts require admin approval before publishing
          </div>

          <form onSubmit={handleSubmit} className="create-post-form">
            <div className="form-section">
              <label htmlFor="topic" className="form-label">Topic *</label>
              <input
                type="text"
                id="topic"
                name="topic"
                value={formData.topic}
                onChange={handleInputChange}
                className="text-input"
                placeholder="Enter post topic"
                maxLength={200}
                disabled={loading}
              />
            </div>

            <div className="form-section">
              <label htmlFor="primary_genre" className="form-label">Primary Genre *</label>
              <select
                id="primary_genre"
                name="primary_genre"
                value={formData.primary_genre}
                onChange={handleInputChange}
                className="text-input"
                disabled={loading}
              >
                <option value="">Select a genre</option>
                {genres.map(genre => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
            </div>

            <div className="form-section">
              <label htmlFor="content" className="form-label">Content *</label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                className="content-textarea"
                placeholder="Share your thoughts, perspectives, and insights..."
                rows={12}
                disabled={loading}
              />
            </div>

            <div className="form-section">
              <label className="form-label">Tags (optional)</label>
              <div className="tag-input-container">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleTagInputKeyPress}
                  className="text-input"
                  placeholder="Add tags (press Enter)"
                  disabled={loading}
                />
                <button type="button" onClick={handleAddTag} className="btn-secondary" disabled={loading}>
                  Add Tag
                </button>
              </div>

              {formData.tags.length > 0 && (
                <div className="tags-list">
                  {formData.tags.map((tag, index) => (
                    <span key={index} className="tag-item">
                      {tag}
                      <button type="button" onClick={() => handleRemoveTag(tag)} className="remove-tag-btn" disabled={loading}>
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <div className="form-actions">
              <button type="button" onClick={() => navigate(-1)} className="btn-secondary" disabled={loading}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit for Approval'}
              </button>
            </div>
          </form>

          {showSuccessModal && (
            <div className="modal-overlay" onClick={handleSuccessModalClose}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="success-icon">✓</div>
                <h2>Post Submitted Successfully!</h2>
                <p>Your post has been submitted and is waiting for admin approval.</p>
                <p className="modal-hint">You will be notified once it's approved and published.</p>
                <button onClick={handleSuccessModalClose} className="btn-primary modal-btn">
                  OK
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="footer">
        <p>© 2025 Psyche Journey. A quiet place for thoughts and perspectives.</p>
      </footer>
    </div>
  );
}

export default CreatePerspectivePostPage;
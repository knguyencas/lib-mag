import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import Header from '../components/layout/Header';
import '../styles/create-visual-post.css';

function CreateVisualPostPage() {
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  useEffect(() => {
    document.title = 'Create Visual Post - Psyche Journey';
  }, []);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: []
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

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

    if (!imageFile) {
      setError('Please upload an image');
      return;
    }

    if (!formData.title.trim()) {
      setError('Please enter a title');
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

      const submitData = new FormData();
      submitData.append('image', imageFile);
      submitData.append('title', formData.title.trim());
      submitData.append('content', formData.content.trim());
      submitData.append('tags', JSON.stringify(formData.tags));
      submitData.append('author_id', user.id || user._id);

      const response = await fetch(`${API_BASE_URL}/api/visualpost`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: submitData
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
    navigate('/themes');
  };

  return (
    <div className="create-visual-post-page">
      <Header />
      
      <main className="create-post-main">
        <div className="create-post-container">
          <h1 className="page-title">Create Visual Post</h1>
          <p className="page-subtitle">Share your visual insights with the community</p>

          <div className="post-info">
            ℹ️ Posts require admin approval before publishing
          </div>

      <form onSubmit={handleSubmit} className="create-post-form">
        <div className="form-section">
          <label className="form-label">Image *</label>
          
          {!imagePreview ? (
            <div className="image-upload-area">
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
              <label htmlFor="image-upload" className="upload-label">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="17 8 12 3 7 8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="12" y1="3" x2="12" y2="15" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <span className="upload-text">Click to upload image</span>
                <span className="upload-hint">Max file size: 5MB</span>
              </label>
            </div>
          ) : (
            <div className="image-preview-container">
              <img src={imagePreview} alt="Preview" className="image-preview" />
              <button type="button" onClick={handleRemoveImage} className="remove-image-btn">
                Remove Image
              </button>
            </div>
          )}
        </div>

        <div className="form-section">
          <label htmlFor="title" className="form-label">Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className="text-input"
            placeholder="Enter post title"
            maxLength={100}
            disabled={loading}
          />
        </div>

        <div className="form-section">
          <label htmlFor="content" className="form-label">Content *</label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            className="content-textarea"
            placeholder="Write your post content..."
            rows={8}
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
        <p>© 2025 Psyche Journey. Visual exploration of the mind.</p>
      </footer>
    </div>
  );
}

export default CreateVisualPostPage;
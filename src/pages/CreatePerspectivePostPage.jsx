import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { perspectiveService } from '../services/perspectiveService';
import { authService } from '../services/authService';
import Header from '../components/Header';
import '../styles/createPerspectivePost.css';

function CreatePerspectivePostPage() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    topic: '',
    content: '',
    primary_genre: 'Psychology',
    tags: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const checkAuth = () => {
      const loggedIn = authService.isAuthenticated();
      setIsLoggedIn(loggedIn);
      
      if (!loggedIn) {
        alert('You must be logged in to create a post');
        navigate('/login');
      }
    };

    checkAuth();
    loadGenres();
  }, [navigate]);

  const loadGenres = async () => {
    try {
      const genresData = await perspectiveService.getGenres();
      setGenres(genresData);
    } catch (error) {
      console.error('Error loading genres:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.topic.trim()) {
      newErrors.topic = 'Topic is required';
    } else if (formData.topic.length > 200) {
      newErrors.topic = 'Topic must not exceed 200 characters';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    } else if (formData.content.length < 50) {
      newErrors.content = 'Content must be at least 50 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const postData = {
        topic: formData.topic.trim(),
        content: formData.content.trim(),
        primary_genre: formData.primary_genre,
        tags: tagsArray
      };

      const response = await perspectiveService.createPost(postData);
      
      alert('Post created successfully! It will be reviewed by admin before publishing.');
      navigate('/perspective');
      
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="create-perspective-post-page">
      <Header />
      
      <div className="create-post-container">
        <div className="create-post-header">
          <h1>Create Perspective Post</h1>
          <p className="subtitle">Share your thoughts and perspectives with the community</p>
        </div>

        <form onSubmit={handleSubmit} className="create-post-form">
          <div className="form-group">
            <label htmlFor="topic">
              Topic <span className="required">*</span>
            </label>
            <input
              type="text"
              id="topic"
              name="topic"
              value={formData.topic}
              onChange={handleChange}
              placeholder="Enter your post topic (max 200 characters)"
              maxLength={200}
              className={errors.topic ? 'error' : ''}
            />
            <div className="char-count">{formData.topic.length}/200</div>
            {errors.topic && <span className="error-message">{errors.topic}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="primary_genre">
              Primary Genre <span className="required">*</span>
            </label>
            <select
              id="primary_genre"
              name="primary_genre"
              value={formData.primary_genre}
              onChange={handleChange}
            >
              {genres.map(genre => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="tags">Tags (Optional)</label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="Enter tags separated by commas (e.g., mindfulness, psychology, therapy)"
            />
            <small className="help-text">
              Separate multiple tags with commas
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="content">
              Content <span className="required">*</span>
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Write your perspective here... (minimum 50 characters)"
              rows={15}
              className={errors.content ? 'error' : ''}
            />
            <div className="char-count">{formData.content.length} characters</div>
            {errors.content && <span className="error-message">{errors.content}</span>}
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={() => navigate('/perspective')}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Post'}
            </button>
          </div>

          <p className="submission-note">
            <strong>Note:</strong> Your post will be reviewed by an admin before being published to the community.
          </p>
        </form>
      </div>
    </div>
  );
}

export default CreatePerspectivePostPage;
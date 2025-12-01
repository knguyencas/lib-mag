import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { authService } from '@/services/authService';
import { perspectiveService } from '@/services/perspectiveService';

function CreatePerspectivePostPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    primary_genre: 'General',
    tags: []
  });

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const genres = [
    'General',
    'Psychology',
    'Philosophy',
    'Literature',
    'Self-help',
    'Mindfulness',
    'Spirituality'
  ];

  useEffect(() => {
    document.title = 'Create Perspective Post – Psyche Journey';

    if (!authService.isLoggedIn()) {
      navigate('/login');
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (!tag) return;

    if (formData.tags.includes(tag)) {
      setError('Tag already added');
      return;
    }

    if (formData.tags.length >= 5) {
      setError('Maximum 5 tags allowed');
      return;
    }

    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, tag]
    }));
    setTagInput('');
    setError('');
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleTagInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.title.trim().length < 3) {
      setError('Title must be at least 3 characters long');
      return;
    }

    if (formData.title.trim().length > 200) {
      setError('Title must not exceed 200 characters');
      return;
    }

    if (formData.content.trim().length < 10) {
      setError('Content must be at least 10 characters long');
      return;
    }

    try {
      setSubmitting(true);
      console.log('Submitting post:', formData);

      const result = await perspectiveService.createPost(formData);
      
      console.log('Post created:', result);
      
      alert('Perspective post created successfully! Pending admin approval.');
      navigate('/my-posts');
      
    } catch (err) {
      console.error('Error creating post:', err);
      
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to create post. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#F3F3F3', minHeight: '100vh' }}>
      <Header />
      
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 20px' }}>
        <h1 style={{ 
          fontFamily: 'Poppins, sans-serif',
          fontSize: '28px',
          fontWeight: 600,
          color: '#000',
          marginBottom: '32px'
        }}>
          Create Perspective Post
        </h1>

        {error && (
          <div style={{
            background: '#ffe6e6',
            border: '1px solid #ffcccc',
            color: '#cc0000',
            padding: '12px 16px',
            borderRadius: '4px',
            marginBottom: '20px',
            fontFamily: 'Poppins, sans-serif',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontFamily: 'Poppins, sans-serif',
              fontSize: '14px',
              fontWeight: 500,
              color: '#000',
              marginBottom: '8px'
            }}>
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter post title"
              required
              maxLength={200}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '14px',
                fontFamily: 'Poppins, sans-serif',
                border: '1px solid #D0D0D0',
                borderRadius: '4px',
                outline: 'none',
                boxSizing: 'border-box',
                color: '#000',
                backgroundColor: '#FFFFFF'
              }}
            />
            <div style={{
              fontSize: '12px',
              color: '#666',
              marginTop: '4px',
              fontFamily: 'Poppins, sans-serif'
            }}>
              {formData.title.length}/200 characters (minimum 3)
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontFamily: 'Poppins, sans-serif',
              fontSize: '14px',
              fontWeight: 500,
              color: '#000',
              marginBottom: '8px'
            }}>
              Content *
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              placeholder="Write your perspective..."
              required
              rows={10}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '14px',
                fontFamily: 'Poppins, sans-serif',
                border: '1px solid #D0D0D0',
                borderRadius: '4px',
                outline: 'none',
                resize: 'vertical',
                boxSizing: 'border-box',
                color: '#000',
                backgroundColor: '#FFFFFF'
              }}
            />
            <div style={{
              fontSize: '12px',
              color: '#666',
              marginTop: '4px',
              fontFamily: 'Poppins, sans-serif'
            }}>
              {formData.content.length} characters (minimum 10)
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontFamily: 'Poppins, sans-serif',
              fontSize: '14px',
              fontWeight: 500,
              color: '#000',
              marginBottom: '8px'
            }}>
              Primary Genre
            </label>
            <select
              name="primary_genre"
              value={formData.primary_genre}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '14px',
                fontFamily: 'Poppins, sans-serif',
                border: '1px solid #D0D0D0',
                borderRadius: '4px',
                outline: 'none',
                boxSizing: 'border-box',
                color: '#000',
                backgroundColor: '#FFFFFF',
                cursor: 'pointer'
              }}
            >
              {genres.map(genre => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontFamily: 'Poppins, sans-serif',
              fontSize: '14px',
              fontWeight: 500,
              color: '#000',
              marginBottom: '8px'
            }}>
              Tags (optional)
            </label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
                placeholder="Add a tag"
                maxLength={30}
                style={{
                  flex: 1,
                  padding: '12px',
                  fontSize: '14px',
                  fontFamily: 'Poppins, sans-serif',
                  border: '1px solid #D0D0D0',
                  borderRadius: '4px',
                  outline: 'none',
                  color: '#000',
                  backgroundColor: '#FFFFFF'
                }}
              />
              <button
                type="button"
                onClick={handleAddTag}
                disabled={!tagInput.trim() || formData.tags.length >= 5}
                style={{
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontFamily: 'Poppins, sans-serif',
                  backgroundColor: '#D9D9D9',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: formData.tags.length >= 5 ? 'not-allowed' : 'pointer',
                  color: '#000',
                  opacity: formData.tags.length >= 5 ? 0.5 : 1
                }}
              >
                Add Tag
              </button>
            </div>
            
            {formData.tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      backgroundColor: '#E8E8E8',
                      borderRadius: '16px',
                      fontSize: '13px',
                      fontFamily: 'Poppins, sans-serif',
                      color: '#000'
                    }}
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '16px',
                        color: '#666',
                        padding: 0,
                        lineHeight: 1
                      }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div style={{
              fontSize: '12px',
              color: '#666',
              marginTop: '4px',
              fontFamily: 'Poppins, sans-serif'
            }}>
              {formData.tags.length}/5 tags
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
            <button
              type="submit"
              disabled={submitting}
              style={{
                flex: 1,
                padding: '14px 24px',
                fontSize: '16px',
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 500,
                backgroundColor: '#2A2A2A',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '4px',
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.6 : 1
              }}
            >
              {submitting ? 'Submitting...' : 'Submit Post'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/perspective')}
              disabled={submitting}
              style={{
                flex: 1,
                padding: '14px 24px',
                fontSize: '16px',
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 500,
                backgroundColor: '#D9D9D9',
                color: '#000',
                border: 'none',
                borderRadius: '4px',
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.6 : 1
              }}
            >
              Cancel
            </button>
          </div>
        </form>

        <div style={{
          marginTop: '32px',
          padding: '16px',
          backgroundColor: '#E8F4F8',
          borderRadius: '4px',
          fontSize: '13px',
          fontFamily: 'Poppins, sans-serif',
          color: '#2C5F77',
          lineHeight: '1.5'
        }}>
          <strong>Note:</strong> Your post will be pending admin approval before being published. 
          You can view the status in "My Posts" section.
        </div>
      </main>
    </div>
  );
}

export default CreatePerspectivePostPage;
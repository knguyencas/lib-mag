import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import VisualPostCard from '../components/posts/VisualPostCard';
import { authService } from '../services/authService';
import '../styles/themes.css';

function ThemesPage() {
  const navigate = useNavigate();
  const [visualPosts, setVisualPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    document.title = 'Psyche Journey – Themes';
    document.body.classList.add('themes');
    document.body.classList.remove('home', 'library');

    setIsLoggedIn(authService.isLoggedIn());
    loadVisualPosts();

    return () => {
      document.body.classList.remove('themes');
    };
  }, []);

  const loadVisualPosts = async () => {
    try {
      setLoading(true);
      const mockPosts = [
        {
          id: '1',
          title: 'The Shadow Within',
          description: 'Exploring the depths of our unconscious mind through visual metaphor.',
          imageUrl: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=400',
          genre: 'Psychology',
          tags: ['shadow', 'unconscious', 'jung'],
          author: { username: 'mindexplorer' },
          createdAt: '2024-11-29',
          likes: 42,
          views: 128
        },
        {
          id: '2',
          title: 'Collective Dreams',
          description: 'A visual journey into the collective unconscious.',
          imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400',
          genre: 'Philosophy',
          tags: ['dreams', 'collective'],
          author: { username: 'dreamweaver' },
          createdAt: '2024-11-28',
          likes: 35,
          views: 95
        }
      ];
      
      setVisualPosts(mockPosts);
    } catch (error) {
      console.error('Error loading visual posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    navigate('/create-visual-post');
  };

  if (loading) {
    return (
      <div className="themes-page">
        <Header />
        <main className="themes-page-main">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading themes...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="themes-page">
      <Header />

      <main className="themes-page-main">
        {visualPosts.length === 0 ? (
          <div className="no-results">
            <h3>No visual posts found</h3>
            <p>Be the first to create a visual post!</p>
          </div>
        ) : (
          <div className="visual-grid">
            {visualPosts.map(post => (
              <VisualPostCard key={post.id} post={post} />
            ))}
          </div>
        )}

        {isLoggedIn && (
          <button className="floating-create-btn" onClick={handleCreatePost}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        )}
      </main>

      <footer className="footer">
        <p>© 2025 Psyche Journey. Visual exploration of the mind.</p>
      </footer>
    </div>
  );
}

export default ThemesPage;

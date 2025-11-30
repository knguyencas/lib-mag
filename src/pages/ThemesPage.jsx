import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import VisualPostCard from '../components/posts/VisualPostCard';
import { authService } from '../services/authService';
import '../styles/themes.css';

const POSTS_PER_PAGE = 6;

function ThemesPage() {
  const navigate = useNavigate();
  const [visualPosts, setVisualPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

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

      // mock data cho layout
      const mockPosts = [
        {
          id: '1',
          title: 'Article Title',
          description: 'Exploring the depths of our unconscious mind through visual metaphor.',
          imageUrl: '',
          genre: 'Psychology',
          author: { username: 'psyche_journey' },
          createdAt: '2024-11-29',
          likes: 42,
          views: 128,
        },
        {
          id: '2',
          title: 'Article Title',
          description: 'A visual journey into the collective unconscious.',
          imageUrl: '',
          genre: 'Philosophy',
          author: { username: 'psyche_journey' },
          createdAt: '2024-11-28',
          likes: 35,
          views: 95,
        },
        {
          id: '3',
          title: 'Article Title',
          description: 'On the tension between light and shadow in the mind.',
          imageUrl: '',
          genre: 'Psychology',
          author: { username: 'psyche_journey' },
          createdAt: '2024-11-27',
          likes: 21,
          views: 74,
        },
        {
          id: '4',
          title: 'Article Title',
          description: 'Symbolic images and quiet reflection.',
          imageUrl: '',
          genre: 'Mindfulness',
          author: { username: 'psyche_journey' },
          createdAt: '2024-11-26',
          likes: 18,
          views: 66,
        },
        {
          id: '5',
          title: 'Article Title',
          description: 'Dreamlike compositions about memory and loss.',
          imageUrl: '',
          genre: 'Psychology',
          author: { username: 'psyche_journey' },
          createdAt: '2024-11-25',
          likes: 30,
          views: 90,
        },
        {
          id: '6',
          title: 'Article Title',
          description: 'Quiet scenes that capture inner monologues.',
          imageUrl: '',
          genre: 'Philosophy',
          author: { username: 'psyche_journey' },
          createdAt: '2024-11-24',
          likes: 16,
          views: 54,
        },
        {
          id: '7',
          title: 'Article Title',
          description: 'Visual notes on emotional regulation.',
          imageUrl: '',
          genre: 'Psychology',
          author: { username: 'psyche_journey' },
          createdAt: '2024-11-23',
          likes: 11,
          views: 40,
        },
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

  const totalPages = Math.ceil(visualPosts.length / POSTS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const paginatedPosts = visualPosts.slice(
    startIndex,
    startIndex + POSTS_PER_PAGE
  );

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handleChangePage = (page) => {
    setCurrentPage(page);
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
        <section className="themes-grid-wrapper">
          <div className="visual-grid">
            {paginatedPosts.map((post) => (
              <VisualPostCard key={post.id} post={post} />
            ))}
          </div>

          <div className="themes-pagination">
            <div className="pagination-inner">
              {Array.from({ length: totalPages }).map((_, index) => {
                const page = index + 1;
                return (
                  <button
                    key={page}
                    className={`page-pill ${page === currentPage ? 'active' : ''}`}
                    onClick={() => handleChangePage(page)}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                className="page-next"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        </section>

        {isLoggedIn && (
          <button className="floating-create-btn" onClick={handleCreatePost}>
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
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

import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import LoginForm from '../components/auth/LoginForm';
import '../styles/auth.css';

function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'Sign In - Psyche Journey';

    if (authService.isLoggedIn()) {
      navigate('/');
    }
  }, [navigate]);

  const handleLogin = async (formData) => {
    try {
      setLoading(true);
      setError('');

      await authService.login(formData.identifier, formData.password);

      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid email/username or password');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    alert('Google login coming soon!');
  };

  return (
    <div className="auth-page">
      <header className="auth-header">
        <Link to="/" className="logo-link">
          <h1 className="logo">PSYCHE JOURNEY</h1>
        </Link>
      </header>

      <main className="auth-main">
        <div className="auth-card">
          <h1 className="auth-title">Sign In</h1>

          {error && (
            <div className="error-box">
              {error}
            </div>
          )}

          <LoginForm onSubmit={handleLogin} loading={loading} />

          <div className="divider">
            <div className="divider-line"></div>
            <span>OR</span>
            <div className="divider-line"></div>
          </div>

          <div className="social-row">
            <button
              className="social-btn"
              type="button"
              onClick={handleGoogleLogin}
              title="Sign in with Google"
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
              />
            </button>
          </div>

          <p className="bottom-text">
            Don't have an account?{' '}
            <Link to="/register">Register Now</Link>
          </p>
        </div>
      </main>

      <footer className="auth-footer">
        © 2025 Psyche Journey · built for curious minds.
      </footer>
    </div>
  );
}

export default LoginPage;
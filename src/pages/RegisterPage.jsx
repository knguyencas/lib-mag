import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import RegisterForm from '../components/auth/RegisterForm';
import '../styles/auth.css';

function RegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    document.title = 'Register - Psyche Journey';

    if (authService.isLoggedIn()) {
      navigate('/');
    }
  }, [navigate]);

  const handleRegister = async (formData) => {
    try {
      setLoading(true);
      setError('');

      await authService.register(
        formData.username,
        formData.email,
        formData.password
      );

      setSuccess(true);

      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      console.error('Register error:', err);
      
      if (err.message && err.message.toLowerCase().includes('exists')) {
        setError('This email or username is already taken');
      } else {
        setError(err.message || 'Registration failed. Please try again');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = () => {
    alert('Google sign-up coming soon!');
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
          <h1 className="auth-title">Register</h1>

          {success && (
            <div className="success-box">
              Registration successful! Redirecting...
            </div>
          )}

          {error && (
            <div className="error-box">
              {error}
            </div>
          )}

          <RegisterForm onSubmit={handleRegister} loading={loading} />

          <div className="divider">
            <div className="divider-line"></div>
            <span>OR</span>
            <div className="divider-line"></div>
          </div>

          <div className="social-row">
            <button
              className="social-btn"
              type="button"
              onClick={handleGoogleRegister}
              title="Sign up with Google"
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
              />
            </button>
          </div>

          <p className="bottom-text">
            Already have an account?{' '}
            <Link to="/login">Sign In</Link>
          </p>
        </div>
      </main>

      <footer className="auth-footer">
        © 2025 Psyche Journey · a small corner for wandering minds.
      </footer>
    </div>
  );
}

export default RegisterPage;
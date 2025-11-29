import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import SearchBar from './SearchBar';
import './Header.css';

function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    const loggedIn = authService.isLoggedIn();
    setIsLoggedIn(loggedIn);
    
    if (loggedIn) {
      const userData = authService.getUser();
      setUser(userData);
    }
  };

  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      await authService.logout();
      setIsLoggedIn(false);
      setUser(null);
      setShowUserMenu(false);
      navigate('/');
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showUserMenu && !e.target.closest('.user-menu')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showUserMenu]);

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="first_header">
        <Link to="/" className="logo-link">
          <h1 className="logo">PSYCHE JOURNEY</h1>
        </Link>
        
        {isLoggedIn && user ? (
          <div className="user-menu">
            <div 
              className="user-avatar"
              onClick={() => setShowUserMenu(!showUserMenu)}
              title={user.username || user.email}
            >
              {(user.username || user.email || 'U').substring(0, 2).toUpperCase()}
            </div>
            <span 
              className="username-display"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              {user.username || user.displayName || 'User'}
            </span>

            {showUserMenu && (
              <div className="user-dropdown">
                <div className="user-dropdown-header">
                  <div className="dropdown-username">{user.username || 'User'}</div>
                  <div className="dropdown-email">{user.email || ''}</div>
                </div>
                <Link to="/settings" className="dropdown-item">
                Settings
                </Link>
                <Link to="/perspective" className="dropdown-item">
                My Posts
                </Link>
                <button onClick={handleLogout} className="dropdown-item logout">
                Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link to="/contact">Contact</Link>
            <Link to="/login">Login</Link>
          </>
        )}
      </div>

      <nav>
        <ul className="nav_bar">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/library">Library</Link></li>
          <li><Link to="/themes">Themes</Link></li>
          <li><Link to="/perspective">Perspective</Link></li>
          <li><Link to="/about">About</Link></li>
        </ul>
      </nav>

      <div className="sub_nav">
        <SearchBar />
      </div>
    </header>
  );
}

export default Header;
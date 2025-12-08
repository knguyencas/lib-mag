import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
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

  const handleMenuItemClick = (path) => {
    setShowUserMenu(false);
    navigate(path);
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

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const isSuperAdmin = user?.role === 'super_admin';

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
                  {(isAdmin || isSuperAdmin) && (
                    <div className="dropdown-role">
                      {isSuperAdmin ? 'Super Admin' : 'Admin'}
                    </div>
                  )}
                </div>

                <button 
                  onClick={() => handleMenuItemClick('/settings')} 
                  className="dropdown-item"
                >
                  <svg viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 1v6M12 17v6M5 12H1M23 12h-4M19 5l-4 4M14 14l-4 4M5 19l4-4M14 10l4-4" />
                  </svg>
                  Settings
                </button>

                <button 
                  onClick={() => handleMenuItemClick('/favorites')} 
                  className="dropdown-item favorites-item"
                >
                  <svg viewBox="0 0 24 24">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                  </svg>
                  My Favorites
                </button>

                <button 
                  onClick={() => handleMenuItemClick('/my-posts')} 
                  className="dropdown-item"
                >
                  <svg viewBox="0 0 24 24">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                  My Posts
                </button>

                {(isAdmin || isSuperAdmin) && (
                  <>
                    <div className="dropdown-divider"></div>
                    <div className="dropdown-section-title">Admin Panel</div>
                    
                    {isSuperAdmin && (
                      <button 
                        onClick={() => handleMenuItemClick('/admin/manage-admins')} 
                        className="dropdown-item admin-item"
                      >
                        <svg viewBox="0 0 24 24">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                        Manage Admins
                      </button>
                    )}
                    
                    <button 
                      onClick={() => handleMenuItemClick('/admin/manage-books')} 
                      className="dropdown-item admin-item"
                    >
                      <svg viewBox="0 0 24 24">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                      </svg>
                      Manage Books
                    </button>
                    
                    <button 
                      onClick={() => handleMenuItemClick('/admin/add-book')} 
                      className="dropdown-item admin-item"
                    >
                      <svg viewBox="0 0 24 24">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="12" y1="18" x2="12" y2="12" />
                        <line x1="9" y1="15" x2="15" y2="15" />
                      </svg>
                      Add New Book
                    </button>
                    
                    <button 
                      onClick={() => handleMenuItemClick('/admin/manage-posts')} 
                      className="dropdown-item admin-item"
                    >
                      <svg viewBox="0 0 24 24">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <polyline points="10 9 9 9 8 9" />
                      </svg>
                      Manage Posts
                    </button>
                  </>
                )}

                <div className="dropdown-divider"></div>
                <button onClick={handleLogout} className="dropdown-item logout">
                  <svg viewBox="0 0 24 24">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
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

    </header>
  );
}

export default Header;
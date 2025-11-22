import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';
import './Header.css';

function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="first_header">
        <Link to="/" className="logo-link">
          <h1 className="logo">PSYCHE JOURNEY</h1>
        </Link>
        <Link to="/contact">Contact</Link>
        <Link to="/login">Login</Link>
      </div>

      <nav>
        <ul className="nav_bar">
          <li><Link to="/" className="active">Home</Link></li>
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
import { Link } from 'react-router-dom';
import '../styles/admin-add-book.css';

function AdminHeader() {
  return (
    <header className="admin-header">
      <div className="admin-header-left">
        <h1 className="logo">PSYCHE JOURNEY</h1>
      </div>
      <nav className="top-nav">
        <Link to="/">Home</Link>
        <Link to="/library">Library</Link>
        <span className="divider">|</span>
        <span className="admin-label">Admin panel</span>
      </nav>
    </header>
  );
}

export default AdminHeader;
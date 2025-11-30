import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { authService } from '@/services/authService';
import '@/styles/admin-add-book.css';

function AdminAddBookPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    document.title = 'Admin - Add New Book | Psyche Journey';
    
    const currentUser = authService.getUser();
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/');
      return;
    }
    setUser(currentUser);
  }, [navigate]);

  const handlePreviewJson = () => {
    console.log('Preview JSON clicked');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted');
  };

  const handleReset = () => {
    console.log('Form reset');
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="admin-add-book-page">
      <header className="header">
        <div className="first_header">
          <h1 className="logo">PSYCHE JOURNEY</h1>
          <nav className="top-nav">
            <a href="/">Home</a>
            <a href="/library">Library</a>
            <span className="divider">|</span>
            <span className="admin-label">Admin Panel</span>
          </nav>
        </div>
      </header>

      <main className="admin-page">
        <aside className="admin-sidebar">
          <h2 className="sidebar-title">Admin</h2>
          <ul className="sidebar-menu">
            <li className="sidebar-item active">
              <span>Add new book</span>
            </li>
            <li className="sidebar-item disabled">
              <span>Manage books</span>
            </li>
            <li className="sidebar-item disabled">
              <span>Authors & metadata</span>
            </li>
          </ul>
          <div className="sidebar-note">
            Only users with <strong>admin</strong> role can access this page.
          </div>
        </aside>

        <section className="admin-content">
          <div className="page-header">
            <div>
              <h2 className="page-title">Add new book</h2>
              <p className="page-subtitle">
                Fill in metadata, upload cover & ebook. Primary genre will be derived from categories in backend.
              </p>
            </div>
            <button type="button" className="ghost-button" onClick={handlePreviewJson}>
              Preview JSON
            </button>
          </div>

          <form id="adminAddBookForm" className="admin-form" onSubmit={handleSubmit}>
            <section className="form-section">
              <h3 className="section-title">Basic information</h3>
              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="title">Title <span className="required">*</span></label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    required
                    placeholder="The Archetypes and the Collective Unconscious"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="publisher">Publisher <span className="required">*</span></label>
                  <input
                    type="text"
                    id="publisher"
                    name="publisher"
                    placeholder="Routledge"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="year">Publication year <span className="required">*</span></label>
                  <input
                    type="number"
                    id="year"
                    name="year"
                    placeholder="1959"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="pageCount">Page count <span className="required">*</span></label>
                  <input
                    type="number"
                    id="pageCount"
                    name="pageCount"
                    min="1"
                    placeholder="400"
                  />
                </div>
              </div>
            </section>

            <section className="form-section">
              <h3 className="section-title">Blurb / description</h3>
              <div className="form-field">
                <label htmlFor="blurb">Blurb <span className="required">*</span></label>
                <textarea
                  id="blurb"
                  name="blurb"
                  rows="6"
                  placeholder="Write a short description for this book..."
                />
              </div>
            </section>

            <section className="form-actions">
              <button type="button" className="ghost-button" onClick={handleReset}>
                Reset form
              </button>
              <button type="submit" className="primary-button">
                Save book (send to backend)
              </button>
            </section>
          </form>
        </section>
      </main>
    </div>
  );
}

export default AdminAddBookPage;

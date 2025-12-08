import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import '../styles/admin-add-book.css';
import '../styles/admin-page.css';

function ManageBooksPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [filter, setFilter] = useState({
    status: '',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    document.title = 'Manage Books | Psyche Journey';
    
    const currentUser = authService.getUser();
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'super_admin')) {
      navigate('/');
      return;
    }
    setUser(currentUser);
  }, [navigate]);

  useEffect(() => {
    if (user) {
      loadBooks();
    }
  }, [filter, pagination.page, user]);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sortBy: filter.sortBy,
        sortOrder: filter.sortOrder,
        ...(filter.status && { status: filter.status }),
        ...(filter.search && { search: filter.search })
      });

      console.log('Fetching books:', `${API_BASE_URL}/admin/books/manage?${params}`);

      const response = await fetch(`${API_BASE_URL}/admin/books/manage?${params}`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Books data:', result);
      
      if (result.success) {
        setBooks(result.data || []);
        if (result.pagination) {
          setPagination(result.pagination);
        }
      } else {
        console.error('API returned success: false');
        setBooks([]);
      }
    } catch (error) {
      console.error('Error loading books:', error);
      setBooks([]);
      alert('Failed to load books. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBook = async (bookId) => {
    if (!confirm('Are you sure you want to delete this book?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/admin/books/manage/${bookId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      });

      const result = await response.json();
      if (result.success) {
        alert('Book deleted successfully!');
        loadBooks();
      } else {
        alert(result.message || 'Failed to delete book');
      }
    } catch (error) {
      console.error('Error deleting book:', error);
      alert('Error deleting book');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({...prev, page: 1}));
    loadBooks();
  };

  const handleSort = (sortBy) => {
    setFilter(prev => ({
      ...prev,
      sortBy,
      sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'desc' ? 'asc' : 'desc'
    }));
    setPagination(prev => ({...prev, page: 1}));
  };

  const getSortIcon = (column) => {
    if (filter.sortBy !== column) return '⇅';
    return filter.sortOrder === 'asc' ? '↑' : '↓';
  };

  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    return null;
  }

  return (
    <div className="admin-add-book-page">
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

      <main className="admin-content">
        <h1>Manage Books</h1>
        <p>View, edit, and delete books in the library</p>

        <div className="filters">
          <form onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search by title, author, book_id..."
              value={filter.search}
              onChange={(e) => setFilter(prev => ({...prev, search: e.target.value}))}
            />
            <select 
              value={filter.status}
              onChange={(e) => setFilter(prev => ({...prev, status: e.target.value}))}
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
            <button type="submit" className="btn-primary">Search</button>
          </form>
        </div>

        {loading ? (
          <div className="loading-state">
            <p>Loading books...</p>
          </div>
        ) : books.length === 0 ? (
          <div className="empty-state">
            <h3>No books found</h3>
            <p>Try adjusting your filters or add a new book</p>
          </div>
        ) : (
          <>
            <div className="books-list">
              <h3>Books ({pagination.total})</h3>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Book ID</th>
                    <th 
                      className="sortable"
                      onClick={() => handleSort('title')}
                    >
                      Title {getSortIcon('title')}
                    </th>
                    <th 
                      className="sortable"
                      onClick={() => handleSort('author')}
                    >
                      Author {getSortIcon('author')}
                    </th>
                    <th 
                      className="sortable"
                      onClick={() => handleSort('year')}
                    >
                      Year {getSortIcon('year')}
                    </th>
                    <th>Status</th>
                    <th 
                      className="sortable"
                      onClick={() => handleSort('rating')}
                    >
                      Rating {getSortIcon('rating')}
                    </th>
                    <th 
                      className="sortable"
                      onClick={() => handleSort('createdAt')}
                    >
                      Created {getSortIcon('createdAt')}
                    </th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {books.map(book => (
                    <tr key={book.book_id}>
                      <td>{book.book_id}</td>
                      <td>{book.title}</td>
                      <td>{book.author}</td>
                      <td>{book.year}</td>
                      <td>
                        <span className={`status-badge status-${book.status}`}>
                          {book.status}
                        </span>
                      </td>
                      <td>{(book.rating || 0).toFixed(1)}</td>
                      <td>{new Date(book.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button 
                          className="btn-small"
                          onClick={() => navigate(`/admin/edit-book/${book.book_id}`)}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn-danger"
                          onClick={() => handleDeleteBook(book.book_id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination.pages > 1 && (
              <div className="pagination">
                <button 
                  disabled={pagination.page === 1}
                  onClick={() => setPagination(prev => ({...prev, page: prev.page - 1}))}
                >
                  Previous
                </button>
                <span>Page {pagination.page} of {pagination.pages}</span>
                <button 
                  disabled={pagination.page === pagination.pages}
                  onClick={() => setPagination(prev => ({...prev, page: prev.page + 1}))}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default ManageBooksPage;
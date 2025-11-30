import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import { authService } from '../services/authService';
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
    loadBooks();
  }, [filter, pagination.page]);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        sortBy: filter.sortBy,
        sortOrder: filter.sortOrder,
        ...(filter.status && { status: filter.status }),
        ...(filter.search && { search: filter.search })
      });

      const response = await fetch(`http://localhost:3000/api/admin/books/manage?${params}`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      });

      const result = await response.json();
      if (result.success) {
        setBooks(result.data);
        setPagination(result.pagination);
      }
    } catch (error) {
      console.error('Error loading books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBook = async (bookId) => {
    if (!confirm('Are you sure you want to delete this book?')) return;

    try {
      const response = await fetch(`http://localhost:3000/api/admin/books/manage/${bookId}`, {
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
    setPagination({...pagination, page: 1});
  };

  const handleSort = (sortBy) => {
    setFilter({
      ...filter,
      sortBy,
      sortOrder: filter.sortBy === sortBy && filter.sortOrder === 'desc' ? 'asc' : 'desc'
    });
    setPagination({...pagination, page: 1});
  };

  const getSortIcon = (column) => {
    if (filter.sortBy !== column) return '⇅';
    return filter.sortOrder === 'asc' ? '↑' : '↓';
  };

  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    return null;
  }

  return (
    <div className="admin-page">
      <Header />
      <main className="admin-content">
        <h1>Manage Books</h1>
        <p>View, edit, and delete books in the library</p>

        <div className="filters">
          <form onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search by title, author, book_id..."
              value={filter.search}
              onChange={(e) => setFilter({...filter, search: e.target.value})}
            />
            <select 
              value={filter.status}
              onChange={(e) => setFilter({...filter, status: e.target.value})}
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
          <p>Loading...</p>
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
                      <td>⭐ {book.rating.toFixed(1)}</td>
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

            <div className="pagination">
              <button 
                disabled={pagination.page === 1}
                onClick={() => setPagination({...pagination, page: pagination.page - 1})}
              >
                Previous
              </button>
              <span>Page {pagination.page} of {pagination.pages}</span>
              <button 
                disabled={pagination.page === pagination.pages}
                onClick={() => setPagination({...pagination, page: pagination.page + 1})}
              >
                Next
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default ManageBooksPage;
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import '../styles/admin-add-book.css';
import '../styles/admin-page.css';

function ManageAdminsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    document.title = 'Manage Admins | Psyche Journey';
    
    const currentUser = authService.getUser();
    if (!currentUser || currentUser.role !== 'super_admin') {
      navigate('/');
      return;
    }
    setUser(currentUser);
    loadAdmins();
  }, [navigate]);

  const loadAdmins = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/admin/users/admins`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      });

      const result = await response.json();
      if (result.success) {
        setAdmins(result.data);
      }
    } catch (error) {
      console.error('Error loading admins:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/create-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      if (result.success) {
        alert('Admin created successfully!');
        setShowCreateForm(false);
        setFormData({ username: '', email: '', password: '' });
        loadAdmins();
      } else {
        alert(result.message || 'Failed to create admin');
      }
    } catch (error) {
      console.error('Error creating admin:', error);
      alert('Error creating admin');
    }
  };

  const handleDeleteAdmin = async (adminId) => {
    if (!confirm('Are you sure you want to delete this admin?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/admins/${adminId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      });

      const result = await response.json();
      if (result.success) {
        alert('Admin deleted successfully!');
        loadAdmins();
      } else {
        alert(result.message || 'Failed to delete admin');
      }
    } catch (error) {
      console.error('Error deleting admin:', error);
      alert('Error deleting admin');
    }
  };

  if (!user || user.role !== 'super_admin') {
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
        <h1>Manage Admins</h1>
        <p>Super Admin only - Add, remove, and manage admin accounts</p>

        <button 
          className="btn-primary"
          onClick={() => setShowCreateForm(!showCreateForm)}
          style={{ marginBottom: '20px' }}
        >
          {showCreateForm ? 'Cancel' : '+ Create New Admin'}
        </button>

        {showCreateForm && (
          <div className="create-form">
            <h3>Create New Admin</h3>
            <form onSubmit={handleCreateAdmin}>
              <div className="form-group">
                <label>Username *</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  required
                  minLength="3"
                />
              </div>
              <div className="form-group">
                <label>Email (optional)</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Password *</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                  minLength="8"
                />
              </div>
              <button type="submit" className="btn-primary">Create Admin</button>
            </form>
          </div>
        )}

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="admins-list">
            <h3>Current Admins ({admins.length})</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map(admin => (
                  <tr key={admin._id}>
                    <td>{admin.username}</td>
                    <td>{admin.email || 'N/A'}</td>
                    <td>{new Date(admin.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button 
                        className="btn-danger"
                        onClick={() => handleDeleteAdmin(admin._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

export default ManageAdminsPage;
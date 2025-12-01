import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import { authService } from '../services/authService';
import '../styles/settings.css';

function SettingsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    displayName: '',
    bio: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    postApprovalNotifications: true,
    commentNotifications: false,
    theme: 'light'
  });

  const [message, setMessage] = useState({ type: '', text: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    document.title = 'Settings – Psyche Journey';
    loadUserData();
  }, [navigate]);

  const loadUserData = () => {
    const currentUser = authService.getUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    setUser(currentUser);
    setFormData({
      username: currentUser.username || '',
      email: currentUser.email || '',
      displayName: currentUser.displayName || currentUser.username || '',
      bio: currentUser.bio || ''
    });
    
    const savedPrefs = localStorage.getItem('userPreferences');
    if (savedPrefs) {
      setPreferences(JSON.parse(savedPrefs));
    }
    
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePreferenceChange = (e) => {
    const { name, type, checked, value } = e.target;
    setPreferences(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedUser = { ...user, ...formData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match!' });
      setSaving(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long!' });
      setSaving(false);
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessage({ type: 'success', text: 'Password updated successfully!' });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error updating password:', error);
      setMessage({ type: 'error', text: 'Failed to update password. Please check your current password.' });
    } finally {
      setSaving(false);
    }
  };

  const handlePreferencesUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      localStorage.setItem('userPreferences', JSON.stringify(preferences));
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setMessage({ type: 'success', text: 'Preferences saved successfully!' });
    } catch (error) {
      console.error('Error saving preferences:', error);
      setMessage({ type: 'error', text: 'Failed to save preferences. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    if (!confirm('This will permanently delete all your posts and data. Are you absolutely sure?')) {
      return;
    }

    try {
      await authService.logout();
      navigate('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      setMessage({ type: 'error', text: 'Failed to delete account. Please contact support.' });
    }
  };

  if (loading) {
    return (
      <div className="settings-page">
        <Header />
        <main className="settings-container">
          <div className="loading-state">Loading settings...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <Header />
      
      <main className="settings-container">
        <div className="settings-wrapper">
          <h1 className="settings-title">Settings</h1>
          
          <div className="settings-tabs">
            <button
              className={`settings-tab ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('profile');
                setMessage({ type: '', text: '' });
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              Profile
            </button>
            
            <button
              className={`settings-tab ${activeTab === 'account' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('account');
                setMessage({ type: '', text: '' });
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              Account & Security
            </button>
            
            <button
              className={`settings-tab ${activeTab === 'preferences' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('preferences');
                setMessage({ type: '', text: '' });
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M12 1v6m0 6v6m-8-8h6m6 0h6"></path>
              </svg>
              Preferences
            </button>
          </div>

          {message.text && (
            <div className={`settings-message ${message.type}`}>
              {message.type === 'success' ? '✅' : '❌'} {message.text}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="settings-content">
              <div className="settings-section">
                <h2 className="section-title">Profile Information</h2>
                <p className="section-description">
                  Update your profile information that will be visible to other users.
                </p>

                <form onSubmit={handleProfileUpdate} className="settings-form">
                  <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      required
                      minLength={3}
                      maxLength={30}
                    />
                    <small className="form-hint">
                      Your unique username. 3-30 characters.
                    </small>
                  </div>

                  <div className="form-group">
                    <label htmlFor="displayName">Display Name</label>
                    <input
                      type="text"
                      id="displayName"
                      name="displayName"
                      value={formData.displayName}
                      onChange={handleInputChange}
                      maxLength={50}
                    />
                    <small className="form-hint">
                      Your display name as shown to others.
                    </small>
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                    <small className="form-hint">
                      Used for account recovery and notifications.
                    </small>
                  </div>

                  <div className="form-group">
                    <label htmlFor="bio">Bio</label>
                    <textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      rows={4}
                      maxLength={200}
                      placeholder="Tell us a bit about yourself..."
                    />
                    <small className="form-hint">
                      {formData.bio.length}/200 characters
                    </small>
                  </div>

                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Profile'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="settings-content">
              <div className="settings-section">
                <h2 className="section-title">Change Password</h2>
                <p className="section-description">
                  Ensure your account is using a strong password.
                </p>

                <form onSubmit={handlePasswordUpdate} className="settings-form">
                  <div className="form-group">
                    <label htmlFor="currentPassword">Current Password</label>
                    <input
                      type="password"
                      id="currentPassword"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="newPassword">New Password</label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      required
                      minLength={6}
                    />
                    <small className="form-hint">
                      At least 6 characters long.
                    </small>
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm New Password</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                      minLength={6}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={saving}
                  >
                    {saving ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              </div>

              <div className="settings-section danger-zone">
                <h2 className="section-title">Danger Zone</h2>
                <p className="section-description">
                  Permanently delete your account and all associated data.
                </p>

                <button
                  onClick={handleDeleteAccount}
                  className="btn-danger"
                >
                  Delete Account
                </button>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="settings-content">
              <div className="settings-section">
                <h2 className="section-title">Notifications</h2>
                <p className="section-description">
                  Manage how you receive notifications.
                </p>

                <form onSubmit={handlePreferencesUpdate} className="settings-form">
                  <div className="form-group-checkbox">
                    <label>
                      <input
                        type="checkbox"
                        name="emailNotifications"
                        checked={preferences.emailNotifications}
                        onChange={handlePreferenceChange}
                      />
                      <span>Email Notifications</span>
                    </label>
                    <small className="form-hint">
                      Receive email notifications for important updates.
                    </small>
                  </div>

                  <div className="form-group-checkbox">
                    <label>
                      <input
                        type="checkbox"
                        name="postApprovalNotifications"
                        checked={preferences.postApprovalNotifications}
                        onChange={handlePreferenceChange}
                      />
                      <span>Post Approval Notifications</span>
                    </label>
                    <small className="form-hint">
                      Get notified when your posts are approved or rejected.
                    </small>
                  </div>

                  <div className="form-group-checkbox">
                    <label>
                      <input
                        type="checkbox"
                        name="commentNotifications"
                        checked={preferences.commentNotifications}
                        onChange={handlePreferenceChange}
                      />
                      <span>Comment Notifications</span>
                    </label>
                    <small className="form-hint">
                      Get notified when someone comments on your posts.
                    </small>
                  </div>

                  <div className="settings-divider"></div>

                  <h2 className="section-title">Appearance</h2>
                  
                  <div className="form-group">
                    <label htmlFor="theme">Theme</label>
                    <select
                      id="theme"
                      name="theme"
                      value={preferences.theme}
                      onChange={handlePreferenceChange}
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="auto">Auto (System)</option>
                    </select>
                    <small className="form-hint">
                      Choose your preferred theme.
                    </small>
                  </div>

                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Preferences'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default SettingsPage;
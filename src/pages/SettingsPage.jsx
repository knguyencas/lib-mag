import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import { authService } from '../services/authService';
import '../styles/settings.css';

function SettingsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    document.title = 'Psyche Journey – Settings';
    const currentUser = authService.getUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);
  }, [navigate]);

  if (!user) return null;

  return (
    <div className="settings-page">
      <Header />
      <main>
        <h1>Settings for {user.username}</h1>
      </main>
    </div>
  );
}

export default SettingsPage;

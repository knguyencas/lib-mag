import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { perspectiveService } from '../services/perspectiveService';
import { authService } from '../services/authService';
import Header from '../components/layout/Header';

function CreatePerspectivePostPage() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [genres, setGenres] = useState([]);

  const [formData, setFormData] = useState({
    topic: '',
    content: '',
    primary_genre: 'Psychology',
    tags: ''
  });

  useEffect(() => {
    const loggedIn = authService.isAuthenticated();
    if (!loggedIn) navigate('/login');
    setIsLoggedIn(loggedIn);

    perspectiveService.getGenres().then(setGenres);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const postData = {
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim())
    };

    await perspectiveService.createPost(postData);
    navigate('/perspective');
  };

  if (!isLoggedIn) return null;

  return (
    <div>
      <Header />
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Topic"
          value={formData.topic}
          onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
        />

        <textarea
          placeholder="Content"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
        />

        <select
          value={formData.primary_genre}
          onChange={(e) => setFormData({ ...formData, primary_genre: e.target.value })}
        >
          {genres.map((g) => (
            <option key={g}>{g}</option>
          ))}
        </select>

        <button type="submit">Create</button>
      </form>
    </div>
  );
}

export default CreatePerspectivePostPage;
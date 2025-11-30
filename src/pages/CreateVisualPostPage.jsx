import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import '../styles/create-visual-post.css';

function CreateVisualPostPage() {
  const navigate = useNavigate();
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    document.title = 'Create Visual Post – Psyche Journey';
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="create-visual-post-page">
      <Header />
      <main className="create-page">
        <h1>Create Visual Post</h1>
        <input type="file" accept="image/*" onChange={handleImageChange} />
        {imagePreview && <img src={imagePreview} alt="Preview" style={{maxWidth: '400px'}} />}
      </main>
    </div>
  );
}

export default CreateVisualPostPage;

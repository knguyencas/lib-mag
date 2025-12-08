import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import '../styles/admin-add-book.css';
import '../styles/admin-page.css';

const API_BASE_URL = import.meta.env.VITE_API_URL;
const API_BASE = `${API_BASE_URL}/admin`;

function EditBookPage() {
  const navigate = useNavigate();
  const { bookId } = useParams();
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  
  const [book, setBook] = useState(null);
  const [form, setForm] = useState({
    title: '',
    author: '',
    author_id: '',
    publisher: '',
    year: '',
    language: 'en',
    pageCount: '',
    punchline: '',
    blurb: '',
    isbn: '',
    status: 'draft',
    categories: [],
    tags: []
  });

  const [charPunchline, setCharPunchline] = useState(0);
  const [charBlurb, setCharBlurb] = useState(0);

  const [authorQuery, setAuthorQuery] = useState('');
  const [authorOptions, setAuthorOptions] = useState([]);
  const [showAuthorDropdown, setShowAuthorDropdown] = useState(false);

  const [categoryQuery, setCategoryQuery] = useState('');
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const [tagQuery, setTagQuery] = useState('');
  const [tagOptions, setTagOptions] = useState([]);
  const [showTagDropdown, setShowTagDropdown] = useState(false);

  const [newCoverFile, setNewCoverFile] = useState(null);
  const [newEpubFile, setNewEpubFile] = useState(null);

  useEffect(() => {
    document.title = 'Edit Book | Psyche Journey';
    
    const currentUser = authService.getUser();
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'super_admin')) {
      navigate('/');
      return;
    }
    setUser(currentUser);
    
    loadBook();
  }, [navigate, bookId]);

  const loadBook = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/books/manage/${bookId}`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      });

      const result = await response.json();
      if (result.success) {
        const bookData = result.data;
        setBook(bookData);
        
        setForm({
          title: bookData.title || '',
          author: bookData.author || '',
          author_id: bookData.author_id || '',
          publisher: bookData.publisher || '',
          year: bookData.year || '',
          language: bookData.language || 'en',
          pageCount: bookData.pageCount || '',
          punchline: bookData.punchline || '',
          blurb: bookData.blurb || '',
          isbn: bookData.isbn || '',
          status: bookData.status || 'draft',
          categories: bookData.categories || [],
          tags: bookData.tags || []
        });
        
        setAuthorQuery(bookData.author || '');
        
        setCharPunchline(bookData.punchline?.length || 0);
        setCharBlurb(bookData.blurb?.length || 0);
      } else {
        setMessage({ type: 'error', text: result.message || 'Book not found' });
      }
    } catch (error) {
      console.error('Error loading book:', error);
      setMessage({ type: 'error', text: 'Failed to load book' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authorQuery || authorQuery.trim().length < 1) {
      setAuthorOptions([]);
      setShowAuthorDropdown(false);
      return;
    }
    
    const timeout = setTimeout(async () => {
      try {
        const url = `${API_BASE}/meta/authors/search?q=${encodeURIComponent(authorQuery.trim())}`;
        console.log('[Author] Calling API:', url);
        
        const res = await fetch(url, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authService.getToken()}`
          }
        });
        
        console.log('[Author] Response status:', res.status);
        
        if (!res.ok) {
          console.error('[Author] API failed:', res.status);
          setAuthorOptions([]);
          setShowAuthorDropdown(false);
          return;
        }
        
        const data = await res.json();
        console.log('[Author] API response:', data);
        console.log('[Author] Authors found:', data.data);
        
        setAuthorOptions(data.data || []);
        setShowAuthorDropdown((data.data || []).length > 0);
      } catch (err) {
        console.error('[Author] Error:', err);
        setAuthorOptions([]);
        setShowAuthorDropdown(false);
      }
    }, 150);

    return () => clearTimeout(timeout);
  }, [authorQuery]);

  const handleAuthorInput = (e) => {
    const value = e.target.value;
    setAuthorQuery(value);
    setForm(prev => ({
      ...prev,
      author: value,
      author_id: ''
    }));
    setShowAuthorDropdown(value.trim().length > 0);
  };

  const selectAuthor = (author) => {
    setForm(prev => ({
      ...prev,
      author: author.name,
      author_id: author.author_id
    }));
    setAuthorQuery(author.name);
    setAuthorOptions([]);
    setShowAuthorDropdown(false);
  };

  const handleCreateNewAuthor = () => {
    setForm(prev => ({
      ...prev,
      author: authorQuery.trim(),
      author_id: ''
    }));
    setAuthorOptions([]);
    setShowAuthorDropdown(false);
  };

  useEffect(() => {
    if (!categoryQuery || categoryQuery.trim().length < 1) {
      setCategoryOptions([]);
      setShowCategoryDropdown(false);
      return;
    }
    
    const timeout = setTimeout(async () => {
      try {
        const url = `${API_BASE}/meta/categories/search?q=${encodeURIComponent(categoryQuery.trim())}`;
        console.log('[Category] Calling API:', url);
        
        const res = await fetch(url, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authService.getToken()}`
          }
        });
        
        console.log('[Category] Response status:', res.status);
        
        if (!res.ok) {
          console.error('[Category] API failed:', res.status);
          setCategoryOptions([]);
          setShowCategoryDropdown(false);
          return;
        }
        
        const data = await res.json();
        console.log('[Category] API response:', data);
        console.log('[Category] Categories found:', data.data);
        
        setCategoryOptions(data.data || []);
        setShowCategoryDropdown((data.data || []).length > 0);
      } catch (err) {
        console.error('[Category] Error:', err);
        setCategoryOptions([]);
        setShowCategoryDropdown(false);
      }
    }, 150);

    return () => clearTimeout(timeout);
  }, [categoryQuery]);

  const handleCategoryInput = (e) => {
    const value = e.target.value;
    setCategoryQuery(value);
    setShowCategoryDropdown(value.trim().length > 0);
  };

  const selectCategory = (category) => {
    const clean = category.name.trim();
    if (!clean) return;
    
    if (!form.categories.includes(clean)) {
      setForm(prev => ({
        ...prev,
        categories: [...prev.categories, clean]
      }));
    }
    
    setCategoryQuery('');
    setCategoryOptions([]);
    setShowCategoryDropdown(false);
  };

  const addCategory = (name) => {
    const clean = name.trim();
    if (!clean) return;
    
    if (!form.categories.includes(clean)) {
      setForm(prev => ({
        ...prev,
        categories: [...prev.categories, clean]
      }));
    }
    
    setCategoryQuery('');
    setCategoryOptions([]);
    setShowCategoryDropdown(false);
  };

  const removeCategory = (name) => {
    setForm(prev => ({
      ...prev,
      categories: prev.categories.filter(c => c !== name)
    }));
  };

  useEffect(() => {
    if (!tagQuery || tagQuery.trim().length < 1) {
      setTagOptions([]);
      setShowTagDropdown(false);
      return;
    }
    
    const timeout = setTimeout(async () => {
      try {
        const url = `${API_BASE}/meta/tags/search?q=${encodeURIComponent(tagQuery.trim())}`;
        console.log('[Tag] Calling API:', url);
        
        const res = await fetch(url, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authService.getToken()}`
          }
        });
        
        console.log('[Tag] Response status:', res.status);
        
        if (!res.ok) {
          console.error('[Tag] API failed:', res.status);
          setTagOptions([]);
          setShowTagDropdown(false);
          return;
        }
        
        const data = await res.json();
        console.log('[Tag] API response:', data);
        console.log('[Tag] Tags found:', data.data);
        
        setTagOptions(data.data || []);
        setShowTagDropdown((data.data || []).length > 0);
      } catch (err) {
        console.error('[Tag] Error:', err);
        setTagOptions([]);
        setShowTagDropdown(false);
      }
    }, 150);

    return () => clearTimeout(timeout);
  }, [tagQuery]);

  const handleTagInput = (e) => {
    const value = e.target.value;
    setTagQuery(value);
    setShowTagDropdown(value.trim().length > 0);
  };

  const selectTag = (tag) => {
    const clean = (tag.name || tag).trim().toLowerCase();
    if (!clean) return;
    
    if (!form.tags.includes(clean)) {
      setForm(prev => ({
        ...prev,
        tags: [...prev.tags, clean]
      }));
    }
    
    setTagQuery('');
    setTagOptions([]);
    setShowTagDropdown(false);
  };

  const addTag = (name) => {
    const clean = name.trim().toLowerCase();
    if (!clean) return;
    
    if (!form.tags.includes(clean)) {
      setForm(prev => ({
        ...prev,
        tags: [...prev.tags, clean]
      }));
    }
    
    setTagQuery('');
    setTagOptions([]);
    setShowTagDropdown(false);
  };

  const removeTag = (name) => {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== name)
    }));
  };

  const handleNewCoverChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setNewCoverFile(file);
  };

  const handleNewEpubChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setNewEpubFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.title.trim() || !form.author.trim() || !form.publisher.trim()) {
      setMessage({ type: 'error', text: 'Title, Author, and Publisher are required' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const formData = new FormData();
      
      formData.append('title', form.title.trim());
      formData.append('author', form.author.trim());
      formData.append('author_id', form.author_id.trim());
      formData.append('publisher', form.publisher.trim());
      formData.append('year', form.year);
      formData.append('language', form.language);
      formData.append('pageCount', form.pageCount);
      formData.append('punchline', form.punchline.trim());
      formData.append('blurb', form.blurb.trim());
      if (form.isbn) formData.append('isbn', form.isbn.trim());
      formData.append('status', form.status);
      formData.append('categories', JSON.stringify(form.categories));
      formData.append('tags', JSON.stringify(form.tags));

      if (newCoverFile) formData.append('cover', newCoverFile);
      if (newEpubFile) formData.append('ebook', newEpubFile);

      const response = await fetch(`${API_BASE}/books/manage/${bookId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        },
        body: formData
      });

      const result = await response.json();
      
      if (result.success) {
        setMessage({ type: 'success', text: 'Book updated successfully!' });
        alert('Book updated successfully!');
        setTimeout(() => navigate('/admin/manage-books'), 1500);
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to update book' });
      }
    } catch (error) {
      console.error('Error updating book:', error);
      setMessage({ type: 'error', text: 'An error occurred while updating the book' });
    } finally {
      setSaving(false);
    }
  };

  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    return null;
  }

  if (loading) {
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
        <main className="admin-page" style={{ display: 'block', padding: '32px 80px 40px' }}>
          <p>Loading book...</p>
        </main>
      </div>
    );
  }

  if (!book) {
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
        <main className="admin-page" style={{ display: 'block', padding: '32px 80px 40px' }}>
          <h1>Book Not Found</h1>
          <button className="primary-button" onClick={() => navigate('/admin/manage-books')}>
            Back to Manage Books
          </button>
        </main>
      </div>
    );
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
      
      <main className="admin-page" style={{ display: 'block', padding: '32px 80px 40px' }}>
        <section className="admin-content" style={{ maxWidth: '100%' }}>
          <div style={{ marginBottom: '24px' }}>
            <button 
              className="ghost-button" 
              onClick={() => navigate('/admin/manage-books')}
              style={{ marginBottom: '16px' }}
            >
              ← Back to Manage Books
            </button>
            
            <div className="page-header">
              <div>
                <h2 className="page-title">Edit Book</h2>
                <p className="page-subtitle">Update book information, metadata, and files</p>
              </div>
            </div>
          </div>

          {message && (
            <div
              className={`message ${
                message.type === 'success' ? 'success' : 'error'
              }`}
            >
              {message.text}
            </div>
          )}

          <form className="admin-form" onSubmit={handleSubmit}>
            <section className="form-section">
              <h3 className="section-title">Basic information</h3>
              <div className="form-grid">
                <div className="form-field full-width">
                  <label htmlFor="bookId">Book ID</label>
                  <input 
                    id="bookId"
                    type="text" 
                    value={book.book_id} 
                    disabled 
                    style={{ background: '#f5f5f5', cursor: 'not-allowed' }}
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="title">
                    Title <span className="required">*</span>
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({...form, title: e.target.value})}
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="author">
                    Author <span className="required">*</span>
                  </label>
                  <div className="autocomplete-container">
                    <input
                      id="author"
                      className="autocomplete-input"
                      type="text"
                      autoComplete="off"
                      value={authorQuery}
                      onChange={handleAuthorInput}
                      required
                      placeholder="Type author name..."
                    />
                    {showAuthorDropdown && authorOptions.length > 0 && (
                      <div className="autocomplete-dropdown">
                        {authorOptions.map((opt) => (
                          <div
                            key={opt.author_id}
                            className="autocomplete-item"
                            onClick={() => selectAuthor(opt)}
                          >
                            <strong>{opt.name}</strong>
                            <div className="item-meta">
                              author_id: {opt.author_id}
                            </div>
                          </div>
                        ))}
                        {!authorOptions.some(
                          (opt) =>
                            opt.name.toLowerCase() ===
                            authorQuery.trim().toLowerCase()
                        ) && (
                          <div
                            className="autocomplete-item add-new"
                            onClick={handleCreateNewAuthor}
                          >
                            Create new author &quot;{authorQuery.trim()}&quot;
                          </div>
                        )}
                      </div>
                    )}
                    {showAuthorDropdown && authorOptions.length === 0 && authorQuery && (
                      <div className="autocomplete-dropdown">
                        <div
                          className="autocomplete-item add-new"
                          onClick={handleCreateNewAuthor}
                        >
                          Create new author &quot;{authorQuery.trim()}&quot;
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-field">
                  <label htmlFor="publisher">
                    Publisher <span className="required">*</span>
                  </label>
                  <input
                    id="publisher"
                    type="text"
                    value={form.publisher}
                    onChange={(e) => setForm({...form, publisher: e.target.value})}
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="year">
                    Publication year <span className="required">*</span>
                  </label>
                  <input
                    id="year"
                    type="number"
                    value={form.year}
                    onChange={(e) => setForm({...form, year: e.target.value})}
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="pageCount">
                    Page count <span className="required">*</span>
                  </label>
                  <input
                    id="pageCount"
                    type="number"
                    value={form.pageCount}
                    onChange={(e) => setForm({...form, pageCount: e.target.value})}
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="language">
                    Language <span className="required">*</span>
                  </label>
                  <select 
                    id="language"
                    value={form.language} 
                    onChange={(e) => setForm({...form, language: e.target.value})}
                  >
                    <option value="en">English</option>
                    <option value="vi">Vietnamese</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="es">Spanish</option>
                  </select>
                </div>

                <div className="form-field">
                  <label htmlFor="isbn">ISBN (optional)</label>
                  <input
                    id="isbn"
                    type="text"
                    value={form.isbn}
                    onChange={(e) => setForm({...form, isbn: e.target.value})}
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="status">
                    Status <span className="required">*</span>
                  </label>
                  <select 
                    id="status"
                    value={form.status} 
                    onChange={(e) => setForm({...form, status: e.target.value})}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
            </section>

            <section className="form-section">
              <h3 className="section-title">Blurb &amp; punchline</h3>
              <div className="form-grid">
                <div className="form-field full-width">
                  <label htmlFor="punchline">
                    Punchline (max. 200 chars){' '}
                    <span className="required">*</span>
                  </label>
                  <textarea
                    id="punchline"
                    rows="2"
                    value={form.punchline}
                    onChange={(e) => {
                      setForm({...form, punchline: e.target.value});
                      setCharPunchline(e.target.value.length);
                    }}
                    maxLength={200}
                    required
                  />
                  <div className="char-counter">
                    {charPunchline}/200 characters
                  </div>
                </div>

                <div className="form-field full-width">
                  <label htmlFor="blurb">
                    Blurb / description (max. 2000 chars){' '}
                    <span className="required">*</span>
                  </label>
                  <textarea
                    id="blurb"
                    rows="6"
                    value={form.blurb}
                    onChange={(e) => {
                      setForm({...form, blurb: e.target.value});
                      setCharBlurb(e.target.value.length);
                    }}
                    maxLength={2000}
                    required
                  />
                  <div className="char-counter">
                    {charBlurb}/2000 characters
                  </div>
                </div>
              </div>
            </section>

            <section className="form-section">
              <h3 className="section-title">Categories &amp; tags</h3>
              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="categories">
                    Categories <span className="required">*</span>
                  </label>
                  <div className="autocomplete-container">
                    <input
                      id="categories"
                      className="autocomplete-input"
                      type="text"
                      autoComplete="off"
                      value={categoryQuery}
                      onChange={handleCategoryInput}
                      placeholder="Type to search or create category..."
                    />
                    {showCategoryDropdown && categoryOptions.length > 0 && (
                      <div className="autocomplete-dropdown">
                        {categoryOptions.map((opt) => (
                          <div
                            key={opt.category_id || opt.name}
                            className="autocomplete-item"
                            onClick={() => selectCategory(opt)}
                          >
                            <strong>{opt.name}</strong>
                            {opt.primary_genre && (
                              <div className="item-meta">
                                primary genre: {opt.primary_genre}
                              </div>
                            )}
                          </div>
                        ))}
                        <div
                          className="autocomplete-item add-new"
                          onClick={() => addCategory(categoryQuery)}
                        >
                          Create / add category &quot;
                          {categoryQuery.trim()}&quot;
                        </div>
                      </div>
                    )}
                    {showCategoryDropdown && categoryOptions.length === 0 && categoryQuery && (
                      <div className="autocomplete-dropdown">
                        <div
                          className="autocomplete-item add-new"
                          onClick={() => addCategory(categoryQuery)}
                        >
                          Create / add category &quot;
                          {categoryQuery.trim()}&quot;
                        </div>
                      </div>
                    )}
                  </div>

                  {form.categories.length > 0 && (
                    <div className="selected-items">
                      <strong>Selected categories</strong>
                      <div className="badge-list">
                        {form.categories.map((cat) => (
                          <span key={cat} className="badge badge-blue">
                            {cat}
                            <button
                              type="button"
                              onClick={() => removeCategory(cat)}
                            >
                              &times;
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="form-field">
                  <label htmlFor="tags">Tags</label>
                  <div className="autocomplete-container">
                    <input
                      id="tags"
                      className="autocomplete-input"
                      type="text"
                      autoComplete="off"
                      value={tagQuery}
                      onChange={handleTagInput}
                      placeholder="Type to search or create tag..."
                    />
                    {showTagDropdown && tagOptions.length > 0 && (
                      <div className="autocomplete-dropdown">
                        {tagOptions.map((opt) => (
                          <div
                            key={opt.tag_id || opt.name}
                            className="autocomplete-item"
                            onClick={() => selectTag(opt)}
                          >
                            <strong>{opt.name || opt}</strong>
                          </div>
                        ))}
                        <div
                          className="autocomplete-item add-new"
                          onClick={() => addTag(tagQuery)}
                        >
                          Create / add tag &quot;{tagQuery.trim()}&quot;
                        </div>
                      </div>
                    )}
                    {showTagDropdown && tagOptions.length === 0 && tagQuery && (
                      <div className="autocomplete-dropdown">
                        <div
                          className="autocomplete-item add-new"
                          onClick={() => addTag(tagQuery)}
                        >
                          Create / add tag &quot;{tagQuery.trim()}&quot;
                        </div>
                      </div>
                    )}
                  </div>

                  {form.tags.length > 0 && (
                    <div className="selected-items">
                      <strong>Selected tags</strong>
                      <div className="badge-list">
                        {form.tags.map((tag) => (
                          <span key={tag} className="badge badge-blue">
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                            >
                              &times;
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section className="form-section">
              <h3 className="section-title">Files</h3>
              <div className="form-grid">
                <div className="form-field">
                  <label>Current Cover Image</label>
                  {book.coverImage_cloud?.url && (
                    <img 
                      src={book.coverImage_cloud.url} 
                      alt="Current cover" 
                      style={{ 
                        maxWidth: '200px', 
                        borderRadius: '8px', 
                        marginTop: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}
                    />
                  )}
                </div>

                <div className="form-field">
                  <label>Upload New Cover (optional)</label>
                  {newCoverFile && (
                    <div className="file-preview">
                      <div className="file-preview-icon">📘</div>
                      <div className="file-preview-info">
                        <div className="file-preview-name">
                          {newCoverFile.name}
                        </div>
                        <div className="file-preview-size">
                          {(newCoverFile.size / 1024).toFixed(1)} KB
                        </div>
                      </div>
                      <button
                        type="button"
                        className="file-preview-remove"
                        onClick={() => setNewCoverFile(null)}
                      >
                        &times;
                      </button>
                    </div>
                  )}
                  <label
                    htmlFor="newCoverUpload"
                    className="file-upload-area"
                  >
                    <div className="file-upload-icon">⬆️</div>
                    <div className="file-upload-text">
                      Click to upload new cover image
                    </div>
                    <div className="file-upload-hint">
                      JPG / PNG, recommended vertical ratio 2:3
                    </div>
                    <input
                      id="newCoverUpload"
                      type="file"
                      accept="image/*"
                      className="file-upload-input"
                      onChange={handleNewCoverChange}
                    />
                  </label>
                </div>

                <div className="form-field">
                  <label>Upload New EPUB (optional)</label>
                  {newEpubFile && (
                    <div className="file-preview">
                      <div className="file-preview-icon">📖</div>
                      <div className="file-preview-info">
                        <div className="file-preview-name">
                          {newEpubFile.name}
                        </div>
                        <div className="file-preview-size">
                          {(newEpubFile.size / 1024).toFixed(1)} KB
                        </div>
                      </div>
                      <button
                        type="button"
                        className="file-preview-remove"
                        onClick={() => setNewEpubFile(null)}
                      >
                        &times;
                      </button>
                    </div>
                  )}
                  <label htmlFor="newEpubUpload" className="file-upload-area">
                    <div className="file-upload-icon">⬆️</div>
                    <div className="file-upload-text">
                      Click to upload new EPUB file
                    </div>
                    <div className="file-upload-hint">
                      .epub only – will be parsed after publishing
                    </div>
                    <input
                      id="newEpubUpload"
                      type="file"
                      accept=".epub"
                      className="file-upload-input"
                      onChange={handleNewEpubChange}
                    />
                  </label>
                </div>
              </div>
            </section>

            <section className="form-actions">
              <button
                type="button"
                className="ghost-button"
                onClick={() => navigate('/admin/manage-books')}
                disabled={saving}
              >
                Cancel
              </button>

              <div className="action-buttons">
                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </section>
          </form>
        </section>
      </main>

      {saving && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            background: 'white',
            padding: '40px 60px',
            borderRadius: '16px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              border: '4px solid #f3f4f6',
              borderTopColor: '#111827',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 20px'
            }} />
            <p style={{ margin: 0, color: '#6b7280' }}>Updating book, please wait…</p>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default EditBookPage;
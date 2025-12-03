import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/authService';
import '../styles/admin-add-book.css';

const LANG_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'vi', label: 'Vietnamese' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'es', label: 'Spanish' },
  { value: 'it', label: 'Italian' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'ru', label: 'Russian' },
  { value: 'zh', label: 'Chinese' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' }
];

const API_BASE = 'http://localhost:3000/api/admin';

function AdminAddBookPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const [form, setForm] = useState({
    title: '',
    authorName: '',
    authorId: '',
    publisher: '',
    year: '',
    language: 'en',
    pageCount: '',
    punchline: '',
    blurb: '',
    isbn: '',
    categories: [],
    tags: []
  });

  const [coverFile, setCoverFile] = useState(null);
  const [epubFile, setEpubFile] = useState(null);

  const [authorQuery, setAuthorQuery] = useState('');
  const [authorOptions, setAuthorOptions] = useState([]);
  const [showAuthorDropdown, setShowAuthorDropdown] = useState(false);

  const [categoryQuery, setCategoryQuery] = useState('');
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const [tagQuery, setTagQuery] = useState('');
  const [tagOptions, setTagOptions] = useState([]);
  const [showTagDropdown, setShowTagDropdown] = useState(false);

  const [charPunchline, setCharPunchline] = useState(0);
  const [charBlurb, setCharBlurb] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [confirmStatus, setConfirmStatus] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    document.title = 'Admin - Add New Book | Psyche Journey';

    const currentUser = authService.getUser();
    const allowedRoles = ['admin', 'super_admin'];
    if (!currentUser || !allowedRoles.includes(currentUser.role)) {
      navigate('/');
      return;
    }
    setUser(currentUser);
  }, [navigate]);

  useEffect(() => {
    if (!authorQuery || authorQuery.trim().length < 1) {
      setAuthorOptions([]);
      return;
    }
    
    const timeout = setTimeout(async () => {
      try {
        const url = `${API_BASE}/meta/authors/search?q=${encodeURIComponent(authorQuery.trim())}`;
        console.log('Calling API:', url);
        
        const res = await fetch(url, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authService.getToken()}`
          }
        });
        
        console.log('Response status:', res.status);
        
        if (!res.ok) {
          console.error('API failed:', res.status);
          setAuthorOptions([]);
          return;
        }
        
        const data = await res.json();
        console.log('API response:', data);
        console.log('Authors found:', data.data);
        
        setAuthorOptions(data.data || []);
      } catch (err) {
        console.error('Error:', err);
        setAuthorOptions([]);
      }
    }, 150);

    return () => clearTimeout(timeout);
  }, [authorQuery]);

  useEffect(() => {
    if (!categoryQuery || categoryQuery.trim().length < 1) {
      setCategoryOptions([]);
      return;
    }
    
    const timeout = setTimeout(async () => {
      try {
        const url = `http://localhost:3000/api/admin/meta/categories/search?q=${encodeURIComponent(categoryQuery.trim())}`;
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
          return;
        }
        
        const data = await res.json();
        console.log('[Category] API response:', data);
        console.log('[Category] Categories found:', data.data);
        
        setCategoryOptions(data.data || []);
      } catch (err) {
        console.error('[Category] Error:', err);
        setCategoryOptions([]);
      }
    }, 150);

    return () => clearTimeout(timeout);
  }, [categoryQuery]);

  useEffect(() => {
    if (!tagQuery || tagQuery.trim().length < 1) {
      setTagOptions([]);
      return;
    }
    
    const timeout = setTimeout(async () => {
      try {
        const url = `http://localhost:3000/api/admin/meta/tags/search?q=${encodeURIComponent(tagQuery.trim())}`;
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
          return;
        }
        
        const data = await res.json();
        console.log('[Tag] API response:', data);
        console.log('[Tag] Tags found:', data.data);
        
        setTagOptions(data.data || []);
      } catch (err) {
        console.error('[Tag] Error:', err);
        setTagOptions([]);
      }
    }, 150);

    return () => clearTimeout(timeout);
  }, [tagQuery]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === 'punchline') setCharPunchline(value.length);
    if (name === 'blurb') setCharBlurb(value.length);
  };

  const handleLanguageChange = (e) => {
    setForm((prev) => ({ ...prev, language: e.target.value }));
  };

  const handleAuthorInput = (e) => {
    const value = e.target.value;
    setAuthorQuery(value);
    setForm((prev) => ({ ...prev, authorName: value, authorId: '' }));
    setShowAuthorDropdown(value.trim().length > 0);
  };

  const handleSelectAuthor = (option) => {
    setForm((prev) => ({
      ...prev,
      authorName: option.name,
      authorId: option.author_id
    }));
    setAuthorQuery(option.name);
    setAuthorOptions([]);
    setShowAuthorDropdown(false);
  };

  const handleCreateNewAuthor = () => {
    setForm((prev) => ({
      ...prev,
      authorName: authorQuery.trim(),
      authorId: ''
    }));
    setAuthorOptions([]);
    setShowAuthorDropdown(false);
  };

  const handleCategoryInput = (e) => {
    const value = e.target.value;
    setCategoryQuery(value);
    setShowCategoryDropdown(value.trim().length > 0);
  };

  const addCategory = (name) => {
    const clean = name.trim();
    if (!clean) return;
    setForm((prev) => {
      if (prev.categories.includes(clean)) return prev;
      return { ...prev, categories: [...prev.categories, clean] };
    });
    setCategoryQuery('');
    setCategoryOptions([]);
    setShowCategoryDropdown(false);
  };

  const removeCategory = (name) => {
    setForm((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => c !== name)
    }));
  };

  const handleTagInput = (e) => {
    const value = e.target.value;
    setTagQuery(value);
    setShowTagDropdown(value.trim().length > 0);
  };

  const addTag = (name) => {
    const clean = name.trim().toLowerCase();
    if (!clean) return;
    setForm((prev) => {
      if (prev.tags.includes(clean)) return prev;
      return { ...prev, tags: [...prev.tags, clean] };
    });
    setTagQuery('');
    setTagOptions([]);
    setShowTagDropdown(false);
  };

  const removeTag = (name) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== name)
    }));
  };

  const handleCoverChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
  };

  const handleEpubChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEpubFile(file);
  };

  const handleReset = () => {
    setForm({
      title: '',
      authorName: '',
      authorId: '',
      publisher: '',
      year: '',
      language: 'en',
      pageCount: '',
      punchline: '',
      blurb: '',
      isbn: '',
      categories: [],
      tags: []
    });
    setCoverFile(null);
    setEpubFile(null);
    setAuthorQuery('');
    setCategoryQuery('');
    setTagQuery('');
    setAuthorOptions([]);
    setCategoryOptions([]);
    setTagOptions([]);
    setCharPunchline(0);
    setCharBlurb(0);
    setMessage(null);
  };

  const handlePreviewJson = () => {
    const preview = {
      ...form,
      status: confirmStatus || 'draft',
      categories: form.categories,
      tags: form.tags,
      hasCoverFile: !!coverFile,
      hasEpubFile: !!epubFile
    };
    console.log('Preview payload:', preview);
    alert('Payload is logged in console (F12) for preview.');
  };

  const openConfirm = (status) => {
    setConfirmStatus(status);
    setShowConfirmModal(true);
  };

  const closeConfirm = () => {
    setShowConfirmModal(false);
    setConfirmStatus(null);
  };

  const buildFormData = (status) => {
    const fd = new FormData();
    fd.append('title', form.title.trim());
    fd.append('author', form.authorName.trim());
    if (form.authorId) fd.append('author_id', form.authorId);
    fd.append('publisher', form.publisher.trim());
    fd.append('year', form.year);
    fd.append('language', form.language);
    fd.append('pageCount', form.pageCount);
    fd.append('punchline', form.punchline.trim());
    fd.append('blurb', form.blurb.trim());
    if (form.isbn) fd.append('isbn', form.isbn.trim());

    fd.append('status', status);

    fd.append('categories', JSON.stringify(form.categories));
    fd.append('tags', JSON.stringify(form.tags));

    console.log('[FormData] coverFile:', coverFile);
    console.log('[FormData] epubFile:', epubFile);

    if (coverFile) {
      fd.append('cover', coverFile);
      console.log('[FormData] Appended cover file:', coverFile.name);
    }
    if (epubFile) {
      fd.append('ebook', epubFile);
      console.log('[FormData] Appended ebook file:', epubFile.name);
    }

    console.log('[FormData] All entries:');
    for (let [key, value] of fd.entries()) {
      if (value instanceof File) {
        console.log(`  ${key}:`, value.name, `(${value.size} bytes)`);
      } else {
        console.log(`  ${key}:`, value);
      }
    }

    return fd;
  };

  const handleConfirmSubmit = async () => {
    if (!confirmStatus) return;

    setShowConfirmModal(false);
    setLoading(true);
    setMessage(null);

    try {
      const formData = buildFormData(confirmStatus);

      const headers = {};
      const token = authService.getToken?.();
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/books`, {
        method: 'POST',
        headers,
        body: formData
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        
        console.error('[Backend Error]:', {
          status: res.status,
          statusText: res.statusText,
          error: errJson
        });

        const msg = errJson?.message || errJson?.error || 'Failed to save book.';
        const details = errJson?.details || errJson?.errors || null;
        
        if (details) {
          console.error('[Validation Details]:', details);
        }

        throw new Error(msg);
      }

      setMessage({
        type: 'success',
        text:
          confirmStatus === 'draft'
            ? 'Book saved as draft successfully.'
            : 'Book created and published successfully.'
      });
      
      alert(
        confirmStatus === 'draft'
          ? 'Book saved as draft successfully!'
          : 'Book published successfully!'
      );
      
      setConfirmStatus(null);
      
      if (confirmStatus === 'published') {
        setTimeout(() => {
          const shouldReset = window.confirm(
            'Book published successfully! Do you want to reset the form to add another book?'
          );
          if (shouldReset) handleReset();
        }, 1000);
      }
    } catch (err) {
      console.error('[Submit Error]:', err);
      
      const errorMsg = err.message || 'Something went wrong while saving the book.';
      
      setMessage({
        type: 'error',
        text: errorMsg
      });
      
      alert('Error: ' + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) return null;

  return (
    <div className="admin-add-book-page">
      <header className="admin-header">
        <div className="admin-header-left">
          <h1 className="logo">PSYCHE JOURNEY</h1>
        </div>
        <nav className="top-nav">
          <a href="/">Home</a>
          <a href="/library">Library</a>
          <span className="divider">|</span>
          <span className="admin-label">Admin panel</span>
        </nav>
      </header>

      <main className="admin-page">
        <aside className="admin-sidebar">
          <h3 className="sidebar-title">Admin</h3>
          <ul className="sidebar-menu">
            <li className="sidebar-item active">Add new book</li>
            <li className="sidebar-item disabled">Manage books</li>
            <li className="sidebar-item disabled">Authors &amp; metadata</li>
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
                Fill in metadata, upload cover &amp; EPUB. Primary genre will be
                derived from categories in backend.
              </p>
            </div>
            <button
              type="button"
              className="ghost-button"
              onClick={handlePreviewJson}
            >
              Preview JSON
            </button>
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

          <form
            id="adminAddBookForm"
            className="admin-form"
            onSubmit={(e) => e.preventDefault()}
          >
            <section className="form-section">
              <h3 className="section-title">Basic information</h3>
              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="title">
                    Title <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    required
                    placeholder="The Archetypes and the Collective Unconscious"
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
                      placeholder="Type author name..."
                    />
                    {showAuthorDropdown && authorOptions.length > 0 && (
                      <div className="autocomplete-dropdown">
                        {authorOptions.map((opt) => (
                          <div
                            key={opt.author_id}
                            className="autocomplete-item"
                            onClick={() => handleSelectAuthor(opt)}
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
                    type="text"
                    id="publisher"
                    name="publisher"
                    value={form.publisher}
                    onChange={handleChange}
                    placeholder="Routledge"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="year">
                    Publication year <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    id="year"
                    name="year"
                    value={form.year}
                    onChange={handleChange}
                    placeholder="1959"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="pageCount">
                    Page count <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    id="pageCount"
                    name="pageCount"
                    min="1"
                    value={form.pageCount}
                    onChange={handleChange}
                    placeholder="400"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="language">
                    Language <span className="required">*</span>
                  </label>
                  <select
                    id="language"
                    name="language"
                    value={form.language}
                    onChange={handleLanguageChange}
                  >
                    {LANG_OPTIONS.map((l) => (
                      <option key={l.value} value={l.value}>
                        {l.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label htmlFor="isbn">ISBN (optional)</label>
                  <input
                    type="text"
                    id="isbn"
                    name="isbn"
                    value={form.isbn}
                    onChange={handleChange}
                    placeholder="978-0-00-000000-0"
                  />
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
                    name="punchline"
                    rows="2"
                    value={form.punchline}
                    onChange={handleChange}
                    maxLength={200}
                    placeholder="One-sentence hook / thesis of the book."
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
                    name="blurb"
                    rows="6"
                    value={form.blurb}
                    onChange={handleChange}
                    maxLength={2000}
                    placeholder="Write a short description for this book..."
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
                            onClick={() => addCategory(opt.name)}
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
                            onClick={() => addTag(opt.name || opt)}
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
                          <span key={tag} className="badge badge-gray">
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
                  <label>
                    Cover image <span className="required">*</span>
                  </label>
                  {coverFile && (
                    <div className="file-preview">
                      <div className="file-preview-icon">📘</div>
                      <div className="file-preview-info">
                        <div className="file-preview-name">
                          {coverFile.name}
                        </div>
                        <div className="file-preview-size">
                          {(coverFile.size / 1024).toFixed(1)} KB
                        </div>
                      </div>
                      <button
                        type="button"
                        className="file-preview-remove"
                        onClick={() => setCoverFile(null)}
                      >
                        &times;
                      </button>
                    </div>
                  )}
                  <label
                    htmlFor="coverUpload"
                    className="file-upload-area"
                  >
                    <div className="file-upload-icon">⬆️</div>
                    <div className="file-upload-text">
                      Click to upload cover image
                    </div>
                    <div className="file-upload-hint">
                      JPG / PNG, recommended vertical ratio 2:3
                    </div>
                    <input
                      id="coverUpload"
                      type="file"
                      accept="image/*"
                      className="file-upload-input"
                      onChange={handleCoverChange}
                    />
                  </label>
                </div>

                <div className="form-field">
                  <label>
                    EPUB file <span className="required">*</span>
                  </label>
                  {epubFile && (
                    <div className="file-preview">
                      <div className="file-preview-icon">📖</div>
                      <div className="file-preview-info">
                        <div className="file-preview-name">
                          {epubFile.name}
                        </div>
                        <div className="file-preview-size">
                          {(epubFile.size / 1024).toFixed(1)} KB
                        </div>
                      </div>
                      <button
                        type="button"
                        className="file-preview-remove"
                        onClick={() => setEpubFile(null)}
                      >
                        &times;
                      </button>
                    </div>
                  )}
                  <label htmlFor="epubUpload" className="file-upload-area">
                    <div className="file-upload-icon">⬆️</div>
                    <div className="file-upload-text">
                      Click to upload EPUB file
                    </div>
                    <div className="file-upload-hint">
                      .epub only – will be parsed after publishing
                    </div>
                    <input
                      id="epubUpload"
                      type="file"
                      accept=".epub"
                      className="file-upload-input"
                      onChange={handleEpubChange}
                    />
                  </label>
                </div>
              </div>
            </section>

            <section className="form-actions">
              <button
                type="button"
                className="btn-reset"
                onClick={handleReset}
              >
                Reset form
              </button>

              <div className="action-buttons">
                <button
                  type="button"
                  className="btn-draft"
                  onClick={() => openConfirm('draft')}
                  disabled={loading}
                >
                  Save as draft
                </button>
                <button
                  type="button"
                  className="btn-publish"
                  onClick={() => openConfirm('published')}
                  disabled={loading}
                >
                  Publish now
                </button>
              </div>
            </section>
          </form>
        </section>
      </main>

      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>
              {confirmStatus === 'draft'
                ? 'Save as draft?'
                : 'Publish this book?'}
            </h2>
            <p>
              {confirmStatus === 'draft'
                ? 'The book will be stored as a draft. It will not appear in the public library until you publish it.'
                : 'The book will be visible in the library once processing is completed.'}
            </p>
            <div className="modal-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={closeConfirm}
              >
                Cancel
              </button>
              {confirmStatus === 'draft' ? (
                <button
                  type="button"
                  className="btn-confirm-draft"
                  onClick={handleConfirmSubmit}
                >
                  Save draft
                </button>
              ) : (
                <button
                  type="button"
                  className="btn-confirm-publish"
                  onClick={handleConfirmSubmit}
                >
                  Publish
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner">
            <div className="loading-spinner-icon" />
            <p>Saving book, please wait…</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminAddBookPage;
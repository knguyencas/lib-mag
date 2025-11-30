import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';

import HomePage from './pages/HomePage';
import LibraryPage from './pages/LibraryPage';
import BookDetailPage from './pages/BookDetailPage';
import ReaderPage from './pages/ReaderPage';
import SearchResultPage from './pages/SearchResultPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

import ThemesPage from './pages/ThemesPage';
import PerspectivePage from './pages/PerspectivePage';
import PerspectivePostDetailPage from './pages/PerspectivePostDetailPage';
import SettingsPage from './pages/SettingsPage';
import CreateVisualPostPage from './pages/CreateVisualPostPage';
import AdminAddBookPage from './pages/AdminAddBookPage';

import ProtectedRoute from './components/auth/ProtectedRoute';

import './styles/global.css';

function App() {
  useEffect(() => {
    document.title = 'Psyche Journey - Digital Library';
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/book-detail" element={<BookDetailPage />} />
        <Route path="/reader" element={<ReaderPage />} />
        <Route path="/search-results" element={<SearchResultPage />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="/themes" element={<ThemesPage />} />

        <Route path="/perspective" element={<PerspectivePage />} />

        <Route
          path="/perspective-post/:id"
          element={<PerspectivePostDetailPage />}
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        <Route path="/about" element={<PlaceholderPage title="About" />} />
        <Route path="/contact" element={<PlaceholderPage title="Contact" />} />

        <Route
          path="/create-visual-post"
          element={
            <ProtectedRoute>
              <CreateVisualPostPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/add-book"
          element={
            <ProtectedRoute>
              <AdminAddBookPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

function PlaceholderPage({ title }) {
  useEffect(() => {
    document.title = `${title} - Psyche Journey`;
  }, [title]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        background: '#f5f5f5',
      }}
    >
      <h1 style={{ fontSize: '48px', marginBottom: '20px', color: '#333' }}>
        {title}
      </h1>
      <p style={{ fontSize: '18px', color: '#666', marginBottom: '30px' }}>
        This page is coming soon...
      </p>
      <a
        href="/"
        style={{
          padding: '12px 24px',
          background: '#000',
          color: '#fff',
          borderRadius: '8px',
          textDecoration: 'none',
          fontWeight: '500',
        }}
      >
        Back to Home
      </a>
    </div>
  );
}

function NotFound() {
  useEffect(() => {
    document.title = '404 - Page Not Found | Psyche Journey';
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        background: '#f5f5f5',
      }}
    >
      <h1 style={{ fontSize: '72px', marginBottom: '20px', color: '#333' }}>
        404
      </h1>
      <p style={{ fontSize: '24px', color: '#666', marginBottom: '30px' }}>
        Page not found
      </p>
      <a
        href="/"
        style={{
          padding: '12px 24px',
          background: '#000',
          color: '#fff',
          borderRadius: '8px',
          textDecoration: 'none',
          fontWeight: '500',
        }}
      >
        Back to Home
      </a>
    </div>
  );
}

export default App;

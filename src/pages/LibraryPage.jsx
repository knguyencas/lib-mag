import { useEffect, useState } from 'react';
import Header from '../components/layout/Header';
import ControlsBar from '../components/library/ControlsBar';
import ForYouSection from '../components/library/ForYouSection';
import BookGrid from '../components/library/BookGrid';
import GenreSections from '../components/library/GenreSections';
import { useBooks, useGenres } from '../hooks/useBooks';
import '../styles/library.css';

function LibraryPage() {
  useEffect(() => {
    document.body.classList.add('library');
    document.body.classList.remove('home');
    
    return () => {
      document.body.classList.remove('library');
    };
  }, []);

  const [filters, setFilters] = useState({
    genre: 'all',
    sortBy: 'newest',
    view: 'default'
  });

  const [popularRows, setPopularRows] = useState(1);

  const { genres, loading: genresLoading } = useGenres();
  
  const { data: forYouBooks, loading: forYouLoading } = useBooks('forYou', {
    limit: 20,
    genre: filters.genre === 'all' ? undefined : filters.genre
  });

  const { data: popularBooks, loading: popularLoading } = useBooks('popular', {
    limit: popularRows * 5
  });

  const handlePopularShowMore = (newRows) => {
    setPopularRows(newRows);
  };

  return (
    <div className="library-page">
      <Header />

      <main className="main-content">
        <ControlsBar
          filters={filters}
          onFilterChange={setFilters}
          genres={genres}
        />

        {forYouLoading ? (
          <section className="section for-you-section">
            <h2 className="section-title">For You</h2>
            <div className="for-you-grid">
              <p style={{ color: 'white', padding: '20px' }}>Loading...</p>
            </div>
          </section>
        ) : (
          <ForYouSection books={forYouBooks} />
        )}

        {popularLoading && popularBooks.length === 0 ? (
          <section className="section">
            <h2 className="section-title">Popular</h2>
            <div className="section-grid">
              <p style={{ color: 'white' }}>Loading...</p>
            </div>
          </section>
        ) : (
          <BookGrid
            title="Popular"
            books={popularBooks}
            onShowMore={handlePopularShowMore}
            maxRows={3}
          />
        )}

        {!genresLoading && (
          <GenreSections genres={genres} filters={filters} />
        )}
      </main>

      <footer className="footer">
        <div className="footer-logo">PSYCHE JOURNEY©</div>
      </footer>
    </div>
  );
}

export default LibraryPage;
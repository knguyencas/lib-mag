import { useState } from 'react';
import { useBooks } from '../../hooks/useBooks';
import BookGrid from './BookGrid';

function GenreSections({ genres = [], filters }) {
  const [genreSections, setGenreSections] = useState({});

  const genresToShow = filters.genre === 'all' ? genres : [filters.genre];

  const handleShowMore = (genre, newRows) => {
    setGenreSections((prev) => ({
      ...prev,
      [genre]: newRows
    }));
  };

  const formatGenreTitle = (genre) => {
    const hyphenated = {
      Psychology: 'Psycho-logy',
      Philosophy: 'Philo-sophy',
      Literature: 'Litera-ture',
      Psychiatry: 'Psychi-atry',
      'Social Sciences': 'Social Scien-ces',
      'Religion & Spirituality': 'Religion & Spirit-uality',
      'Business & Economics': 'Business & Econo-mics'
    };

    return hyphenated[genre] || genre;
  };

  return (
    <>
      {genresToShow.map((genre) => (
        <GenreSection
          key={genre}
          genre={genre}
          title={formatGenreTitle(genre)}
          filters={filters}
          currentRows={genreSections[genre] || 1}
          onShowMore={(rows) => handleShowMore(genre, rows)}
        />
      ))}
    </>
  );
}

function GenreSection({ genre, title, filters, currentRows, onShowMore }) {
  const { data: books, loading } = useBooks('byGenre', {
    genre,
    page: 1,
    limit: currentRows * 5,
    sortBy: filters.sortBy
  });

  if (loading && books.length === 0) {
    return (
      <section className="section genre-section">
        <h2 className="section-title">{title}</h2>
        <div className="section-grid">
          <p style={{ color: 'white' }}>Loading...</p>
        </div>
      </section>
    );
  }

  return (
    <BookGrid
      title={title}
      books={books}
      onShowMore={onShowMore}
      maxRows={3}
    />
  );
}

export default GenreSections;
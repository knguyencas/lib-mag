import { useRef } from 'react';
import ForYouCard from './ForYouCard';
import './ForYouSection.css';

function ForYouSection({ books }) {
  const gridRef = useRef(null);

  const handleWheel = (e) => {
    if (gridRef.current) {
      e.preventDefault();
      gridRef.current.scrollLeft += e.deltaY;
    }
  };

  if (!books || books.length === 0) {
    return (
      <section className="section for-you-section">
        <h2 className="section-title">For You</h2>
        <div className="for-you-grid">
          <p style={{ color: 'white', padding: '20px' }}>No books available</p>
        </div>
      </section>
    );
  }

  return (
    <section className="section for-you-section">
      <h2 className="section-title">For You</h2>
      <div
        ref={gridRef}
        className="for-you-grid"
        onWheel={handleWheel}
      >
        {books.map((book) => (
          <ForYouCard key={book.book_id} book={book} />
        ))}
      </div>
    </section>
  );
}

export default ForYouSection;
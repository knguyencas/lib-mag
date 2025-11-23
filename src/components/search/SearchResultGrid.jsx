import SearchResultCard from './SearchResultCard';
import './SearchResultsGrid.css';

function SearchResultsGrid({ results, loading, error }) {
  if (loading) {
    return (
      <div className="results-loading">
        <div className="spinner"></div>
        <p>Searching...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="results-error">
        <p>Error loading search results</p>
        <span>{error}</span>
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <div className="results-empty">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
          <path
            d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
            stroke="#CCC"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <h3>No books found</h3>
        <p>Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="search-results-grid">
      {results.map(book => (
        <SearchResultCard key={book.book_id} book={book} />
      ))}
    </div>
  );
}

export default SearchResultsGrid;
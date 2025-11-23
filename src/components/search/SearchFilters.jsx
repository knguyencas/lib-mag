import './SearchFilters.css';

function SearchFilters({ filters, onFilterChange, genres = [] }) {
  const sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'views', label: 'Most Viewed' },
    { value: 'title', label: 'Title (A-Z)' }
  ];

  return (
    <div className="search-filters">
      <div className="filter-group">
        <label>Sort By</label>
        <select
          value={filters.sortBy || 'relevance'}
          onChange={(e) => onFilterChange('sortBy', e.target.value)}
        >
          {sortOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>Genre</label>
        <select
          value={filters.genre || 'all'}
          onChange={(e) => onFilterChange('genre', e.target.value)}
        >
          <option value="all">All Genres</option>
          {genres.map(genre => (
            <option key={genre} value={genre}>
              {genre}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>Year</label>
        <select
          value={filters.year || 'all'}
          onChange={(e) => onFilterChange('year', e.target.value)}
        >
          <option value="all">All Years</option>
          {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i).map(year => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {Object.keys(filters).length > 0 && (
        <button
          className="clear-filters-btn"
          onClick={() => onFilterChange('clear', null)}
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}

export default SearchFilters;
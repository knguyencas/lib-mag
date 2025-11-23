import { useState, useRef } from 'react';
import { useDropdown } from '@/hooks/useDropdown';
import './ControlsBar.css';

function ControlsBar({ filters, onFilterChange, genres = [] }) {
  const [currentDropdown, setCurrentDropdown] = useState(null);
  
  const genreDropdown = useDropdown();
  const sortDropdown = useDropdown();
  const viewDropdown = useDropdown();

  const genreBtnRef = useRef(null);
  const sortBtnRef = useRef(null);
  const viewBtnRef = useRef(null);

  const sortOptions = {
    newest: 'Newest First',
    oldest: 'Oldest First',
    rating: 'Highest Rating'
  };

  const viewOptions = {
    default: 'Default'
  };

  const handleDropdownToggle = (type, buttonRef, dropdown) => {
    if (currentDropdown && currentDropdown !== type) {
      genreDropdown.close();
      sortDropdown.close();
      viewDropdown.close();
    }

    dropdown.toggle(buttonRef.current);
    setCurrentDropdown(dropdown.isOpen ? null : type);
  };

  const handleGenreSelect = (genre) => {
    onFilterChange({ ...filters, genre });
    genreDropdown.close();
    setCurrentDropdown(null);
  };

  const handleSortSelect = (sortBy) => {
    onFilterChange({ ...filters, sortBy });
    sortDropdown.close();
    setCurrentDropdown(null);
  };

  return (
    <div className="controls-wrapper">
      <div className="controls-bar">
        <button
          ref={viewBtnRef}
          className={`dropdown-btn ${viewDropdown.isOpen ? 'open' : ''}`}
          onClick={() => handleDropdownToggle('view', viewBtnRef, viewDropdown)}
        >
          View: Default <span>▼</span>
        </button>

        <button
          ref={sortBtnRef}
          className={`dropdown-btn ${sortDropdown.isOpen ? 'open' : ''}`}
          onClick={() => handleDropdownToggle('sort', sortBtnRef, sortDropdown)}
        >
          Sort: {sortOptions[filters.sortBy] || 'Newest First'} <span>▼</span>
        </button>

        <button
          ref={genreBtnRef}
          className={`dropdown-btn ${genreDropdown.isOpen ? 'open' : ''}`}
          onClick={() => handleDropdownToggle('genre', genreBtnRef, genreDropdown)}
        >
          Genre: {filters.genre === 'all' ? 'All' : filters.genre} <span>▼</span>
        </button>
      </div>

      {genreDropdown.isOpen && (
        <div
          ref={genreDropdown.dropdownRef}
          className="dropdown-panel open"
          style={genreDropdown.position}
        >
          <div className="dropdown-panel-inner">
            <div
              className={`dropdown-option ${filters.genre === 'all' ? 'active' : ''}`}
              onClick={() => handleGenreSelect('all')}
            >
              All Genres
            </div>
            {genres.map((genre) => (
              <div
                key={genre}
                className={`dropdown-option ${filters.genre === genre ? 'active' : ''}`}
                onClick={() => handleGenreSelect(genre)}
              >
                {genre}
              </div>
            ))}
          </div>
        </div>
      )}

      {sortDropdown.isOpen && (
        <div
          ref={sortDropdown.dropdownRef}
          className="dropdown-panel open"
          style={sortDropdown.position}
        >
          <div className="dropdown-panel-inner">
            {Object.entries(sortOptions).map(([value, label]) => (
              <div
                key={value}
                className={`dropdown-option ${filters.sortBy === value ? 'active' : ''}`}
                onClick={() => handleSortSelect(value)}
              >
                {label}
              </div>
            ))}
          </div>
        </div>
      )}

      {viewDropdown.isOpen && (
        <div
          ref={viewDropdown.dropdownRef}
          className="dropdown-panel open"
          style={viewDropdown.position}
        >
          <div className="dropdown-panel-inner">
            {Object.entries(viewOptions).map(([value, label]) => (
              <div
                key={value}
                className="dropdown-option active"
                onClick={() => viewDropdown.close()}
              >
                {label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ControlsBar;
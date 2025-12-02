import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SearchBar.css';

function SearchBar({ placeholder = 'Enter' }) {
  const [isVisible, setIsVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSearch = () => {
    const trimmed = searchText.trim();

    if (!trimmed) {
      setError('Please enter search term');
      return;
    }

    setError('');
    navigate(`/search-results?q=${encodeURIComponent(trimmed)}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleChange = (e) => {
    setSearchText(e.target.value);
    if (error) setError('');
  };

  return (
    <div className="sub_nav">
      <div className="search_bar">
        {!isVisible && (
          <button
            type="button"
            className="search_toggle_btn"
            onClick={() => setIsVisible(true)}
          >
            Search
          </button>
        )}

        {isVisible && (
          <div className="search_input_group visible">
            <input
              type="text"
              value={searchText}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
            />
            <button
              type="button"
              className="search_btn"
              onClick={handleSearch}
            >
              Search
            </button>
          </div>
        )}

        {error && <div className="search_error">{error}</div>}
      </div>
    </div>
  );
}

export default SearchBar;

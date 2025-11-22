import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SearchBar.css';

function SearchBar({ placeholder = "Enter" }) {
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

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleInputChange = (e) => {
    setSearchText(e.target.value);
    if (error) setError('');
  };

  return (
    <div className="search_bar">
      <div className="search_input_group">
        <input
          type="text"
          value={searchText}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
        />
        <button className="search_btn" onClick={handleSearch}>
          Search
        </button>
      </div>
      {error && <div className="search_error">{error}</div>}
    </div>
  );
}

export default SearchBar;
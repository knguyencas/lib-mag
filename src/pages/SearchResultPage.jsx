import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../components/layout/Header';
import SearchFilters from '../components/search/SearchFilters';
import SearchResultsGrid from '../components/search/SearchResultGrid';
import { searchService } from '../services/searchService';
import { bookService } from '../services/bookService';
import '../styles/search-results.css';

function SearchResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get('q') || '';

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [genres, setGenres] = useState([]);
  const [filters, setFilters] = useState({
    sortBy: 'relevance',
    genre: 'all',
    year: 'all'
  });

  useEffect(() => {
    const loadGenres = async () => {
      try {
        const genreList = await bookService.getPrimaryGenres();
        setGenres(genreList);
      } catch (err) {
        console.error('Error loading genres:', err);
      }
    };

    loadGenres();
  }, []);

  useEffect(() => {
    if (!keyword) {
      setResults([]);
      return;
    }

    performSearch();
  }, [keyword, filters]);

  const performSearch = async () => {
    try {
      setLoading(true);
      setError(null);

      const searchFilters = {
        sortBy: filters.sortBy === 'relevance' ? undefined : filters.sortBy,
        primary_genre: filters.genre !== 'all' ? filters.genre : undefined,
        publishedYear: filters.year !== 'all' ? filters.year : undefined
      };

      const searchResults = await searchService.searchBooks(keyword, searchFilters);
      setResults(searchResults);

      document.title = `Search: ${keyword} - Psyche Journey`;
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterName, value) => {
    if (filterName === 'clear') {
      setFilters({
        sortBy: 'relevance',
        genre: 'all',
        year: 'all'
      });
      return;
    }

    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  useEffect(() => {
    document.body.classList.add('search-results');
    document.body.classList.remove('home', 'library', 'book-detail', 'reader');

    return () => {
      document.body.classList.remove('search-results');
    };
  }, []);

  return (
    <div className="search-results-page">
      <Header />

      <main className="main-content">
        <div className="search-header">
          <h1 className="search-title">
            Search Results
            {keyword && <span className="keyword"> for "{keyword}"</span>}
          </h1>
          <p className="results-count">
            {loading ? 'Searching...' : `${results.length} book${results.length !== 1 ? 's' : ''} found`}
          </p>
        </div>

        <SearchFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          genres={genres}
        />

        <SearchResultsGrid
          results={results}
          loading={loading}
          error={error}
        />
      </main>
    </div>
  );
}

export default SearchResultsPage;
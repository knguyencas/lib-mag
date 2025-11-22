import { useState, useEffect } from 'react';
import { bookService } from '../services/bookService';

export function useBooks(type, options = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadBooks();
  }, [type, options.genre, options.sortBy, options.page, options.limit]);

  const loadBooks = async () => {
    try {
      setLoading(true);
      setError(null);

      let result;
      switch (type) {
        case 'forYou':
          result = await bookService.getForYouBooks(options.limit || 20);
          break;
        case 'popular':
          result = await bookService.getPopularBooks(options.limit || 5);
          break;
        case 'byGenre':
          result = await bookService.getBooksByGenrePaginated(
            options.genre,
            options.page || 1,
            options.limit || 5,
            options.sortBy || 'newest'
          );
          break;
        default:
          result = [];
      }

      setData(Array.isArray(result) ? result : result.books || []);
    } catch (err) {
      console.error('Error loading books:', err);
      setError(err.message);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch: loadBooks };
}

export function useGenres() {
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGenres();
  }, []);

  const loadGenres = async () => {
    try {
      const data = await bookService.getPrimaryGenres();
      setGenres(data);
    } catch (err) {
      console.error('Error loading genres:', err);
    } finally {
      setLoading(false);
    }
  };

  return { genres, loading };
}
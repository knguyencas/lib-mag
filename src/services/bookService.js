import api from './api';

export const bookService = {
  getMostReadBooks: async (limit = 30) => {
    try {
      const response = await api.get('/books', {
        params: {
          limit,
          sortBy: 'views',
          status: 'published'
        }
      });
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching most read books:', error);
      return [];
    }
  },

  searchBooks: async (keyword) => {
    try {
      const response = await api.get('/books/search', {
        params: {
          keyword,
          status: 'published'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching books:', error);
      throw error;
    }
  },
  getPrimaryGenres: async () => {
    try {
      const response = await api.get('/books/metadata/genres');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching genres:', error);
      return [];
    }
  },

  getForYouBooks: async (limit = 20) => {
    try {
      const response = await api.get('/books', {
        params: {
          limit,
          sortBy: 'rating',
          status: 'published'
        }
      });
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching For You books:', error);
      return [];
    }
  },

  getPopularBooks: async (limit = 10) => {
    try {
      const response = await api.get('/books/popular', {
        params: { limit }
      });
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching popular books:', error);
      return [];
    }
  },

  getBooksByGenrePaginated: async (genre, page = 1, limit = 5, sortBy = 'newest') => {
    try {
      let url = `/books?page=${page}&limit=${limit}&status=published`;
      
      if (genre && genre !== 'all') {
        url += `&primary_genre=${encodeURIComponent(genre)}`;
      }
      
      url += `&sortBy=${sortBy}`;
      
      const response = await api.get(url);
      return {
        books: response.data.data || [],
        pagination: response.data.pagination || {}
      };
    } catch (error) {
      console.error(`Error fetching books for genre ${genre}:`, error);
      return { books: [], pagination: {} };
    }
  }
};
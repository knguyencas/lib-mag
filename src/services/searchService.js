import api from './api';

export const searchService = {
  searchBooks: async (keyword, filters = {}) => {
    try {
      const params = {
        keyword: keyword,
        status: 'published',
        ...filters
      };

      const response = await api.get('/books/search', { params });
      return response.data.data || [];
    } catch (error) {
      console.error('Error searching books:', error);
      throw error;
    }
  },

  advancedSearch: async (filters) => {
    try {
      const response = await api.get('/books', {
        params: {
          status: 'published',
          ...filters
        }
      });
      return response.data.data || [];
    } catch (error) {
      console.error('Error in advanced search:', error);
      throw error;
    }
  }
};
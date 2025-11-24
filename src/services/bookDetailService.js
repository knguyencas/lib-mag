import api from './api';

export const bookDetailService = {
  getBookById: async (bookId) => {
    try {
      const response = await api.get(`/books/${bookId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching book:', error);
      throw error;
    }
  },

  getBookStructure: async (bookId) => {
    try {
      const response = await api.get(`/books/${bookId}/split/structure`);
      
      if (!response.data) {
        console.warn(`Structure API failed`);
        return null;
      }
      
      const result = response.data;
      
      if (result.structure) {
        return result.structure;
      }
      
      if (result.data && result.data.structure) {
        return result.data.structure;
      }
      
      return null;
      
    } catch (error) {
      console.error('Error fetching book structure:', error);
      return null;
    }
  },

  getChapterContent: async (bookId, chapterNumber) => {
    try {
      const response = await api.get(`/books/${bookId}/split/chapter/${chapterNumber}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching chapter:', error);
      throw error;
    }
  },

  getRelatedBooks: async (bookId, limit = 4) => {
    try {
      const response = await api.get(`/books/${bookId}/related`, {
        params: { limit }
      });
      return response.data.data || [];
    } catch (error) {
      console.warn('Related books API failed:', error);
      return [];
    }
  }
};
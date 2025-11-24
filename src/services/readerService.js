import api from './api';

export const readerService = {
  getBookInfo: async (bookId) => {
    try {
      const response = await api.get(`/books/${bookId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching book info:', error);
      throw error;
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

  getBookStructure: async (bookId) => {
    try {
      const response = await api.get(`/books/${bookId}/split/structure`);
      
      if (!response.data) {
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
      console.error('Error fetching structure:', error);
      return null;
    }
  },

  updateProgress: async (bookId, chapterNumber, progress) => {
    try {
      await api.post(`/books/${bookId}/progress`, {
        chapter: chapterNumber,
        progress: progress
      });
    } catch (error) {
      console.warn('Failed to update progress:', error);
    }
  }
};
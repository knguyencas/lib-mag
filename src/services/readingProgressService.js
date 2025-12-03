import api from './api';

export const readingProgressService = {
  async updateProgress(bookId, progressData) {
    try {
      const response = await api.post(`/books/${bookId}/progress`, progressData);
      return response.data;
    } catch (error) {
      console.error('Failed to update progress:', error);
      throw error;
    }
  },

  async getProgress(bookId) {
    try {
      const response = await api.get(`/books/${bookId}/progress`);
      
      if (response.data && response.data.data) {
        return response.data.data;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to get progress:', error);
      
      if (error.response && error.response.status === 404) {
        return null;
      }
      
      return null;
    }
  },

  async getRecentlyRead(limit = 10) {
    try {
      const response = await api.get('/reading/recently-read', {
        params: { limit }
      });
      
      if (response.data && response.data.data) {
        return response.data.data;
      }
      
      return [];
    } catch (error) {
      console.error('Failed to get recently read:', error);
      return [];
    }
  },


  async deleteProgress(bookId) {
    try {
      const response = await api.delete(`/books/${bookId}/progress`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete progress:', error);
      throw error;
    }
  }
};
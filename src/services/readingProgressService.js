import api from './api';

export const readingProgressService = {
  async updateProgress(bookId, progressData) {
    try {
      const response = await api.post(`/reading-progress/${bookId}`, progressData);
      console.log('📡 Update progress response:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('Update progress error:', error);
      throw error;
    }
  },

  async getProgress(bookId) {
    try {
      const response = await api.get(`/reading-progress/${bookId}`);
      console.log('Get progress response:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('Get progress error:', error);
      return {
        chapter_index: 0,
        scroll_position: 0,
        progress_percentage: 0,
        last_read_at: null
      };
    }
  },

  async getRecentlyRead(limit = 10) {
    try {
      const response = await api.get('/reading-progress/recently-read/list', {
        params: { limit }
      });
      return response.data.data;
    } catch (error) {
      console.error('Get recently read error:', error);
      return [];
    }
  },

  async deleteProgress(bookId) {
    try {
      const response = await api.delete(`/reading-progress/${bookId}`);
      return response.data;
    } catch (error) {
      console.error('Delete progress error:', error);
      throw error;
    }
  }
};
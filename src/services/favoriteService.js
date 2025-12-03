import api from './api';

export const favoriteService = {
  async toggleFavorite(bookId) {
    try {
      const response = await api.post(`/favorites/${bookId}`);
      console.log('📡 Toggle response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Toggle error:', error);
      throw error;
    }
  },

  async getFavorites(page = 1, limit = 12) {
    try {
      const response = await api.get('/favorites', {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Get favorites error:', error);
      throw error;
    }
  },

  async isFavorited(bookId) {
    try {
      const response = await api.get(`/favorites/${bookId}/check`);
      console.log('📡 isFavorited response:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('Check favorite error:', error);
      return { isFavorited: false };
    }
  }
};
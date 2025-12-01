import api from './api';

export const visualService = {
  getAllPosts: async (params = {}) => {
    try {
      const { page = 1, limit = 12, sortBy = 'newest', genre = 'all' } = params;
      
      const queryParams = {
        page,
        limit,
        sortBy,
        status: 'published'
      };

      if (genre && genre !== 'all') {
        queryParams.primary_genre = genre;
      }

      const response = await api.get('/visualpost', { params: queryParams });
      return {
        posts: response.data.data || [],
        pagination: response.data.pagination || {}
      };
    } catch (error) {
      console.error('Error fetching visual posts:', error);
      throw error;
    }
  },

  getPostById: async (postId) => {
    try {
      console.log('Fetching visual post from API:', `/visualpost/${postId}`);
      const response = await api.get(`/visualpost/${postId}`);
      console.log('Visual post API response:', response.data);

      const data = response.data || {};
      const postData =
        data.data?.post ||
        data.data?.visualPost ||
        data.post ||
        data.visualPost ||
        data.data ||
        data;

      if (!postData || typeof postData !== 'object') {
        console.error('Invalid visual post data structure:', postData);
        throw new Error('Invalid response structure from API');
      }

      return postData;
    } catch (error) {
      console.error('Error fetching visual post detail:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  likePost: async (postId) => {
    try {
      const response = await api.post(`/visualpost/${postId}/like`);
      return response.data;
    } catch (error) {
      console.error('Error liking post:', error);
      throw error;
    }
  },

  unlikePost: async (postId) => {
    try {
      const response = await api.delete(`/visualpost/${postId}/like`);
      return response.data;
    } catch (error) {
      console.error('Error unliking post:', error);
      throw error;
    }
  }
};
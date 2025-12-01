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
      
      const postData = response.data.data || response.data.post || response.data;
      
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
  },

  getComments: async (postId) => {
    try {
      const response = await api.get(`/comments/visual/${postId}`);
      return response.data.data || response.data.comments || [];
    } catch (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
  },

  addComment: async (postId, content) => {
    try {
      const response = await api.post(`/comments/visual/${postId}`, {
        content
      });
      return response.data.data || response.data.comment;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  },

  getGenres: async () => {
    try {
      const response = await api.get('/books/metadata/genres');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching genres:', error);
      return [];
    }
  },

  createPost: async (formData) => {
    try {
      const response = await api.post('/visualpost', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating visual post:', error);
      throw error;
    }
  }
};
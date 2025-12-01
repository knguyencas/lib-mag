import api from './api';

export const perspectiveService = {
  getAllPosts: async (params = {}) => {
    try {
      const { page = 1, limit = 5, sortBy = 'newest', genre = 'all' } = params;
      
      const queryParams = {
        page,
        limit,
        sortBy,
        status: 'published'
      };

      if (genre && genre !== 'all') {
        queryParams.primary_genre = genre;
      }

      const response = await api.get('/perspectivepost', { params: queryParams });
      return {
        posts: response.data.data || [],
        pagination: response.data.pagination || {}
      };
    } catch (error) {
      console.error('Error fetching perspective posts:', error);
      throw error;
    }
  },

  getPostById: async (postId) => {
    try {
      const response = await api.get(`/perspectivepost/${postId}`);
      return response.data.data || response.data.post;
    } catch (error) {
      console.error('Error fetching post detail:', error);
      throw error;
    }
  },

  getComments: async (postId) => {
    try {
      const response = await api.get(`/comments/perspective/${postId}`);
      return response.data.data || response.data.comments || [];
    } catch (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
  },

  addComment: async (postId, content) => {
    try {
      const response = await api.post(`/comments/perspective/${postId}`, {
        content
      });
      return response.data.data || response.data.comment;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  },

  upvotePost: async (postId) => {
    try {
      const response = await api.post(`/perspectivepost/${postId}/upvote`);
      return response.data;
    } catch (error) {
      console.error('Error upvoting post:', error);
      throw error;
    }
  },

  downvotePost: async (postId) => {
    try {
      const response = await api.post(`/perspectivepost/${postId}/downvote`);
      return response.data;
    } catch (error) {
      console.error('Error downvoting post:', error);
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

  createPost: async (postData) => {
    try {
      const response = await api.post('/perspectivepost', postData);
      return response.data;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  }
};
import api from './api';

export const perspectiveService = {
  getAllPosts: async (params = {}) => {
    const { page = 1, limit = 5, sortBy = 'newest', genre = 'all' } = params;

    const queryParams = { page, limit, sortBy, status: 'published' };
    if (genre !== 'all') queryParams.primary_genre = genre;

    const res = await api.get('/perspectivepost', { params: queryParams });

    return {
      posts: res.data?.data || [],
      pagination: res.data?.pagination || {}
    };
  },

  getPostById: async (postId) => {
    const res = await api.get(`/perspectivepost/${postId}`);
    const data = res.data;

    const post =
      data?.data?.post ||
      data?.post ||
      data?.data ||
      data;

    if (!post || typeof post !== 'object') {
      throw new Error('Invalid post detail response');
    }

    return post;
  },

  getComments: async (postId) => {
    const res = await api.get(`/comments/perspective/${postId}`);
    const comments =
      res.data?.data ||
      res.data?.comments ||
      [];

    return Array.isArray(comments) ? comments : [];
  },

  addComment: async (postId, content) => {
    const res = await api.post(`/comments/perspective/${postId}`, { content });
    return res.data?.data || res.data?.comment;
  },

  upvotePost: (postId) =>
    api.post(`/perspectivepost/${postId}/upvote`),

  downvotePost: (postId) =>
    api.post(`/perspectivepost/${postId}/downvote`),

  getGenres: async () => {
    const res = await api.get('/books/metadata/genres');
    return res.data?.data || [];
  },

  createPost: async (postData) => {
    const res = await api.post('/perspectivepost', postData);
    return res.data;
  }
};

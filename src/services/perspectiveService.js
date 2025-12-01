import api from './api';

export const perspectiveService = {
  async getPublishedPosts(params = {}) {
    try {
      const response = await api.get('/perspectivepost', { params });
      console.log('Published posts response:', response.data);
      
      if (response.data.success && Array.isArray(response.data.data)) {
        const mappedPosts = response.data.data.map(post => ({
          id: post._id,
          post_id: post.post_id,
          title: post.topic,
          content: post.content,
          authorId: post.author_id?._id || post.author_id,
          authorUsername: post.author_id?.username || 'Anonymous',
          tags: post.tags || [],
          primary_genre: post.primary_genre || 'General',
          status: post.status,
          upvotes: post.upvotes || 0,
          downvotes: post.downvotes || 0,
          views: post.views || 0,
          commentsCount: post.commentsCount || 0,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt
        }));

        console.log('Mapped posts:', mappedPosts.length, 'posts');
        console.log('First post:', mappedPosts[0]);

        return mappedPosts;
      }
      
      console.warn('⚠️ No data in response or invalid format');
      return [];
    } catch (error) {
      console.error('Error fetching published posts:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      throw error;
    }
  },

  async getPostById(postId) {
    try {
      console.log('🔍 Fetching post:', postId);
      const response = await api.get(`/perspectivepost/${postId}`);
      console.log('Raw API response:', response.data);
      
      if (response.data.success && response.data.data) {
        const post = response.data.data;
        console.log('Post from backend:', post);
        
        const mappedPost = {
          id: post._id,
          post_id: post.post_id,
          title: post.topic, 
          content: post.content,
          authorId: post.author_id?._id || post.author_id,
          authorUsername: post.author_id?.username || 'Anonymous',
          tags: post.tags || [],
          primary_genre: post.primary_genre || 'General',
          status: post.status,
          upvotes: post.upvotes || 0,
          downvotes: post.downvotes || 0,
          views: post.views || 0,
          commentsCount: post.commentsCount || 0,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt
        };

        console.log('Mapped post for frontend:', mappedPost);
        console.log('Title:', mappedPost.title);
        console.log('Content length:', mappedPost.content?.length);
        console.log('Author:', mappedPost.authorUsername);
        
        return mappedPost;
      }
      
      console.error('Invalid response structure:', response.data);
      return null;
    } catch (error) {
      console.error('Error fetching post by ID:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      throw error;
    }
  },

  async getUserPosts() {
    try {
      const response = await api.get('/perspectivepost/my-posts');
      console.log('User posts response:', response.data);
      
      if (response.data.success) {
        const mappedPosts = response.data.data.map(post => ({
          id: post._id,
          post_id: post.post_id,
          title: post.topic,
          content: post.content,
          authorId: post.author_id,
          tags: post.tags || [],
          primary_genre: post.primary_genre || 'General',
          status: post.status,
          upvotes: post.upvotes || 0,
          downvotes: post.downvotes || 0,
          views: post.views || 0,
          commentsCount: post.commentsCount || 0,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt
        }));

        return mappedPosts;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching user posts:', error);
      throw error;
    }
  },

  async createPost(postData) {
    try {
      const backendData = {
        topic: postData.title,
        content: postData.content,
        primary_genre: postData.primary_genre || 'General',
        tags: postData.tags || []
      };

      console.log('Sending to backend:', backendData);
      
      const response = await api.post('/perspectivepost', backendData);
      console.log('Create post response:', response.data);
      
      if (response.data.success) {
        const post = response.data.data;
        return {
          id: post._id,
          post_id: post.post_id,
          title: post.topic,
          content: post.content,
          authorId: post.author_id,
          tags: post.tags || [],
          primary_genre: post.primary_genre || 'General',
          status: post.status,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error creating post:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
      }
      throw error;
    }
  },

  async updatePost(postId, postData) {
    try {
      const backendData = {
        topic: postData.title,
        content: postData.content,
        primary_genre: postData.primary_genre,
        tags: postData.tags
      };

      const response = await api.put(`/perspectivepost/${postId}`, backendData);
      console.log('Update post response:', response.data);
      
      if (response.data.success) {
        const post = response.data.data;
        return {
          id: post._id,
          post_id: post.post_id,
          title: post.topic,
          content: post.content,
          authorId: post.author_id,
          tags: post.tags || [],
          primary_genre: post.primary_genre || 'General',
          status: post.status,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  },

  async deletePost(postId) {
    try {
      const response = await api.delete(`/perspectivepost/${postId}`);
      console.log('Delete post response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  },

  async getComments(postId) {
    try {
      const response = await api.get(`/comments/perspective/${postId}`);
      console.log('Comments response:', response.data);
      
      if (response.data.success) {
        return response.data.data || [];
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
  },

  async addComment(postId, content) {
    try {
      const response = await api.post(`/comments/perspective/${postId}`, {
        content
      });
      console.log('Add comment response:', response.data);
      
      if (response.data.success) {
        return response.data.data;
      }
      
      return null;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }
};
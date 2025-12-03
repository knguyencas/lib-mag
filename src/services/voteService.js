import api from './api';

export const voteService = {
  async votePerspectivePost(postId, voteType) {
    try {
      const response = await api.post(`/votes/perspective_post/${postId}`, {
        voteType
      });
      return response.data;
    } catch (error) {
      console.error('Error voting on perspective post:', error);
      throw error;
    }
  },

  async likeVisualPost(postId) {
    try {
      const response = await api.post(`/votes/visual_post/${postId}`, {
        voteType: 'like'
      });
      return response.data;
    } catch (error) {
      console.error('Error liking visual post:', error);
      throw error;
    }
  },

  async voteComment(commentId, voteType) {
    try {
      const response = await api.post(`/votes/comment/${commentId}`, {
        voteType
      });
      return response.data;
    } catch (error) {
      console.error('Error voting on comment:', error);
      throw error;
    }
  },

  async getMyVote(targetType, targetId) {
    try {
      const response = await api.get(`/votes/${targetType}/${targetId}/my-vote`);
      return response.data.data;
    } catch (error) {
      console.error('Error getting my vote:', error);
      return null;
    }
  },

  async getVoteCounts(targetType, targetId) {
    try {
      const response = await api.get(`/votes/${targetType}/${targetId}/counts`);
      return response.data.data;
    } catch (error) {
      console.error('Error getting vote counts:', error);
      return null;
    }
  },

  async getMyVotesBatch(targetType, targetIds) {
    try {
      const response = await api.post(`/votes/${targetType}/batch`, {
        targetIds
      });
      return response.data.data;
    } catch (error) {
      console.error('Error getting votes batch:', error);
      return {};
    }
  }
};
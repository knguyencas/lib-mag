import api from './api';

export const authService = {
  register: async (username, email, password) => {
    try {
      const response = await api.post('/auth/register', {
        username,
        email,
        password
      });

      const { token, user } = response.data.data;
      
      localStorage.setItem('pj_token', token);
      localStorage.setItem('pj_user', JSON.stringify(user));
      localStorage.setItem('pj_user_id', user.id);

      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', {
        email,
        password
      });

      const { token, user } = response.data.data;
      
      localStorage.setItem('pj_token', token);
      localStorage.setItem('pj_user', JSON.stringify(user));
      localStorage.setItem('pj_user_id', user.id);

      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  logout: async () => {
    try {
      const token = localStorage.getItem('pj_token');
      
      if (token) {
        await api.post('/auth/logout');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('pj_token');
      localStorage.removeItem('pj_user');
      localStorage.removeItem('pj_user_id');
    }
  },

  getProfile: async () => {
    try {
      const response = await api.get('/auth/profile');
      const user = response.data.data;

      localStorage.setItem('pj_user', JSON.stringify(user));

      return user;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getToken: () => {
    return localStorage.getItem('pj_token');
  },

  getUser: () => {
    const userStr = localStorage.getItem('pj_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isLoggedIn: () => {
    return !!localStorage.getItem('pj_token');
  }
};
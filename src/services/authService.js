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
      
      const normalizedUser = {
        _id: user.id || user._id,
        id: user.id || user._id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        avatar: user.avatar,
        role: user.role,
        createdAt: user.createdAt
      };
      
      localStorage.setItem('pj_token', token);
      localStorage.setItem('pj_user', JSON.stringify(normalizedUser));
      localStorage.setItem('pj_user_id', normalizedUser._id);

      console.log('Registered user:', normalizedUser);

      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  login: async (identifier, password) => {
    try {
      const isEmail = identifier.includes('@');
      
      const requestBody = {
        identifier: identifier,
        email: isEmail ? identifier : undefined,
        username: !isEmail ? identifier : undefined,
        password: password
      };

      Object.keys(requestBody).forEach(key => 
        requestBody[key] === undefined && delete requestBody[key]
      );

      console.log('Login attempt with:', requestBody);

      const response = await api.post('/auth/login', requestBody);

      console.log('Login response:', response.data);

      const { token, user } = response.data.data;
      
      const normalizedUser = {
        _id: user.id || user._id,
        id: user.id || user._id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        avatar: user.avatar,
        role: user.role,
        lastLogin: user.lastLogin
      };
      
      localStorage.setItem('pj_token', token);
      localStorage.setItem('pj_user', JSON.stringify(normalizedUser));
      localStorage.setItem('pj_user_id', normalizedUser._id);

      console.log('Logged in user:', normalizedUser);

      return response.data;
    } catch (error) {
      console.error('Login error:', error);
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

      const normalizedUser = {
        _id: user._id || user.id,
        id: user._id || user.id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        avatar: user.avatar,
        role: user.role
      };

      localStorage.setItem('pj_user', JSON.stringify(normalizedUser));

      return normalizedUser;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getToken: () => {
    return localStorage.getItem('pj_token');
  },

  getUser: () => {
    const userStr = localStorage.getItem('pj_user');
    if (!userStr) return null;
    
    const user = JSON.parse(userStr);
    
    console.log('getUser():', user);
    
    return user;
  },

  isLoggedIn: () => {
    return !!localStorage.getItem('pj_token');
  }
};
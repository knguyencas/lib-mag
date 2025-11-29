const AuthClient = {
  API_URL: 'http://localhost:3000/api/auth',
  
  setSession(token, user) {
    localStorage.setItem('pj_token', token);
    localStorage.setItem('pj_user', JSON.stringify(user));
    localStorage.setItem('pj_user_id', user.id);
  },
  
  clearSession() {
    localStorage.removeItem('pj_token');
    localStorage.removeItem('pj_user');
    localStorage.removeItem('pj_user_id');
  },
  
  getToken() {
    return localStorage.getItem('pj_token');
  },
  
  getUser() {
    const userStr = localStorage.getItem('pj_user');
    return userStr ? JSON.parse(userStr) : null;
  },
  
  isLoggedIn() {
    return !!this.getToken();
  },
  
  async register(username, email, password) {
    try {
      const response = await fetch(`${this.API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Registration failed');
      }
      
      this.setSession(result.data.token, result.data.user);
      return result;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  },
  
  async login(identifier, password) {
    try {
      const response = await fetch(`${this.API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier, password })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Login failed');
      }
      
      this.setSession(result.data.token, result.data.user);
      return result;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  async logout() {
    try {
      const token = this.getToken();
      
      if (token) {
        await fetch(`${this.API_URL}/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
      
      this.clearSession();
      window.location.href = 'index.html';
    } catch (error) {
      console.error('Logout error:', error);
      this.clearSession();
      window.location.href = 'index.html';
    }
  },
  
  async getProfile() {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('No token found');
      }
      
      const response = await fetch(`${this.API_URL}/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Failed to get profile');
      }
      
      this.setSession(token, result.data);
      return result.data;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  }
};

window.AuthClient = AuthClient;

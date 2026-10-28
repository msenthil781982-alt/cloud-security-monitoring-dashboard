import api from './api';

export const authService = {
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('cloudguard_token', response.data.token);
      localStorage.setItem('cloudguard_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async register(userData) {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('cloudguard_token', response.data.token);
      localStorage.setItem('cloudguard_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async getMe() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.warn('Logout API failed:', e);
    } finally {
      localStorage.removeItem('cloudguard_token');
      localStorage.removeItem('cloudguard_user');
    }
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('cloudguard_user');
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      return null;
    }
  },

  getToken() {
    return localStorage.getItem('cloudguard_token');
  }
};

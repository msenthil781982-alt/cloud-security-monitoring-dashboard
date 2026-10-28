import api from './api';

export const userService = {
  async getUsers() {
    const response = await api.get('/users');
    return response.data;
  },

  async updateUserRole(id, role) {
    const response = await api.patch(`/users/${id}/role`, { role });
    return response.data;
  },

  async toggleUserStatus(id) {
    const response = await api.patch(`/users/${id}/status`);
    return response.data;
  }
};

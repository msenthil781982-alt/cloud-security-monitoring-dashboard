import api from './api';

export const alertService = {
  async getAlerts(params = {}) {
    const response = await api.get('/alerts', { params });
    return response.data;
  },

  async getAlertById(id) {
    const response = await api.get(`/alerts/${id}`);
    return response.data;
  },

  async updateAlertStatus(id, updateData) {
    const response = await api.patch(`/alerts/${id}/status`, updateData);
    return response.data;
  },

  async createAlert(data) {
    const response = await api.post('/alerts', data);
    return response.data;
  }
};

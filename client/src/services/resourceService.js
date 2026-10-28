import api from './api';

export const resourceService = {
  async getResources(params = {}) {
    const response = await api.get('/resources', { params });
    return response.data;
  },

  async getResourceById(id) {
    const response = await api.get(`/resources/${id}`);
    return response.data;
  },

  async scanResource(id) {
    const response = await api.post(`/resources/${id}/scan`);
    return response.data;
  },

  async createResource(data) {
    const response = await api.post('/resources', data);
    return response.data;
  },

  async updateResource(id, data) {
    const response = await api.put(`/resources/${id}`, data);
    return response.data;
  }
};

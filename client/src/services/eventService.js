import api from './api';

export const eventService = {
  async getEvents(params = {}) {
    const response = await api.get('/events', { params });
    return response.data;
  },

  async getEventById(id) {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },

  async createEvent(data) {
    const response = await api.post('/events', data);
    return response.data;
  }
};

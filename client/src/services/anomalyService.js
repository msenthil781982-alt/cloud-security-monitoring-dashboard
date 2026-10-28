import api from './api';

export const anomalyService = {
  async analyze(payload) {
    const response = await api.post('/anomaly/analyze', payload);
    return response.data;
  },

  async getScenarios() {
    const response = await api.get('/anomaly/scenarios');
    return response.data;
  }
};

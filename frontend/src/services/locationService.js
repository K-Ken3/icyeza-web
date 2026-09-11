import api from './api';

export const locationService = {
  async getLocations() {
    const res = await api.get('/locations');
    return res.data;
  },
};

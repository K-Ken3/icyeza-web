import api from './api';

export const userService = {
  async getProfile() {
    const res = await api.get('/users/profile');
    return res.data;
  },
  async updateProfile(data) {
    const res = await api.put('/users/profile', data);
    return res.data;
  },
  async getFavorites() {
    const res = await api.get('/users/favorites');
    return res.data;
  },
  async addFavorite(productId) {
    const res = await api.post('/users/favorites', { productId });
    return res.data;
  },
  async removeFavorite(productId) {
    const res = await api.delete(`/users/favorites/${productId}`);
    return res.data;
  },
};

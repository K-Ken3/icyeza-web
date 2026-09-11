import api from './api';

export const productService = {
  async getProducts(params = {}) {
    const res = await api.get('/products', { params });
    return res.data;
  },
  async getProduct(id) {
    const res = await api.get(`/products/${id}`);
    return res.data;
  },
  async getCategories() {
    const res = await api.get('/categories');
    return res.data;
  },
  async createProduct(data) {
    const res = await api.post('/products', data);
    return res.data;
  },
  async updateProduct(id, data) {
    const res = await api.put(`/products/${id}`, data);
    return res.data;
  },
  async deleteProduct(id) {
    const res = await api.delete(`/products/${id}`);
    return res.data;
  },
};

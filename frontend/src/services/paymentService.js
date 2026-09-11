import api from './api';

export const paymentService = {
  async createPayment(data) {
    const res = await api.post('/payments/create', data);
    return res.data;
  },
};

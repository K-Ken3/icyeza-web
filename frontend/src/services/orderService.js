import api from './api';

const TOKEN_KEY = 'ff_order_tokens';

const getTokens = () => {
  try {
    return JSON.parse(localStorage.getItem(TOKEN_KEY)) || {};
  } catch {
    return {};
  }
};

const setToken = (orderId, token) => {
  if (!orderId || !token) return;
  const tokens = getTokens();
  tokens[orderId] = token;
  localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
};

export const orderService = {
  async createOrder(data) {
    const res = await api.post('/orders', data);
    if (res.data?.trackingToken && res.data?.order?._id) {
      setToken(res.data.order._id, res.data.trackingToken);
    }
    return res.data;
  },
  async getOrders() {
    const res = await api.get('/orders');
    return res.data;
  },
  async getOrder(id) {
    const isGuest = !localStorage.getItem('ff_token');
    if (isGuest) {
      const token = getTokens()[id];
      if (!token) {
        const err = new Error('Tracking token not found');
        err.response = { status: 403 };
        throw err;
      }
      const res = await api.get(`/orders/track/${id}`, {
        headers: token ? { 'X-Order-Token': token } : {},
      });
      return res.data;
    }
    const res = await api.get(`/orders/${id}`);
    return res.data;
  },
  async updatePaymentInfo(id, { paidBy }) {
    const isGuest = !localStorage.getItem('ff_token');
    const token = getTokens()[id];
    const res = await api.put(
      `/orders/${id}/payment-info`,
      { paidBy },
      {
        headers: isGuest && token ? { 'X-Order-Token': token } : {},
      }
    );
    return res.data;
  },
};
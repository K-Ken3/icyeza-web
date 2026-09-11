import api from './api';

export const contentService = {
  getPartners: async () => {
    const res = await api.get('/partners');
    return res.data;
  },
  getAdminPartners: async () => {
    const res = await api.get('/admin/partners');
    return res.data;
  },
  createPartner: async (data) => {
    const res = await api.post('/admin/partners', data);
    return res.data;
  },
  updatePartner: async (id, data) => {
    const res = await api.put(`/admin/partners/${id}`, data);
    return res.data;
  },
  deletePartner: async (id) => {
    const res = await api.delete(`/admin/partners/${id}`);
    return res.data;
  },
  getTodaysMeal: async () => {
    const res = await api.get('/daily-meal/today');
    return res.data;
  },
  listMeals: async () => {
    const res = await api.get('/admin/daily-meal');
    return res.data;
  },
  upsertMeal: async (data) => {
    const res = await api.post('/admin/daily-meal', data);
    return res.data;
  },
  deleteMeal: async (id) => {
    const res = await api.delete(`/admin/daily-meal/${id}`);
    return res.data;
  },
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await api.post('/admin/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  getSetting: async (key) => {
    const res = await api.get(`/settings/${key}`);
    return res.data.setting;
  },
  updateSetting: async (key, value) => {
    const res = await api.put(`/admin/settings/${key}`, { value });
    return res.data.setting;
  },
};

export default contentService;
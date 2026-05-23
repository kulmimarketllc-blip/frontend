import axiosInstance from './axiosInstance';
import { API_CONFIG } from '../config/constants';

const cleanBase = (API_CONFIG.BASE_URL || '').replace(/\/+$/, '');
const BASE = /\/v\d+$/.test(cleanBase) ? '/notifications' : '/v1/notifications';
const ALT_BASE = BASE === '/notifications' ? '/v1/notifications' : '/notifications';
let warnedMissingEndpoint = false;

const unwrapPayload = (response) => {
  const data = response?.data;
  // If API wraps data under a 'data' key, return it; otherwise return whole payload
  if (data && typeof data === 'object' && 'data' in data) {
    return data.data;
  }
  return data;
};

const requestWithBaseFallback = async (requester) => {
  try {
    return await requester(BASE);
  } catch (err) {
    if (err?.response?.status !== 404) throw err;
    return requester(ALT_BASE);
  }
};

const fallbackListResponse = (page, limit) => ({
  data: [],
  meta: { total: 0, page, limit, unread: 0 },
});

const notificationService = {
  getNotifications: async (page = 1, limit = 20) => {
    try {
      const response = await requestWithBaseFallback((base) => (
        axiosInstance.get(`${base}?page=${page}&limit=${limit}`)
      ));
      return unwrapPayload(response);
    } catch (err) {
      if (err?.response?.status === 404) {
        if (!warnedMissingEndpoint) {
          warnedMissingEndpoint = true;
          console.warn('Notifications endpoint not found on current API base; returning empty list.');
        }
        return fallbackListResponse(page, limit);
      }
      throw err;
    }
  },

  markAsRead: async (id) => {
    const response = await requestWithBaseFallback((base) => (
      axiosInstance.patch(`${base}/${id}/read`)
    ));
    return unwrapPayload(response);
  },

  markAllAsRead: async () => {
    const response = await requestWithBaseFallback((base) => (
      axiosInstance.patch(`${base}/read-all`)
    ));
    return unwrapPayload(response);
  },
};

export default notificationService;

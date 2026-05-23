import axiosInstance from './axiosInstance';
import { API_CONFIG } from '../config/constants';

const cleanBase = (API_CONFIG.BASE_URL || '').replace(/\/+$/, '');
const apiBase = /\/v\d+$/.test(cleanBase) ? '' : '/v1';

const unwrapPayload = (response) => {
  const body = response?.data;
  if (body && typeof body === 'object' && Object.prototype.hasOwnProperty.call(body, 'data')) {
    return body.data;
  }
  return body;
};

export const getAdminDashboard = async () => {
  const response = await axiosInstance.get(`${apiBase}/admin/dashboard`);
  return unwrapPayload(response);
};

export const getAdminHealth = async () => {
  const response = await axiosInstance.get(`${apiBase}/admin/health`);
  return unwrapPayload(response);
};

export const getAdminOrders = async (params = {}) => {
  const response = await axiosInstance.get(`${apiBase}/admin/orders`, { params });
  return unwrapPayload(response);
};

export const getAdminOrderCounts = async () => {
  const response = await axiosInstance.get(`${apiBase}/admin/orders/counts`);
  return unwrapPayload(response);
};

export const getAdminRevenue = async (period = 'month') => {
  const response = await axiosInstance.get(`${apiBase}/admin/revenue`, {
    params: { period },
  });
  return unwrapPayload(response);
};

export const getAdminPendingProducts = async (params = {}) => {
  const response = await axiosInstance.get(`${apiBase}/admin/products/pending`, { params });
  return unwrapPayload(response);
};

export const getAdminProducts = async (params = {}) => {
  const response = await axiosInstance.get(`${apiBase}/admin/products`, { params });
  return unwrapPayload(response);
};

export const approveAdminProduct = async (productId) => {
  const response = await axiosInstance.patch(`${apiBase}/admin/products/${productId}/approve`);
  return unwrapPayload(response);
};

export const rejectAdminProduct = async (productId) => {
  const response = await axiosInstance.patch(`${apiBase}/admin/products/${productId}/reject`);
  return unwrapPayload(response);
};

export const deleteAdminProduct = async (productId) => {
  const response = await axiosInstance.delete(`${apiBase}/admin/products/${productId}`);
  return unwrapPayload(response);
};

export const getAdminMerchants = async (params = {}) => {
  const response = await axiosInstance.get(`${apiBase}/admin/merchants`, { params });
  return unwrapPayload(response);
};

export const getAdminCustomers = async (params = {}) => {
  const response = await axiosInstance.get(`${apiBase}/admin/customers`, { params });
  return unwrapPayload(response);
};

export const getAdminDeliveryPartners = async (params = {}) => {
  const response = await axiosInstance.get(`${apiBase}/admin/delivery`, { params });
  return unwrapPayload(response);
};

export const getAdminCoupons = async (params = {}) => {
  const response = await axiosInstance.get(`${apiBase}/coupons`, { params });
  return unwrapPayload(response);
};

export const createAdminCoupon = async (payload) => {
  const response = await axiosInstance.post(`${apiBase}/coupons`, payload);
  return unwrapPayload(response);
};

export const updateAdminCoupon = async (couponId, payload) => {
  const response = await axiosInstance.put(`${apiBase}/coupons/${couponId}`, payload);
  return unwrapPayload(response);
};

export const deactivateAdminCoupon = async (couponId) => {
  const response = await axiosInstance.patch(`${apiBase}/coupons/${couponId}/deactivate`);
  return unwrapPayload(response);
};

export const getAdminSettings = async () => {
  const response = await axiosInstance.get(`${apiBase}/admin/settings`);
  return unwrapPayload(response);
};

export const updateAdminSettings = async (payload) => {
  const response = await axiosInstance.patch(`${apiBase}/admin/settings`, payload);
  return unwrapPayload(response);
};
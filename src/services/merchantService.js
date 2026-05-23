import axiosInstance from './axiosInstance';
import { API_CONFIG } from '../config/constants';
import { createProduct, removeProduct, restockProduct, updateProduct } from './productService';

const cleanBase = (API_CONFIG.BASE_URL || '').replace(/\/+$/, '');
const apiBase = /\/v\d+$/.test(cleanBase) ? '' : '/v1';

const unwrapPayload = (response) => {
  const body = response?.data;
  if (body && typeof body === 'object' && Object.prototype.hasOwnProperty.call(body, 'data')) {
    return body.data;
  }
  return body;
};

export const getMyMerchantStore = async () => {
  const response = await axiosInstance.get(`${apiBase}/merchants/me`);
  return unwrapPayload(response);
};

export const registerMerchantStore = async (payload) => {
  const response = await axiosInstance.post(`${apiBase}/merchants/register`, payload);
  return unwrapPayload(response);
};

export const updateMyMerchantStore = async (payload) => {
  const response = await axiosInstance.put(`${apiBase}/merchants/me`, payload);
  return unwrapPayload(response);
};

export const toggleMyMerchantOnline = async () => {
  const response = await axiosInstance.patch(`${apiBase}/merchants/me/toggle-online`);
  return unwrapPayload(response);
};

export const getMyMerchantEarnings = async (period = 'month') => {
  const response = await axiosInstance.get(`${apiBase}/merchants/me/earnings`, {
    params: { period },
  });
  return unwrapPayload(response);
};

export const requestMyMerchantPayout = async (amount) => {
  const response = await axiosInstance.post(`${apiBase}/merchants/me/payout`, { amount });
  return unwrapPayload(response);
};

export const getMyMerchantPayoutHistory = async (limit = 20) => {
  const response = await axiosInstance.get(`${apiBase}/merchants/me/payout-history`, {
    params: { limit },
  });
  return unwrapPayload(response);
};

export const createMyMerchantConnectAccount = async (payload = {}) => {
  const response = await axiosInstance.post(`${apiBase}/merchants/me/connect-account`, payload);
  return unwrapPayload(response);
};

export const connectMyMerchantBankAccount = async (payload) => {
  const response = await axiosInstance.patch(`${apiBase}/merchants/me/bank-account`, payload);
  return unwrapPayload(response);
};

export const getMyMerchantOrders = async (params = {}) => {
  const response = await axiosInstance.get(`${apiBase}/orders/merchant/me`, { params });
  return unwrapPayload(response);
};

export const updateMerchantOrderStatus = async (orderId, status) => {
  const response = await axiosInstance.put(`${apiBase}/orders/${orderId}/status`, { status });
  return unwrapPayload(response);
};

export const getMyMerchantReviews = async (merchantId, params = {}) => {
  const response = await axiosInstance.get(`${apiBase}/reviews/merchant/${merchantId}`, { params });
  return unwrapPayload(response);
};

export const addReplyToReview = async (reviewId, reply) => {
  const response = await axiosInstance.post(`${apiBase}/reviews/${reviewId}/reply`, { reply });
  return unwrapPayload(response);
};

export const updateReplyToReview = async (reviewId, reply) => {
  const response = await axiosInstance.put(`${apiBase}/reviews/${reviewId}/reply`, { reply });
  return unwrapPayload(response);
};

export const getMyMerchantProducts = async (params = {}) => {
  const response = await axiosInstance.get(`${apiBase}/products/merchant/me`, { params });
  return unwrapPayload(response);
};

export const createMyMerchantProduct = async (payload) => {
  return createProduct(payload);
};

export const updateMyMerchantProduct = async (productId, payload) => {
  return updateProduct(productId, payload);
};

export const deleteMyMerchantProduct = async (productId) => {
  return removeProduct(productId);
};

export const restockMyMerchantProduct = async (productId, quantity) => {
  return restockProduct(productId, quantity);
};

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

export const validateCheckoutCoupon = async (code, cartTotal) => {
  const response = await axiosInstance.post(`${apiBase}/coupons/validate`, { code, cartTotal });
  return unwrapPayload(response);
};

export const createCheckoutPaymentIntent = async (amount, currency = 'usd', metadata = {}) => {
  const response = await axiosInstance.post(`${apiBase}/payments/intent`, { amount, currency, metadata });
  return unwrapPayload(response);
};

export const placeCheckoutOrder = async (payload) => {
  const response = await axiosInstance.post(`${apiBase}/orders`, payload);
  return unwrapPayload(response);
};

export const confirmCheckoutPayment = async (paymentIntentId, orderId) => {
  const response = await axiosInstance.post(`${apiBase}/payments/confirm`, {
    paymentIntentId,
    orderId,
  });
  return unwrapPayload(response);
};

export const getMyOrders = async (params = {}) => {
  const response = await axiosInstance.get(`${apiBase}/orders`, { params });
  return unwrapPayload(response);
};

export const getMyOrderTracking = async (orderId) => {
  const response = await axiosInstance.get(`${apiBase}/orders/${orderId}/track`);
  return unwrapPayload(response);
};

export const getMyWishlist = async (params = {}) => {
  const response = await axiosInstance.get(`${apiBase}/users/me/wishlist`, { params });
  return unwrapPayload(response);
};

export const getMyAddresses = async () => {
  const response = await axiosInstance.get(`${apiBase}/users/me/addresses`);
  return unwrapPayload(response);
};

export const createMyAddress = async (payload) => {
  const response = await axiosInstance.post(`${apiBase}/users/me/addresses`, payload);
  return unwrapPayload(response);
};

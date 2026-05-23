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

export const getProductReviews = async (productId, params = {}) => {
  const response = await axiosInstance.get(`${apiBase}/reviews/product/${productId}`, { params });
  // Return the full response object (data, breakdown, meta)
  return response?.data;
};

export const submitProductReview = async (payload) => {
  const response = await axiosInstance.post(`${apiBase}/reviews`, payload);
  return unwrapPayload(response);
};

export const toggleReviewHelpful = async (reviewId) => {
  const response = await axiosInstance.post(`${apiBase}/reviews/${reviewId}/helpful`);
  return unwrapPayload(response);
};

export const flagReview = async (reviewId, payload) => {
  const response = await axiosInstance.post(`${apiBase}/reviews/${reviewId}/flag`, payload);
  return unwrapPayload(response);
};
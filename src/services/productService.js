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

const asArray = (value) => (Array.isArray(value) ? value : []);

export const mapProductToCard = (product = {}) => {
  const price = Number(product.price || 0);
  const comparePrice = Number(product.comparePrice || 0);
  const off = comparePrice > price && comparePrice > 0
    ? Math.round(((comparePrice - price) / comparePrice) * 100)
    : null;

  return {
    id: product.id,
    slug: product.slug,
    name: (product.name || 'Unnamed Product').replace(/esuuq/ig, 'Kulmi'),
    store: (product.merchant?.storeName || 'Marketplace Store').replace(/esuuq/ig, 'Kulmi'),
    price: `$${price.toFixed(2)}`,
    old: comparePrice > 0 ? `$${comparePrice.toFixed(2)}` : '',
    rating: product.avgRating || 0,
    reviews: product.reviewCount || 0,
    image: asArray(product.images)[0] || '',
    badge: product.isFeatured ? 'HOT' : off && off >= 30 ? 'SALE' : '',
    off: off ? `-${off}%` : '',
    wishlist: false,
  };
};

export const browseProducts = async (params = {}, signal) => {
  const response = await axiosInstance.get(`${apiBase}/products`, { params, signal });
  return unwrapPayload(response);
};

export const getFeaturedProducts = async (limit = 12) => {
  const response = await axiosInstance.get(`${apiBase}/products/featured`, {
    params: { limit },
  });
  return unwrapPayload(response);
};

export const getTrendingProducts = async (limit = 12) => {
  const response = await axiosInstance.get(`${apiBase}/products/trending`, {
    params: { limit },
  });
  return unwrapPayload(response);
};

export const getCategoryCounts = async () => {
  const response = await axiosInstance.get(`${apiBase}/products/category-counts`);
  return unwrapPayload(response); // { [slug]: number }
};

export const getProductById = async (id) => {
  const response = await axiosInstance.get(`${apiBase}/products/${id}`);
  return unwrapPayload(response);
};

export const getProductBySlug = async (slug) => {
  const response = await axiosInstance.get(`${apiBase}/products/slug/${slug}`);
  return unwrapPayload(response);
};

export const createProduct = async (payload) => {
  // When sending FormData, let the browser/axios set the Content-Type (boundary)
  const response = await axiosInstance.post(`${apiBase}/products`, payload);
  return unwrapPayload(response);
};

export const updateProduct = async (id, payload) => {
  const response = await axiosInstance.put(`${apiBase}/products/${id}`, payload);
  return unwrapPayload(response);
};

export const restockProduct = async (id, quantity) => {
  const response = await axiosInstance.put(`${apiBase}/products/${id}/restock`, { quantity });
  return unwrapPayload(response);
};

export const removeProduct = async (id) => {
  const response = await axiosInstance.delete(`${apiBase}/products/${id}`);
  return unwrapPayload(response);
};

export const searchProducts = async (params = {}, signal) => {
  const response = await axiosInstance.get(`${apiBase}/search`, { params, signal });
  return unwrapPayload(response);
};

export const searchAutocomplete = async (q, limit = 8, category = '') => {
  const response = await axiosInstance.get(`${apiBase}/search/autocomplete`, {
    params: { q, limit, ...(category && { category }) },
  });
  return unwrapPayload(response);
};

export const getTrendingSearches = async (limit = 10) => {
  const response = await axiosInstance.get(`${apiBase}/search/trending`, {
    params: { limit },
  });
  return unwrapPayload(response);
};

export const getRelatedProducts = async (productId, limit = 8) => {
  const response = await axiosInstance.get(`${apiBase}/search/related/${productId}`, {
    params: { limit },
  });
  return unwrapPayload(response);
};

export const browseCategory = async (slug, params = {}, signal) => {
  const response = await axiosInstance.get(`${apiBase}/search/category/${slug}`, { params, signal });
  return unwrapPayload(response);
};

export const flagProduct = async (id, payload) => {
  const response = await axiosInstance.post(`${apiBase}/products/${id}/flag`, payload);
  return unwrapPayload(response);
};

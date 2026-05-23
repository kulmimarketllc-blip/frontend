import axiosInstance from './axiosInstance';
import { API_CONFIG } from '../config/constants';

const cleanBase = (API_CONFIG.BASE_URL || '').replace(/\/+$/, '');
const userBase = /\/v\d+$/.test(cleanBase) ? '/users' : '/v1/users';

const unwrapPayload = (response) => {
  const body = response?.data;
  if (body && typeof body === 'object' && Object.prototype.hasOwnProperty.call(body, 'data')) {
    return body.data;
  }
  return body;
};

export const getMyProfile = async () => {
  const response = await axiosInstance.get(`${userBase}/me`);
  return unwrapPayload(response);
};

export const updateMyProfile = async (payload) => {
  const response = await axiosInstance.put(`${userBase}/me`, payload);
  return unwrapPayload(response);
};

export const changeMyPassword = async (currentPassword, newPassword) => {
  const response = await axiosInstance.patch(`${userBase}/me/password`, {
    currentPassword,
    newPassword,
  });
  return unwrapPayload(response);
};

export const deactivateMyAccount = async () => {
  const response = await axiosInstance.delete(`${userBase}/me`);
  return unwrapPayload(response);
};

export const deleteMyAccount = async (confirmText, currentPassword) => {
  const response = await axiosInstance.delete(`${userBase}/me/account`, {
    data: {
      confirmText,
      currentPassword: currentPassword || undefined,
    },
  });
  return unwrapPayload(response);
};

export const getMyAddresses = async () => {
  const response = await axiosInstance.get(`${userBase}/me/addresses`);
  return unwrapPayload(response);
};

export const createMyAddress = async (payload) => {
  const response = await axiosInstance.post(`${userBase}/me/addresses`, payload);
  return unwrapPayload(response);
};

export const updateMyAddress = async (addressId, payload) => {
  const response = await axiosInstance.put(`${userBase}/me/addresses/${addressId}`, payload);
  return unwrapPayload(response);
};

export const setMyDefaultAddress = async (addressId) => {
  const response = await axiosInstance.patch(`${userBase}/me/addresses/${addressId}/default`);
  return unwrapPayload(response);
};

export const deleteMyAddress = async (addressId) => {
  const response = await axiosInstance.delete(`${userBase}/me/addresses/${addressId}`);
  return unwrapPayload(response);
};

export const getMySettings = async () => {
  const response = await axiosInstance.get(`${userBase}/me/settings`);
  return unwrapPayload(response);
};

export const updateMySettings = async (payload) => {
  const response = await axiosInstance.patch(`${userBase}/me/settings`, payload);
  return unwrapPayload(response);
};
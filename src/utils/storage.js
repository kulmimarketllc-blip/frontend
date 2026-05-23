import { STORAGE_KEYS } from '../config/constants';

export const setKeepSignedIn = (keep) => {
  localStorage.setItem('keepSignedIn', keep ? 'true' : 'false');
};

const getStorage = () => localStorage.getItem('keepSignedIn') === 'false' ? sessionStorage : localStorage;

export const getToken = () => {
  return sessionStorage.getItem(STORAGE_KEYS.TOKEN) || localStorage.getItem(STORAGE_KEYS.TOKEN) || null;
};

export const setToken = (token) => {
  getStorage().setItem(STORAGE_KEYS.TOKEN, token);
};

export const removeToken = () => {
  sessionStorage.removeItem(STORAGE_KEYS.TOKEN);
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
};

export const getUser = () => {
  const user = sessionStorage.getItem(STORAGE_KEYS.USER) || localStorage.getItem(STORAGE_KEYS.USER);
  return user ? JSON.parse(user) : null;
};

export const setUser = (user) => {
  getStorage().setItem(STORAGE_KEYS.USER, JSON.stringify(user));
};

export const removeUser = () => {
  sessionStorage.removeItem(STORAGE_KEYS.USER);
  localStorage.removeItem(STORAGE_KEYS.USER);
};

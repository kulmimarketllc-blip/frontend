import { ENV } from './env';

/* ----------------------------- App ----------------------------- */
export const APP_CONFIG = Object.freeze({
  NAME: 'React Boilerplate',
  VERSION: '1.0.0',
  DEFAULT_LANGUAGE: 'en',
  DEFAULT_THEME: 'light',
  PAGINATION: {
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
  },
});

/* ----------------------------- API ----------------------------- */
export const API_CONFIG = Object.freeze({
  BASE_URL: ENV.API_BASE_URL,
  TIMEOUT: ENV.IS_DEV ? 10_000 : 5_000,
  WITH_CREDENTIALS: false,
});

/* ----------------------------- Auth ---------------------------- */
export const AUTH_CONFIG = Object.freeze({
  TOKEN_KEY: 'auth_token',
  USER_KEY: 'auth_user',
  LOGIN_REDIRECT: '/dashboard',
  LOGOUT_REDIRECT: '/login',
});

/* --------------------------- Storage --------------------------- */
export const STORAGE_KEYS = Object.freeze({
  TOKEN: AUTH_CONFIG.TOKEN_KEY,
  USER: AUTH_CONFIG.USER_KEY,
  THEME: 'app_theme',
});

/* ---------------------------- Theme ---------------------------- */
export const THEME_CONFIG = Object.freeze({
  STORAGE_KEY: STORAGE_KEYS.THEME,
  MODES: {
    LIGHT: 'light',
    DARK: 'dark',
  },
});

import axios from 'axios';
import { API_CONFIG } from '../config/constants';
import {
  getToken,
  removeToken,
  removeUser,
  setToken,
} from '../utils/storage';

const axiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

let refreshPromise = null;

const cleanBase = (API_CONFIG.BASE_URL || '').replace(/\/+$/, '');
const authRefreshPath = /\/v\d+$/.test(cleanBase) ? '/auth/refresh' : '/v1/auth/refresh';

const isAuthRoute = (url = '') => {
  const path = String(url || '').toLowerCase();
  return /\/auth\/(login|register|verify-otp|refresh|forgot-password|reset-password|resend-otp|google)/.test(path);
};

const unwrapRefreshPayload = (response) => {
  const body = response?.data;
  if (body && typeof body === 'object' && Object.prototype.hasOwnProperty.call(body, 'data')) {
    return body.data;
  }
  return body;
};

const refreshAccessToken = async () => {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(authRefreshPath, {}, {
        baseURL: API_CONFIG.BASE_URL,
        timeout: API_CONFIG.TIMEOUT,
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' },
      })
      .then((response) => {
        const payload = unwrapRefreshPayload(response);
        const nextToken = payload?.accessToken;
        if (!nextToken) {
          throw new Error('Refresh response missing access token');
        }
        setToken(nextToken);
        return nextToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Let the browser set multipart boundaries for FormData uploads.
    if (config?.data instanceof FormData) {
      if (config.headers) {
        delete config.headers['Content-Type'];
        delete config.headers['content-type'];
      }
    }

    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Only for non-error responses
// Error handling is delegated to apiExecutor for Redux thunks
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error?.config;
    const status = error?.response?.status;
    const requestUrl = String(originalRequest?.url || '');

    if (
      status === 401
      && originalRequest
      && !originalRequest._retry
      && !isAuthRoute(requestUrl)
    ) {
      originalRequest._retry = true;
      try {
        const nextAccessToken = await refreshAccessToken();
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${nextAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        removeToken();
        removeUser();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

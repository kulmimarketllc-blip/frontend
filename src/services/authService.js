import axiosInstance from './axiosInstance';
import { API_CONFIG } from '../config/constants';
import { getToken, getUser, removeToken, removeUser, setToken, setUser } from '../utils/storage';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase/auth';

const cleanBase = (API_CONFIG.BASE_URL || '').replace(/\/+$/, '');
const authBase = /\/v\d+$/.test(cleanBase) ? '/auth' : '/v1/auth';

const unwrapPayload = (response) => {
  const body = response?.data;
  if (body && typeof body === 'object' && Object.prototype.hasOwnProperty.call(body, 'data')) {
    return body.data;
  }
  return body;
};

const persistSession = (accessToken, user) => {
  if (accessToken) setToken(accessToken);
  if (user) setUser(user);
};

export const register = async (userData) => {
  const response = await axiosInstance.post(`${authBase}/register`, userData, {
    withCredentials: true,
  });
  return unwrapPayload(response);
};

export const registerMerchant = async (merchantData) => {
  const response = await axiosInstance.post(`${authBase}/register-merchant`, merchantData, {
    withCredentials: true,
  });
  return unwrapPayload(response);
};

export const login = async (email, password) => {
  const response = await axiosInstance.post(
    `${authBase}/login`,
    { email, password },
    { withCredentials: true }
  );
  const payload = unwrapPayload(response);
  const { accessToken, user } = payload || {};
  persistSession(accessToken, user);
  return payload;
};

export const verifyOtp = async (userId, otp) => {
  const response = await axiosInstance.post(
    `${authBase}/verify-otp`,
    { userId, otp },
    { withCredentials: true }
  );
  const payload = unwrapPayload(response);
  const { accessToken, user } = payload || {};
  persistSession(accessToken, user);
  return payload;
};

export const resendOtp = async (email, type) => {
  const response = await axiosInstance.post(`${authBase}/resend-otp`, { email, type });
  return unwrapPayload(response);
};

export const refreshToken = async () => {
  const response = await axiosInstance.post(`${authBase}/refresh`, {}, { withCredentials: true });

  const payload = unwrapPayload(response);

  if (payload?.accessToken) {
    setToken(payload.accessToken);
  }

  return payload;
};

export const fetchCurrentUser = async () => {
  const response = await axiosInstance.get(`${authBase}/me`, {
    withCredentials: true,
  });
  const payload = unwrapPayload(response);

  if (payload) {
    setUser(payload);
  }
  return payload;
};

export const checkAuth = async () => {
  try {
    let user;
    const token = getToken();

    if (!token) {
      await refreshToken();
      user = await fetchCurrentUser();
    } else {
      try {
        user = await fetchCurrentUser();
      } catch {
        await refreshToken();
        user = await fetchCurrentUser();
      }
    }

    return { isAuthenticated: true, user };
  } catch {
    removeToken();
    removeUser();
    return { isAuthenticated: false, user: null };
  }
};

export const logout = async () => {
  try {
    await axiosInstance.post(`${authBase}/logout`, {}, { withCredentials: true });
  } finally {
    removeToken();
    removeUser();
  }
};

export const getCurrentUser = () => getUser();

export const startGoogleOAuth = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  const idToken = await result.user.getIdToken();

  const response = await axiosInstance.post(
    `${authBase}/google`,
    { idToken },
    { withCredentials: true }
  );

  const payload = unwrapPayload(response);
  const { accessToken, user } = payload || {};
  persistSession(accessToken, user);
  return payload;
};

export const forgotPassword = async (email) => {
  const response = await axiosInstance.post(`${authBase}/forgot-password`, { email });
  return unwrapPayload(response);
};

export const resetPassword = async (email, otp, newPassword) => {
  const response = await axiosInstance.post(`${authBase}/reset-password`, {
    email,
    otp,
    newPassword,
  });
  return unwrapPayload(response);
};

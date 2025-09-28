import { createAxiosInstance } from '../utils/axiosInstance';
import { logoutUserAPI } from '../services/authServices';
import {
  clearAccessToken,
  getAccessToken,
  updateAccessToken,
} from '../context/tokenManagerContext';

export const adminApi = createAxiosInstance({
  role: 'admin',
  tokenManager: {
    getToken: () => getAccessToken('ADMIN'),
    updateToken: (token) => updateAccessToken('ADMIN', token),
    clearToken: () => clearAccessToken('ADMIN'),
  },
  refreshEndpoint: '/api/admin/refresh-token',
  loginPath: '/admin/login',
});

export const userApi = createAxiosInstance({
  role: 'user',
  tokenManager: {
    getToken: () => getAccessToken('USER'),
    updateToken: (token) => updateAccessToken('USER', token),
    clearToken: () => clearAccessToken('USER'),
  },
  refreshEndpoint: '/api/user/refresh-token',
  loginPath: '/login',
  logoutFn: async () => {
    await logoutUserAPI();
  },
});

export const doctorApi = createAxiosInstance({
  role: 'doctor',
  tokenManager: {
    getToken: () => getAccessToken('DOCTOR'),
    updateToken: (token) => updateAccessToken('DOCTOR', token),
    clearToken: () => clearAccessToken('DOCTOR'),
  },
  refreshEndpoint: '/api/doctor/refresh-token',
  loginPath: '/doctor/login',
});

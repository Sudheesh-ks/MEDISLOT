import axios, { type AxiosRequestConfig } from 'axios';
import {
  clearUserAccessToken,
  getUserAccessToken,
  updateUserAccessToken,
} from '../context/tokenManagerUser';
import { logoutUserAPI } from '../services/authServices';

export const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
});

api.interceptors.request.use((cfg) => {
  const token = getUserAccessToken();
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

let isRefreshing = false;
let queue: ((tok: string) => void)[] = [];

function subscribe(cb: (tok: string) => void) {
  queue.push(cb);
}

function onRefreshed(tok: string) {
  queue.forEach((cb) => cb(tok));
  queue = [];
  isRefreshing = false;
}

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config as AxiosRequestConfig & { _retry?: boolean };

    if (err.response?.status === 403) {
      await logoutUserAPI();
      clearUserAccessToken();
      window.location.href = '/login';
      return Promise.reject(err);
    }

    if (err.response?.status !== 401 || original._retry) {
      return Promise.reject(err);
    }
    original._retry = true;

    if (isRefreshing) {
      return new Promise((resolve) => {
        subscribe((tok) => {
          original.headers!.Authorization = `Bearer ${tok}`;
          resolve(api(original));
        });
      });
    }

    isRefreshing = true;
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/refresh-token`,
        {},
        { withCredentials: true }
      );

      const newTok: string = data.accessToken ?? data.token;
      updateUserAccessToken(newTok);

      onRefreshed(newTok);

      original.headers!.Authorization = `Bearer ${newTok}`;
      return api(original);
    } catch (e) {
      isRefreshing = false;
      queue = [];
      return Promise.reject(e);
    }
  }
);

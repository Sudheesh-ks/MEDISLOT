import axios, { type AxiosRequestConfig } from 'axios';
import { getAdminAccessToken, updateAdminAccessToken } from '../context/tokenManagerAdmin';

export const adminApi = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
});

adminApi.interceptors.request.use((cfg) => {
  const token = getAdminAccessToken();
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

let isRefreshing = false;
let queue: ((tok: string) => void)[] = [];
const subscribe = (cb: (t: string) => void) => queue.push(cb);
const onRefreshed = (t: string) => {
  queue.forEach((cb) => cb(t));
  queue = [];
  isRefreshing = false;
};

adminApi.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config as AxiosRequestConfig & { _retry?: boolean };
    if (err.response?.status !== 401 || original._retry) {
      return Promise.reject(err);
    }
    original._retry = true;

    if (isRefreshing) {
      return new Promise((resolve) =>
        subscribe((t) => {
          original.headers!.Authorization = `Bearer ${t}`;
          resolve(adminApi(original));
        })
      );
    }

    isRefreshing = true;
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/refresh-token`,
        {},
        { withCredentials: true }
      );
      const newTok: string = data.accessToken ?? data.token;
      updateAdminAccessToken(newTok);

      onRefreshed(newTok);

      original.headers!.Authorization = `Bearer ${newTok}`;
      return adminApi(original);
    } catch (e) {
      isRefreshing = false;
      queue = [];
      return Promise.reject(e);
    }
  }
);

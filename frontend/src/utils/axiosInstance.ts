import axios, { type AxiosRequestConfig } from 'axios';

type Role = 'admin' | 'user' | 'doctor';

interface TokenManager {
  getToken: () => string | null;
  updateToken: (t: string) => void;
  clearToken: () => void;
}

interface InstanceOptions {
  role: Role;
  tokenManager: TokenManager;
  refreshEndpoint: string;
  loginPath: string;
  logoutFn?: () => Promise<void> | void;
}

export function createAxiosInstance({
  role,
  tokenManager,
  refreshEndpoint,
  loginPath,
  logoutFn,
}: InstanceOptions) {
  const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    withCredentials: true,
  });

  // Attaching token to every request
  api.interceptors.request.use((cfg) => {
    const token = tokenManager.getToken();
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

  api.interceptors.response.use(
    (res) => res,
    async (err) => {
      const original = err.config as AxiosRequestConfig & { _retry?: boolean };

      // Allowing login request to fail normally
      if (original.url?.includes(`/${role}/login`)) {
        return Promise.reject(err);
      }

      if (err.response?.status === 403) {
        if (logoutFn) await logoutFn();
        tokenManager.clearToken();
        window.location.href = loginPath;
        return Promise.reject(err);
      }

      if (err.response?.status !== 401 || original._retry) {
        return Promise.reject(err);
      }

      original._retry = true;

      if (isRefreshing) {
        return new Promise((resolve) =>
          subscribe((t) => {
            original.headers!.Authorization = `Bearer ${t}`;
            resolve(api(original));
          })
        );
      }

      isRefreshing = true;
      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}${refreshEndpoint}`,
          {},
          { withCredentials: true }
        );

        const newTok: string = data.accessToken ?? data.token;
        tokenManager.updateToken(newTok);

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

  return api;
}

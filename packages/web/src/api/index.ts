import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://vip-ride-api.onrender.com",
  timeout: 30000, // 30 seconds for payment operations
  headers: {
    "Content-Type": "application/json",
  },
});

const ADMIN_TOKEN_KEY = "adminToken";

api.interceptors.request.use((config) => {
  const isAdminEndpoint =
    typeof config.url === "string" && config.url.startsWith("/api/admin");
  const isAuthLogin = typeof config.url === "string" && config.url.startsWith("/api/admin/auth/login");

  if (
    typeof window !== "undefined" &&
    isAdminEndpoint &&
    !isAuthLogin
  ) {
    const token = localStorage.getItem(ADMIN_TOKEN_KEY);
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

export { api };
export const apiClient = {
  get<T = unknown>(url: string, config?: AxiosRequestConfig) {
    return api.get<T>(url, config).then((response: AxiosResponse<T>) => response.data);
  },
  post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return api
      .post<T>(url, data, config)
      .then((response: AxiosResponse<T>) => response.data);
  },
  put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return api
      .put<T>(url, data, config)
      .then((response: AxiosResponse<T>) => response.data);
  },
  delete<T = unknown>(url: string, config?: AxiosRequestConfig) {
    return api
      .delete<T>(url, config)
      .then((response: AxiosResponse<T>) => response.data);
  },
};


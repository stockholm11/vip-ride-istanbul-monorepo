import { apiClient } from "../index";

interface LoginResponse {
  token: string;
}

export const adminLogin = (email: string, password: string) => {
  return apiClient.post<LoginResponse>("/api/admin/auth/login", { email, password });
};

export interface AdminProfile {
  id: number;
  email: string;
  role: string;
}

export const getAdminProfile = () => {
  return apiClient.get<AdminProfile>("/api/admin/auth/me");
};



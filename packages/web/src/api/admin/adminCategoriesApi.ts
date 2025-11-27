import { apiClient } from "../index";

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  createdAt?: string;
}

export interface CategoryPayload {
  name: string;
  slug: string;
}

export const getCategories = () => {
  return apiClient.get<AdminCategory[]>("/api/admin/tour-categories");
};

export const createCategory = (data: CategoryPayload) => {
  return apiClient.post<AdminCategory>("/api/admin/tour-categories", data);
};

export const updateCategory = (id: string, data: CategoryPayload) => {
  return apiClient.put<AdminCategory>(`/api/admin/tour-categories/${id}`, data);
};

export const deleteCategory = (id: string) => {
  return apiClient.delete<void>(`/api/admin/tour-categories/${id}`);
};



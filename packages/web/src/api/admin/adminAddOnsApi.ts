import { apiClient } from "../index";

export interface AdminAddOn {
  id: string;
  name: string;
  shortDescription?: string | null;
  price: number;
  isActive: boolean;
  displayOrder: number;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface AddOnPayload {
  name: string;
  shortDescription?: string | null;
  price: number;
  isActive: boolean;
  displayOrder: number;
}

export const getAddOns = () => {
  return apiClient.get<AdminAddOn[]>("/api/admin/add-ons");
};

export const createAddOn = (data: AddOnPayload) => {
  return apiClient.post<AdminAddOn>("/api/admin/add-ons", data);
};

export const updateAddOn = (id: string, data: Partial<AddOnPayload>) => {
  return apiClient.put<AdminAddOn>(`/api/admin/add-ons/${id}`, data);
};

export const deleteAddOn = (id: string) => {
  return apiClient.delete<void>(`/api/admin/add-ons/${id}`);
};


import { apiClient } from "../index";

type VehicleType = "transfer" | "chauffeur";

export interface AdminVehicle {
  id: string;
  name: string;
  slug: string;
  types: VehicleType[];
  capacity: number;
  basePrice: number;
  kmPrice: number;
  imageUrl?: string | null;
  description?: string | null;
  createdAt?: string;
}

export interface VehiclePayload {
  name: string;
  slug: string;
  types: VehicleType[];
  capacity: number;
  basePrice: number;
  kmPrice: number;
  imageUrl?: string | null;
  description?: string | null;
}

export const getVehicles = () => {
  return apiClient.get<AdminVehicle[]>("/api/admin/vehicles");
};

export const createVehicle = (data: VehiclePayload) => {
  return apiClient.post<AdminVehicle>("/api/admin/vehicles", data);
};

export const updateVehicle = (id: string, data: VehiclePayload) => {
  return apiClient.put<AdminVehicle>(`/api/admin/vehicles/${id}`, data);
};

export const deleteVehicle = (id: string) => {
  return apiClient.delete<void>(`/api/admin/vehicles/${id}`);
};



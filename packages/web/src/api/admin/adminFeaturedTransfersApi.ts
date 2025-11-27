import { apiClient } from "../index";

export interface AdminFeaturedTransfer {
  id: string;
  vehicleId: string;
  vehicleName: string | null;
  vehicleSlug: string | null;
  vehicleImage: string | null;
  passengerCapacity: number | null;
  luggageCapacity: number | null;
  fromLocation: string;
  toLocation: string;
  estimatedTime: string;
  basePrice: number;
  displayOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface FeaturedTransferPayload {
  vehicleId: string;
  fromLocation: string;
  toLocation: string;
  estimatedTime: string;
  basePrice: number;
  displayOrder?: number;
  isActive?: boolean;
}

export const getAdminFeaturedTransfers = () => {
  return apiClient.get<AdminFeaturedTransfer[]>("/api/admin/featured-transfers");
};

export const createFeaturedTransfer = (payload: FeaturedTransferPayload) => {
  return apiClient.post<AdminFeaturedTransfer>("/api/admin/featured-transfers", payload);
};

export const updateFeaturedTransfer = (id: string, payload: Partial<FeaturedTransferPayload>) => {
  return apiClient.put<AdminFeaturedTransfer>(`/api/admin/featured-transfers/${id}`, payload);
};

export const deleteFeaturedTransfer = (id: string) => {
  return apiClient.delete<void>(`/api/admin/featured-transfers/${id}`);
};



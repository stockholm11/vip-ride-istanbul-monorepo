import { apiClient } from "../index";

export interface AdminTour {
  id: string;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  vehicleId: string;
  vehicleName: string;
  vehicleSlug: string;
  title: string;
  slug: string;
  shortDescription?: string | null;
  longDescription?: string | null;
  price: number;
  imageUrl?: string | null;
  durationMinutes?: number | null;
  durationHours?: number | null;
  capacity?: number | null;
  isActive?: boolean;
  createdAt?: string;
}

export interface TourPayload {
  categoryId: string;
  vehicleId: string;
  title: string;
  slug: string;
  shortDescription?: string | null;
  longDescription?: string | null;
  price: number;
  imageUrl?: string | null;
  durationHours: number;
  capacity: number;
  isActive?: boolean;
}

export const getTours = () => {
  return apiClient.get<AdminTour[]>("/api/admin/tours");
};

export const createTour = (data: TourPayload) => {
  return apiClient.post<AdminTour>("/api/admin/tours", data);
};

export const updateTour = (id: string, data: TourPayload) => {
  return apiClient.put<AdminTour>(`/api/admin/tours/${id}`, data);
};

export const deleteTour = (id: string) => {
  return apiClient.delete<void>(`/api/admin/tours/${id}`);
};



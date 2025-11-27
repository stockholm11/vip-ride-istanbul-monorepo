import { apiClient } from "../index";

type ReservationStatus = "pending" | "paid" | "failed";
type ReservationTypeFilter = "transfer" | "tour" | "chauffeur";

export interface AdminReservationAddOn {
  addOnId: string;
  addOnName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface AdminReservation {
  id: string;
  userFullName: string;
  userEmail: string;
  userPhone?: string | null;
  vehicleId?: string | null;
  vehicleName?: string | null;
  vehicleSlug?: string | null;
  tourId?: number | null;
  tourTitle?: string | null;
  tourSlug?: string | null;
  pickupLocation?: string | null;
  dropoffLocation?: string | null;
  pickupDatetime?: string | null;
  passengers: number;
  totalPrice: number;
  paymentStatus: ReservationStatus;
  reservationType?: string | null;
  createdAt: string;
  additionalPassengers?: { firstName: string; lastName: string }[];
  addOns?: AdminReservationAddOn[];
}

export interface ReservationQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: ReservationTypeFilter;
  dateFrom?: string;
  dateTo?: string;
}

export interface ReservationPaginatedResponse {
  data: AdminReservation[];
  total: number;
}

export const getReservations = (params: ReservationQueryParams = {}) => {
  return apiClient.get<ReservationPaginatedResponse>("/api/admin/reservations", {
    params,
  });
};


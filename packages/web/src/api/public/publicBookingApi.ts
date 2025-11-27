import { apiClient } from "../index";

export type ReservationType = "transfer" | "tour" | "chauffeur";

export interface PassengerInfoPayload {
  firstName: string;
  lastName: string;
}

export interface AddOnPayload {
  addOnId: string;
  quantity: number;
}

export interface CreateReservationPayload {
  type: ReservationType;
  vehicleId?: number;
  tourId?: number;
  userFullname: string;
  userFullName?: string;
  userEmail: string;
  userPhone?: string;
  pickupLocation: string;
  dropoffLocation?: string;
  pickupDatetime: string;
  passengers: number;
  distanceKm?: number;
  totalPrice: number;
  reservationType?: string;
  additionalPassengers?: PassengerInfoPayload[];
  addOns?: AddOnPayload[];
}

export interface ReservationResponse {
  id: number;
  userFullName: string;
  userEmail: string;
  userPhone?: string | null;
  vehicleId?: number | null;
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
  paymentStatus?: string | null;
  createdAt?: string;
  additionalPassengers?: PassengerInfoPayload[];
}

export const createReservation = (payload: CreateReservationPayload) => {
  const body = {
    ...payload,
    userFullName: payload.userFullName ?? payload.userFullname,
  };

  return apiClient.post<ReservationResponse>("/api/reservations", body);
};



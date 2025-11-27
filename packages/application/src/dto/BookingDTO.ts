import { ReservationStatus } from "@vip-ride/domain/enums/ReservationStatus";
import { AdditionalPassengerDTO } from "./ReservationDTO";

export interface ReservationAddOnResponseDTO {
  addOnId: string;
  addOnName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface BookingDTO {
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
  additionalPassengers?: AdditionalPassengerDTO[];
  addOns?: ReservationAddOnResponseDTO[];
}


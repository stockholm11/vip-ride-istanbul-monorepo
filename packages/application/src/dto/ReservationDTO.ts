export interface AdditionalPassengerDTO {
  firstName: string;
  lastName: string;
}

export interface ReservationAddOnDTO {
  addOnId: string;
  quantity: number;
}

export interface CreateReservationDTO {
  userFullName: string;
  userEmail: string;
  userPhone?: string;
  vehicleId?: string | null;
  tourId?: number | null;
  pickupLocation?: string | null;
  dropoffLocation?: string | null;
  pickupDate?: string;
  pickupTime?: string;
  pickupDatetime?: string;
  passengers: number;
  totalPrice: number;
  reservationType?: string | null;
  additionalPassengers?: AdditionalPassengerDTO[];
  addOns?: ReservationAddOnDTO[];
}


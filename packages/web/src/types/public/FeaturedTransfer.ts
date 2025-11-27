export interface PublicFeaturedTransfer {
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
}



export interface FeaturedTransferDTO {
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

export interface CreateFeaturedTransferDTO {
  vehicleId: string;
  fromLocation: string;
  toLocation: string;
  estimatedTime: string;
  basePrice: number;
  displayOrder?: number;
  isActive?: boolean;
}

export interface UpdateFeaturedTransferDTO {
  vehicleId?: string;
  fromLocation?: string;
  toLocation?: string;
  estimatedTime?: string;
  basePrice?: number;
  displayOrder?: number;
  isActive?: boolean;
}



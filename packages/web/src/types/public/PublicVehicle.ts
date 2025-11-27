export type PublicVehicleType = "transfer" | "chauffeur";

export interface PublicVehicle {
  id: number;
  name: string;
  slug: string;
  types: PublicVehicleType[];
  mainImage: string | null;
  gallery: string[];
  passengerCapacity: number;
  luggageCapacity: number;
  basePrice: number;
  kmPrice: number;
  baseMultiplier: number;
  features: string[];
  popular: boolean;
  descriptionShort: string;
  descriptionLong: string;
  sortOrder: number;
}

export interface VehicleWithPrice extends PublicVehicle {
  price?: number;
  discountedPrice?: number;
}



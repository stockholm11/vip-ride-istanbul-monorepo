export type PublicVehicleType = "transfer" | "chauffeur";

export interface VehiclePublicDTO {
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



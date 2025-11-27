import { VehicleType } from "@vip-ride/domain/entities/Vehicle";

export interface VehicleDTO {
  id: string;
  name: string;
  slug: string;
  types: VehicleType[];
  capacity: number;
  basePrice: number;
  kmPrice: number;
  imageUrl?: string | null;
  description?: string | null;
  createdAt?: string;
}


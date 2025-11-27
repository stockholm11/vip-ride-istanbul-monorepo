import { Vehicle, VehicleType } from "../entities/Vehicle";

export interface VehiclePersistenceInput {
  name: string;
  slug: string;
  types: VehicleType[];
  capacity: number;
  basePrice: number;
  kmPrice: number;
  imageUrl?: string | null;
  description?: string | null;
}

export interface IVehicleRepository {
  findAll(): Promise<Vehicle[]>;
  findByType(type: VehicleType): Promise<Vehicle[]>;
  findAllAdmin(): Promise<Vehicle[]>;
  findById(id: string): Promise<Vehicle | null>;
  create(data: VehiclePersistenceInput): Promise<Vehicle>;
  update(id: string, data: VehiclePersistenceInput): Promise<Vehicle | null>;
  delete(id: string): Promise<void>;
}


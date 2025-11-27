import { Tour } from "../entities/Tour";

export interface TourPersistenceInput {
  categoryId: string;
  vehicleId: string;
  title: string;
  slug: string;
  shortDescription?: string | null;
  longDescription?: string | null;
  price: number;
  imageUrl?: string | null;
  durationMinutes: number;
  capacity: number;
  isActive?: boolean;
}

export interface ITourRepository {
  findAll(): Promise<Tour[]>;
  findAllAdmin(): Promise<Tour[]>;
  findById(id: string): Promise<Tour | null>;
  create(data: TourPersistenceInput): Promise<Tour>;
  update(id: string, data: TourPersistenceInput): Promise<Tour | null>;
  delete(id: string): Promise<void>;
}


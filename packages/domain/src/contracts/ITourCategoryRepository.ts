import { TourCategory } from "../entities/TourCategory";

export interface TourCategoryPersistenceInput {
  name: string;
  slug: string;
}

export interface ITourCategoryRepository {
  findAll(): Promise<TourCategory[]>;
  findAllAdmin(): Promise<TourCategory[]>;
  findById(id: string): Promise<TourCategory | null>;
  create(data: TourCategoryPersistenceInput): Promise<TourCategory>;
  update(id: string, data: TourCategoryPersistenceInput): Promise<TourCategory | null>;
  delete(id: string): Promise<void>;
}


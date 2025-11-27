import { FeaturedTransfer } from "../entities/FeaturedTransfer";

export interface FeaturedTransferPersistenceInput {
  vehicleId: string;
  fromLocation: string;
  toLocation: string;
  estimatedTime: string;
  basePrice: number;
  displayOrder?: number;
  isActive?: boolean;
}

export interface IFeaturedTransferRepository {
  findActive(): Promise<FeaturedTransfer[]>;
  findAll(): Promise<FeaturedTransfer[]>;
  findById(id: string): Promise<FeaturedTransfer | null>;
  create(data: FeaturedTransferPersistenceInput): Promise<FeaturedTransfer>;
  update(id: string, data: FeaturedTransferPersistenceInput): Promise<FeaturedTransfer | null>;
  delete(id: string): Promise<void>;
}



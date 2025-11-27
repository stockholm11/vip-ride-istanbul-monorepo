import { IFeaturedTransferRepository } from "@vip-ride/domain/contracts/IFeaturedTransferRepository";
import { FeaturedTransfer } from "@vip-ride/domain/entities/FeaturedTransfer";
import {
  FeaturedTransferDTO,
  UpdateFeaturedTransferDTO,
} from "../../dto/FeaturedTransferDTO";

export class UpdateFeaturedTransferUseCase {
  constructor(private readonly repository: IFeaturedTransferRepository) {}

  async execute(id: string, input: UpdateFeaturedTransferDTO): Promise<FeaturedTransferDTO> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error("Featured transfer not found");
    }

    const data = existing.data;
    const persistenceInput = {
      vehicleId: input.vehicleId ?? data.vehicleId,
      fromLocation: input.fromLocation ?? data.fromLocation,
      toLocation: input.toLocation ?? data.toLocation,
      estimatedTime: input.estimatedTime ?? data.estimatedTime,
      basePrice: input.basePrice ?? data.basePrice,
      displayOrder: input.displayOrder ?? data.displayOrder,
      isActive: input.isActive ?? data.isActive,
    };

    const saved = await this.repository.update(id, persistenceInput);
    if (!saved) {
      throw new Error("Failed to update featured transfer");
    }

    return this.mapToDTO(saved);
  }

  private mapToDTO(transfer: FeaturedTransfer): FeaturedTransferDTO {
    const data = transfer.data;
    return {
      id: data.id ?? "",
      vehicleId: data.vehicleId,
      vehicleName: data.vehicleName ?? null,
      vehicleSlug: data.vehicleSlug ?? null,
      vehicleImage: data.vehicleImage ?? null,
      passengerCapacity: data.passengerCapacity ?? null,
      luggageCapacity: data.luggageCapacity ?? null,
      fromLocation: data.fromLocation,
      toLocation: data.toLocation,
      estimatedTime: data.estimatedTime,
      basePrice: data.basePrice,
      displayOrder: data.displayOrder ?? 0,
      isActive: data.isActive ?? true,
      createdAt: data.createdAt?.toISOString(),
      updatedAt: data.updatedAt?.toISOString(),
    };
  }
}



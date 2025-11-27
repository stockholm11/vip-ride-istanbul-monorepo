import { IFeaturedTransferRepository } from "@vip-ride/domain/contracts/IFeaturedTransferRepository";
import { FeaturedTransfer } from "@vip-ride/domain/entities/FeaturedTransfer";
import {
  CreateFeaturedTransferDTO,
  FeaturedTransferDTO,
} from "../../dto/FeaturedTransferDTO";

export class CreateFeaturedTransferUseCase {
  constructor(private readonly repository: IFeaturedTransferRepository) {}

  async execute(input: CreateFeaturedTransferDTO): Promise<FeaturedTransferDTO> {
    const persistenceInput = {
      vehicleId: input.vehicleId,
      fromLocation: input.fromLocation.trim(),
      toLocation: input.toLocation.trim(),
      estimatedTime: input.estimatedTime.trim(),
      basePrice: Number(input.basePrice),
      displayOrder: input.displayOrder ?? 0,
      isActive: input.isActive ?? true,
    };

    const created = await this.repository.create(persistenceInput);
    return this.mapToDTO(created);
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



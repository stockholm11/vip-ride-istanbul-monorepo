import { IFeaturedTransferRepository } from "@vip-ride/domain/contracts/IFeaturedTransferRepository";
import { FeaturedTransfer } from "@vip-ride/domain/entities/FeaturedTransfer";
import { FeaturedTransferDTO } from "../../dto/FeaturedTransferDTO";

interface GetFeaturedTransfersOptions {
  activeOnly?: boolean;
}

export class GetFeaturedTransfersUseCase {
  constructor(private readonly repository: IFeaturedTransferRepository) {}

  async execute(options: GetFeaturedTransfersOptions = {}): Promise<FeaturedTransferDTO[]> {
    const { activeOnly = true } = options;
    const transfers = activeOnly
      ? await this.repository.findActive()
      : await this.repository.findAll();

    return transfers.map((transfer) => this.mapToDTO(transfer.data));
  }

  private mapToDTO(data: FeaturedTransfer["data"]): FeaturedTransferDTO {
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



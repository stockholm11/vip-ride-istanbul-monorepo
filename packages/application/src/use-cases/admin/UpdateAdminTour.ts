import {
  ITourRepository,
  TourPersistenceInput,
} from "@vip-ride/domain/contracts/ITourRepository";
import { IVehicleRepository } from "@vip-ride/domain/contracts/IVehicleRepository";
import { TourDTO } from "../../dto/TourDTO";
import { mapTourToDTO } from "./GetAdminTours";

export type UpdateAdminTourInput = TourPersistenceInput;

export class UpdateAdminTourUseCase {
  constructor(
    private readonly tourRepository: ITourRepository,
    private readonly vehicleRepository: IVehicleRepository
  ) {}

  async execute(id: string, input: UpdateAdminTourInput): Promise<TourDTO | null> {
    const capacity = await this.resolveCapacity(input.vehicleId, input.capacity);
    const tour = await this.tourRepository.update(id, {
      ...input,
      capacity,
    });
    return tour ? mapTourToDTO(tour) : null;
  }

  private async resolveCapacity(
    vehicleId: string,
    fallback?: number | null
  ): Promise<number> {
    if (fallback && fallback > 0) {
      return fallback;
    }
    const vehicle = await this.vehicleRepository.findById(vehicleId);
    if (vehicle?.data.capacity && vehicle.data.capacity > 0) {
      return vehicle.data.capacity;
    }
    return 1;
  }
}


import { IVehicleRepository } from "@vip-ride/domain/contracts/IVehicleRepository";
import { Vehicle } from "@vip-ride/domain/entities/Vehicle";
import { VehicleDTO } from "../../dto/VehicleDTO";

export const mapVehicleToDTO = (vehicle: Vehicle): VehicleDTO => ({
  id: vehicle.data.id,
  name: vehicle.data.name,
  slug: vehicle.data.slug,
  types: vehicle.data.types,
  capacity: vehicle.data.capacity,
  basePrice: vehicle.data.basePrice,
  kmPrice: vehicle.data.kmPrice,
  imageUrl: vehicle.data.imageUrl ?? null,
  description: vehicle.data.description ?? null,
  createdAt: vehicle.data.createdAt?.toISOString(),
});

export class GetAdminVehiclesUseCase {
  constructor(private readonly vehicleRepository: IVehicleRepository) {}

  async execute(): Promise<VehicleDTO[]> {
    const vehicles = await this.vehicleRepository.findAllAdmin();
    return vehicles.map(mapVehicleToDTO);
  }
}


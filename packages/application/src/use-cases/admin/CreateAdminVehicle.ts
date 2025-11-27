import {
  IVehicleRepository,
  VehiclePersistenceInput,
} from "@vip-ride/domain/contracts/IVehicleRepository";
import { VehicleDTO } from "../../dto/VehicleDTO";
import { mapVehicleToDTO } from "./GetAdminVehicles";

export type CreateAdminVehicleInput = VehiclePersistenceInput;

export class CreateAdminVehicleUseCase {
  constructor(private readonly vehicleRepository: IVehicleRepository) {}

  async execute(input: CreateAdminVehicleInput): Promise<VehicleDTO> {
    const vehicle = await this.vehicleRepository.create(input);
    return mapVehicleToDTO(vehicle);
  }
}


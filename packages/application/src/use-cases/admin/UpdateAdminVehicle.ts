import {
  IVehicleRepository,
  VehiclePersistenceInput,
} from "@vip-ride/domain/contracts/IVehicleRepository";
import { VehicleDTO } from "../../dto/VehicleDTO";
import { mapVehicleToDTO } from "./GetAdminVehicles";

export type UpdateAdminVehicleInput = VehiclePersistenceInput;

export class UpdateAdminVehicleUseCase {
  constructor(private readonly vehicleRepository: IVehicleRepository) {}

  async execute(id: string, input: UpdateAdminVehicleInput): Promise<VehicleDTO | null> {
    const vehicle = await this.vehicleRepository.update(id, input);
    return vehicle ? mapVehicleToDTO(vehicle) : null;
  }
}


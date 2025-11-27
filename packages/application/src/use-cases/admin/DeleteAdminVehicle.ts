import { IVehicleRepository } from "@vip-ride/domain/contracts/IVehicleRepository";

export class DeleteAdminVehicleUseCase {
  constructor(private readonly vehicleRepository: IVehicleRepository) {}

  async execute(id: string): Promise<void> {
    await this.vehicleRepository.delete(id);
  }
}


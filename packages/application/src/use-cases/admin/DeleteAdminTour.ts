import { ITourRepository } from "@vip-ride/domain/contracts/ITourRepository";

export class DeleteAdminTourUseCase {
  constructor(private readonly tourRepository: ITourRepository) {}

  async execute(id: string): Promise<void> {
    await this.tourRepository.delete(id);
  }
}


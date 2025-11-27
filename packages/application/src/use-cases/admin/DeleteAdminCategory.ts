import { ITourCategoryRepository } from "@vip-ride/domain/contracts/ITourCategoryRepository";

export class DeleteAdminCategoryUseCase {
  constructor(private readonly categoryRepository: ITourCategoryRepository) {}

  async execute(id: string): Promise<void> {
    await this.categoryRepository.delete(id);
  }
}


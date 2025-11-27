import { IFeaturedTransferRepository } from "@vip-ride/domain/contracts/IFeaturedTransferRepository";

export class DeleteFeaturedTransferUseCase {
  constructor(private readonly repository: IFeaturedTransferRepository) {}

  async execute(id: string): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error("Featured transfer not found");
    }

    await this.repository.delete(id);
  }
}



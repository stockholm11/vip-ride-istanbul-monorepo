import { IAddOnRepository } from "@vip-ride/domain/contracts/IAddOnRepository";

export class DeleteAddOnUseCase {
  constructor(private readonly addOnRepository: IAddOnRepository) {}

  async execute(id: string): Promise<void> {
    const existing = await this.addOnRepository.findById(id);
    if (!existing) {
      throw new Error("Add-on not found");
    }

    await this.addOnRepository.delete(id);
  }
}


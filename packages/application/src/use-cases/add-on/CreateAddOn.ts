import { IAddOnRepository } from "@vip-ride/domain/contracts/IAddOnRepository";
import { AddOnDTO, CreateAddOnDTO } from "../../dto/AddOnDTO";

export class CreateAddOnUseCase {
  constructor(private readonly addOnRepository: IAddOnRepository) {}

  async execute(input: CreateAddOnDTO): Promise<AddOnDTO> {
    if (!input.name || input.name.trim().length === 0) {
      throw new Error("Add-on name is required");
    }

    if (input.price < 0) {
      throw new Error("Add-on price must be non-negative");
    }

    const addOn = await this.addOnRepository.save({
      name: input.name.trim(),
      shortDescription: input.shortDescription?.trim() || null,
      price: input.price,
      isActive: input.isActive ?? true,
      displayOrder: input.displayOrder ?? 0,
    });

    return {
      id: addOn.id,
      name: addOn.name,
      shortDescription: addOn.shortDescription,
      price: addOn.price,
      isActive: addOn.isActive,
      displayOrder: addOn.displayOrder,
      createdAt: addOn.createdAt,
      updatedAt: addOn.updatedAt,
    };
  }
}


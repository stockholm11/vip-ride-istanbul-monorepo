import { IAddOnRepository } from "@vip-ride/domain/contracts/IAddOnRepository";
import { AddOnDTO, UpdateAddOnDTO } from "../../dto/AddOnDTO";

export class UpdateAddOnUseCase {
  constructor(private readonly addOnRepository: IAddOnRepository) {}

  async execute(id: string, input: UpdateAddOnDTO): Promise<AddOnDTO> {
    const existing = await this.addOnRepository.findById(id);
    if (!existing) {
      throw new Error("Add-on not found");
    }

    if (input.name !== undefined && input.name.trim().length === 0) {
      throw new Error("Add-on name cannot be empty");
    }

    if (input.price !== undefined && input.price < 0) {
      throw new Error("Add-on price must be non-negative");
    }

    const updateData: Partial<{
      name: string;
      shortDescription: string | null;
      price: number;
      isActive: boolean;
      displayOrder: number;
    }> = {};

    if (input.name !== undefined) {
      updateData.name = input.name.trim();
    }
    if (input.shortDescription !== undefined) {
      updateData.shortDescription = input.shortDescription?.trim() || null;
    }
    if (input.price !== undefined) {
      updateData.price = input.price;
    }
    if (input.isActive !== undefined) {
      updateData.isActive = input.isActive;
    }
    if (input.displayOrder !== undefined) {
      updateData.displayOrder = input.displayOrder;
    }

    const updated = await this.addOnRepository.update(id, updateData);

    return {
      id: updated.id,
      name: updated.name,
      shortDescription: updated.shortDescription,
      price: updated.price,
      isActive: updated.isActive,
      displayOrder: updated.displayOrder,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }
}


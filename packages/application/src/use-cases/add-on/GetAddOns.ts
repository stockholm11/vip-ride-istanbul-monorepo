import { IAddOnRepository } from "@vip-ride/domain/contracts/IAddOnRepository";
import { AddOnDTO } from "../../dto/AddOnDTO";

export class GetAddOnsUseCase {
  constructor(private readonly addOnRepository: IAddOnRepository) {}

  async execute(activeOnly: boolean = false): Promise<AddOnDTO[]> {
    const addOns = activeOnly
      ? await this.addOnRepository.findActive()
      : await this.addOnRepository.findAll();

    return addOns.map((addOn) => ({
      id: addOn.id,
      name: addOn.name,
      shortDescription: addOn.shortDescription,
      price: addOn.price,
      isActive: addOn.isActive,
      displayOrder: addOn.displayOrder,
      createdAt: addOn.createdAt,
      updatedAt: addOn.updatedAt,
    }));
  }
}


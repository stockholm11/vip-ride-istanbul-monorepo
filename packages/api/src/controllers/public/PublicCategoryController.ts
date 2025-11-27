import { Request, Response } from "express";
import { ITourCategoryRepository } from "@vip-ride/domain/contracts/ITourCategoryRepository";
import { TourCategory } from "@vip-ride/domain/entities/TourCategory";
import { CategoryPublicDTO } from "@vip-ride/application/dtos/public/CategoryPublicDTO";

export class PublicCategoryController {
  constructor(private readonly tourCategoryRepository: ITourCategoryRepository) {}

  list = async (_req: Request, res: Response) => {
    const categories = await this.tourCategoryRepository.findAll();
    const data = categories.map((category, index) =>
      this.mapCategoryToPublicDTO(category, index)
    );
    return res.json(data);
  };

  private mapCategoryToPublicDTO(
    category: TourCategory,
    index: number
  ): CategoryPublicDTO {
    const data = category.data;
    const sortOrder = index + 1;

    return {
      id: Number.parseInt(data.id, 10) || sortOrder,
      name: data.name,
      slug: data.slug,
      description: "",
      sortOrder,
    };
  }
}



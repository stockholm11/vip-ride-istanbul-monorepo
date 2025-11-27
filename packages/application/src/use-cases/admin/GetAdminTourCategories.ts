import { ITourCategoryRepository } from "@vip-ride/domain/contracts/ITourCategoryRepository";
import { TourCategory } from "@vip-ride/domain/entities/TourCategory";
import { CategoryDTO } from "../../dto/CategoryDTO";

export const mapCategoryToDTO = (category: TourCategory): CategoryDTO => ({
  id: category.data.id,
  name: category.data.name,
  slug: category.data.slug,
  createdAt: category.data.createdAt?.toISOString(),
});

export class GetAdminTourCategoriesUseCase {
  constructor(private readonly tourCategoryRepository: ITourCategoryRepository) {}

  async execute(): Promise<CategoryDTO[]> {
    const categories = await this.tourCategoryRepository.findAllAdmin();
    return categories.map(mapCategoryToDTO);
  }
}


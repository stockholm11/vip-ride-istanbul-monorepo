import {
  ITourCategoryRepository,
  TourCategoryPersistenceInput,
} from "@vip-ride/domain/contracts/ITourCategoryRepository";
import { CategoryDTO } from "../../dto/CategoryDTO";
import { mapCategoryToDTO } from "./GetAdminTourCategories";

export type UpdateAdminCategoryInput = TourCategoryPersistenceInput;

export class UpdateAdminCategoryUseCase {
  constructor(private readonly categoryRepository: ITourCategoryRepository) {}

  async execute(id: string, input: UpdateAdminCategoryInput): Promise<CategoryDTO | null> {
    const category = await this.categoryRepository.update(id, input);
    return category ? mapCategoryToDTO(category) : null;
  }
}


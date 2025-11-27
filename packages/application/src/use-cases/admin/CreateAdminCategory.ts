import {
  ITourCategoryRepository,
  TourCategoryPersistenceInput,
} from "@vip-ride/domain/contracts/ITourCategoryRepository";
import { CategoryDTO } from "../../dto/CategoryDTO";
import { mapCategoryToDTO } from "./GetAdminTourCategories";

export type CreateAdminCategoryInput = TourCategoryPersistenceInput;

export class CreateAdminCategoryUseCase {
  constructor(private readonly categoryRepository: ITourCategoryRepository) {}

  async execute(input: CreateAdminCategoryInput): Promise<CategoryDTO> {
    const category = await this.categoryRepository.create(input);
    return mapCategoryToDTO(category);
  }
}


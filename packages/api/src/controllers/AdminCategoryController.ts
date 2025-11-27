import { Request, Response } from "express";
import { GetAdminTourCategoriesUseCase } from "@vip-ride/application/use-cases/admin/GetAdminTourCategories";
import { CreateAdminCategoryUseCase } from "@vip-ride/application/use-cases/admin/CreateAdminCategory";
import { UpdateAdminCategoryUseCase } from "@vip-ride/application/use-cases/admin/UpdateAdminCategory";
import { DeleteAdminCategoryUseCase } from "@vip-ride/application/use-cases/admin/DeleteAdminCategory";

export class AdminCategoryController {
  constructor(
    private readonly getAdminTourCategories: GetAdminTourCategoriesUseCase,
    private readonly createAdminCategory: CreateAdminCategoryUseCase,
    private readonly updateAdminCategory: UpdateAdminCategoryUseCase,
    private readonly deleteAdminCategory: DeleteAdminCategoryUseCase
  ) {}

  list = async (_req: Request, res: Response) => {
    const categories = await this.getAdminTourCategories.execute();
    return res.json(categories);
  };

  create = async (req: Request, res: Response) => {
    const category = await this.createAdminCategory.execute(req.body);
    return res.status(201).json(category);
  };

  update = async (req: Request, res: Response) => {
    const category = await this.updateAdminCategory.execute(req.params.id, req.body);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    return res.json(category);
  };

  delete = async (req: Request, res: Response) => {
    await this.deleteAdminCategory.execute(req.params.id);
    return res.status(204).send();
  };
}


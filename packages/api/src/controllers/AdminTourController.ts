import { Request, Response } from "express";
import { GetAdminToursUseCase } from "@vip-ride/application/use-cases/admin/GetAdminTours";
import { CreateAdminTourUseCase } from "@vip-ride/application/use-cases/admin/CreateAdminTour";
import { UpdateAdminTourUseCase } from "@vip-ride/application/use-cases/admin/UpdateAdminTour";
import { DeleteAdminTourUseCase } from "@vip-ride/application/use-cases/admin/DeleteAdminTour";

const parsePositiveNumber = (value: unknown, fallback: number): number => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
};

export class AdminTourController {
  constructor(
    private readonly getAdminTours: GetAdminToursUseCase,
    private readonly createAdminTour: CreateAdminTourUseCase,
    private readonly updateAdminTour: UpdateAdminTourUseCase,
    private readonly deleteAdminTour: DeleteAdminTourUseCase
  ) {}

  list = async (_req: Request, res: Response) => {
    const tours = await this.getAdminTours.execute();
    return res.json(tours);
  };

  create = async (req: Request, res: Response) => {
    const { durationHours: durationHoursRaw, isActive, ...rest } = req.body ?? {};
    // Parse durationHours: convert string to number, ensure it's between 1-12, default to 1
    const durationHours = Math.max(1, Math.min(12, parsePositiveNumber(durationHoursRaw, 1)));
    // Parse isActive: explicitly convert to boolean (undefined/false/null -> false, true/1/"true"/"1" -> true)
    const parsedIsActive = Boolean(isActive === true || isActive === "true" || isActive === 1 || isActive === "1");
    const payload = {
      ...rest,
      durationMinutes: durationHours * 60,
      isActive: parsedIsActive,
    };
    const tour = await this.createAdminTour.execute(payload);
    return res.status(201).json(tour);
  };

  update = async (req: Request, res: Response) => {
    const { durationHours: durationHoursRaw, isActive, ...rest } = req.body ?? {};
    // Parse durationHours: convert string to number, ensure it's between 1-12, default to 1
    const durationHours = Math.max(1, Math.min(12, parsePositiveNumber(durationHoursRaw, 1)));
    // Parse isActive: explicitly convert to boolean (undefined/false/null -> false, true/1/"true"/"1" -> true)
    const parsedIsActive = Boolean(isActive === true || isActive === "true" || isActive === 1 || isActive === "1");
    const payload = {
      ...rest,
      durationMinutes: durationHours * 60,
      isActive: parsedIsActive,
    };
    const tour = await this.updateAdminTour.execute(req.params.id, payload);
    if (!tour) {
      return res.status(404).json({ message: "Tour not found" });
    }
    return res.json(tour);
  };

  delete = async (req: Request, res: Response) => {
    await this.deleteAdminTour.execute(req.params.id);
    return res.status(204).send();
  };
}


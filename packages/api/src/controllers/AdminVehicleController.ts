import { Request, Response } from "express";
import { GetAdminVehiclesUseCase } from "@vip-ride/application/use-cases/admin/GetAdminVehicles";
import { CreateAdminVehicleUseCase } from "@vip-ride/application/use-cases/admin/CreateAdminVehicle";
import { UpdateAdminVehicleUseCase } from "@vip-ride/application/use-cases/admin/UpdateAdminVehicle";
import { DeleteAdminVehicleUseCase } from "@vip-ride/application/use-cases/admin/DeleteAdminVehicle";

export class AdminVehicleController {
  constructor(
    private readonly getAdminVehicles: GetAdminVehiclesUseCase,
    private readonly createAdminVehicle: CreateAdminVehicleUseCase,
    private readonly updateAdminVehicle: UpdateAdminVehicleUseCase,
    private readonly deleteAdminVehicle: DeleteAdminVehicleUseCase
  ) {}

  list = async (_req: Request, res: Response) => {
    const vehicles = await this.getAdminVehicles.execute();
    return res.json(vehicles);
  };

  create = async (req: Request, res: Response) => {
    // Normalize types: handle string, array, or undefined
    let types: string[] = ["transfer"];
    
    // Debug logging
    if (process.env.NODE_ENV === "development") {
      console.log("[AdminVehicleController] CREATE - req.body.types:", {
        value: req.body.types,
        type: typeof req.body.types,
        isArray: Array.isArray(req.body.types),
      });
    }
    
    if (req.body.types !== undefined && req.body.types !== null) {
      if (Array.isArray(req.body.types)) {
        // Filter valid types and remove duplicates
        const validTypes = (req.body.types as unknown[]).filter(
          (t): t is string => typeof t === "string" && (t === "transfer" || t === "chauffeur")
        );
        types = validTypes.length > 0 ? [...new Set(validTypes)] : ["transfer"];
      } else if (typeof req.body.types === "string") {
        // Handle comma-separated string or JSON string
        try {
          const parsed = JSON.parse(req.body.types);
          if (Array.isArray(parsed)) {
            const validTypes = (parsed as unknown[]).filter(
              (t): t is string => typeof t === "string" && (t === "transfer" || t === "chauffeur")
            );
            types = validTypes.length > 0 ? [...new Set(validTypes)] : ["transfer"];
          }
        } catch {
          // If not JSON, treat as comma-separated
          const split = req.body.types.split(",").map((t: string) => t.trim()).filter(Boolean) as string[];
          const validTypes = split.filter(
            (t: string): t is string => t === "transfer" || t === "chauffeur"
          );
          types = validTypes.length > 0 ? [...new Set(validTypes)] : ["transfer"];
        }
      }
    }

    // Debug logging
    if (process.env.NODE_ENV === "development") {
      console.log("[AdminVehicleController] CREATE - normalized types:", types);
    }

    const payload = {
      ...req.body,
      types,
    };
    const vehicle = await this.createAdminVehicle.execute(payload);
    return res.status(201).json(vehicle);
  };

  update = async (req: Request, res: Response) => {
    // Normalize types: handle string, array, or undefined
    let types: string[] = ["transfer"];
    
    // Debug logging
    if (process.env.NODE_ENV === "development") {
      console.log("[AdminVehicleController] UPDATE - req.body.types:", {
        value: req.body.types,
        type: typeof req.body.types,
        isArray: Array.isArray(req.body.types),
      });
    }
    
    if (req.body.types !== undefined && req.body.types !== null) {
      if (Array.isArray(req.body.types)) {
        // Filter valid types and remove duplicates
        const validTypes = (req.body.types as unknown[]).filter(
          (t): t is string => typeof t === "string" && (t === "transfer" || t === "chauffeur")
        );
        types = validTypes.length > 0 ? [...new Set(validTypes)] : ["transfer"];
      } else if (typeof req.body.types === "string") {
        // Handle comma-separated string or JSON string
        try {
          const parsed = JSON.parse(req.body.types);
          if (Array.isArray(parsed)) {
            const validTypes = (parsed as unknown[]).filter(
              (t): t is string => typeof t === "string" && (t === "transfer" || t === "chauffeur")
            );
            types = validTypes.length > 0 ? [...new Set(validTypes)] : ["transfer"];
          }
        } catch {
          // If not JSON, treat as comma-separated
          const split = req.body.types.split(",").map((t: string) => t.trim()).filter(Boolean) as string[];
          const validTypes = split.filter(
            (t: string): t is string => t === "transfer" || t === "chauffeur"
          );
          types = validTypes.length > 0 ? [...new Set(validTypes)] : ["transfer"];
        }
      }
    }

    // Debug logging
    if (process.env.NODE_ENV === "development") {
      console.log("[AdminVehicleController] UPDATE - normalized types:", types);
    }

    const payload = {
      ...req.body,
      types,
    };
    const vehicle = await this.updateAdminVehicle.execute(req.params.id, payload);
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }
    return res.json(vehicle);
  };

  delete = async (req: Request, res: Response) => {
    await this.deleteAdminVehicle.execute(req.params.id);
    return res.status(204).send();
  };
}


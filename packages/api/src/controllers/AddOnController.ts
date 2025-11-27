import { Request, Response } from "express";
import { GetAddOnsUseCase } from "@vip-ride/application/use-cases/add-on/GetAddOns";
import { CreateAddOnUseCase } from "@vip-ride/application/use-cases/add-on/CreateAddOn";
import { UpdateAddOnUseCase } from "@vip-ride/application/use-cases/add-on/UpdateAddOn";
import { DeleteAddOnUseCase } from "@vip-ride/application/use-cases/add-on/DeleteAddOn";

export class AddOnController {
  constructor(
    private readonly getAddOnsUseCase: GetAddOnsUseCase,
    private readonly createAddOnUseCase: CreateAddOnUseCase,
    private readonly updateAddOnUseCase: UpdateAddOnUseCase,
    private readonly deleteAddOnUseCase: DeleteAddOnUseCase
  ) {}

  list = async (req: Request, res: Response) => {
    try {
      const activeOnly = req.query.active === "true";
      const addOns = await this.getAddOnsUseCase.execute(activeOnly);
      return res.json(addOns);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch add-ons" });
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const addOn = await this.createAddOnUseCase.execute(req.body);
      return res.status(201).json(addOn);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: "Failed to create add-on" });
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const addOn = await this.updateAddOnUseCase.execute(id, req.body);
      return res.json(addOn);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Add-on not found") {
          return res.status(404).json({ error: error.message });
        }
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: "Failed to update add-on" });
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await this.deleteAddOnUseCase.execute(id);
      return res.status(204).send();
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Add-on not found") {
          return res.status(404).json({ error: error.message });
        }
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: "Failed to delete add-on" });
    }
  };
}


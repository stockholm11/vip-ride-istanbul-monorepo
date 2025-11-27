import { Request, Response } from "express";
import { GetFeaturedTransfersUseCase } from "@vip-ride/application/use-cases/featured-transfer/GetFeaturedTransfers";
import { CreateFeaturedTransferUseCase } from "@vip-ride/application/use-cases/featured-transfer/CreateFeaturedTransfer";
import { UpdateFeaturedTransferUseCase } from "@vip-ride/application/use-cases/featured-transfer/UpdateFeaturedTransfer";
import { DeleteFeaturedTransferUseCase } from "@vip-ride/application/use-cases/featured-transfer/DeleteFeaturedTransfer";

export class FeaturedTransferController {
  constructor(
    private readonly getFeaturedTransfersUseCase: GetFeaturedTransfersUseCase,
    private readonly createFeaturedTransferUseCase: CreateFeaturedTransferUseCase,
    private readonly updateFeaturedTransferUseCase: UpdateFeaturedTransferUseCase,
    private readonly deleteFeaturedTransferUseCase: DeleteFeaturedTransferUseCase
  ) {}

  listPublic = async (_req: Request, res: Response) => {
    try {
      const transfers = await this.getFeaturedTransfersUseCase.execute({ activeOnly: true });
      return res.json(transfers);
    } catch (error) {
      console.error("[FeaturedTransferController][listPublic] error:", error);
      return res.status(500).json({ error: "Failed to fetch featured transfers" });
    }
  };

  listAdmin = async (_req: Request, res: Response) => {
    try {
      const transfers = await this.getFeaturedTransfersUseCase.execute({ activeOnly: false });
      return res.json(transfers);
    } catch (error) {
      console.error("[FeaturedTransferController][listAdmin] error:", error);
      return res.status(500).json({ error: "Failed to fetch featured transfers" });
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const transfer = await this.createFeaturedTransferUseCase.execute(req.body);
      return res.status(201).json(transfer);
    } catch (error) {
      console.error("[FeaturedTransferController][create] error:", error);
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: "Failed to create featured transfer" });
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const transfer = await this.updateFeaturedTransferUseCase.execute(id, req.body);
      return res.json(transfer);
    } catch (error) {
      console.error("[FeaturedTransferController][update] error:", error);
      if (error instanceof Error) {
        const status = error.message === "Featured transfer not found" ? 404 : 400;
        return res.status(status).json({ error: error.message });
      }
      return res.status(500).json({ error: "Failed to update featured transfer" });
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await this.deleteFeaturedTransferUseCase.execute(id);
      return res.status(204).send();
    } catch (error) {
      console.error("[FeaturedTransferController][delete] error:", error);
      if (error instanceof Error) {
        const status = error.message === "Featured transfer not found" ? 404 : 400;
        return res.status(status).json({ error: error.message });
      }
      return res.status(500).json({ error: "Failed to delete featured transfer" });
    }
  };
}



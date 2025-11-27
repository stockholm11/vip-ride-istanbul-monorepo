import { Router } from "express";
import { PricingController } from "../controllers/PricingController";

export function createPricingRoutes(pricingController: PricingController): Router {
  const router = Router();

  router.post("/transfer", pricingController.calculateTransferPrice);
  router.post("/chauffeur", pricingController.calculateChauffeurPrice);
  router.post("/tour", pricingController.calculateTourPrice);

  return router;
}


import { Router } from "express";
import { PublicVehicleController } from "../controllers/public/PublicVehicleController";
import { PublicTourController } from "../controllers/public/PublicTourController";
import { PublicCategoryController } from "../controllers/public/PublicCategoryController";
import { AddOnController } from "../controllers/AddOnController";
import { FeaturedTransferController } from "../controllers/FeaturedTransferController";
import { ContactController } from "../controllers/ContactController";

interface PublicRoutesDeps {
  vehicleController: PublicVehicleController;
  tourController: PublicTourController;
  categoryController: PublicCategoryController;
  addOnController: AddOnController;
  featuredTransferController: FeaturedTransferController;
  contactController: ContactController;
}

export function createPublicRoutes({
  vehicleController,
  tourController,
  categoryController,
  addOnController,
  featuredTransferController,
  contactController,
}: PublicRoutesDeps): Router {
  const router = Router();

  router.get("/vehicles", vehicleController.list);
  router.get("/tours", tourController.list);
  router.get("/tours/:slug", tourController.detail);
  router.get("/tour-categories", categoryController.list);
  router.get("/add-ons", addOnController.list);
  router.get("/featured-transfers", featuredTransferController.listPublic);
  router.post("/contact", contactController.sendMessage);

  return router;
}

